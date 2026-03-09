const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const docsDir = __dirname;

const filesToSync = [
  { from: "CHANGELOG.md", to: "docs/changelog.md" },
  { from: "CONTRIBUTING.md", to: "docs/community/contributing.md" },
  { from: "TRANSLATING.md", to: "docs/community/translating.md" },
  { from: "BUILDING.md", to: "docs/getting-started/building.md" },
  { from: "src/views/shared/tabliss.svg", to: "static/img/logo.svg" },
];

const dirsToSync = [
  { from: "screenshots", to: "static/img/screenshots" },
  { from: "target/shared/icons", to: "static/img/icons" },
  { from: "assets/badges", to: "static/img/badges" },
];

function copyFile(from, to) {
  const srcPath = path.join(rootDir, from);
  const destPath = path.join(docsDir, to);

  if (fs.existsSync(srcPath)) {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
    console.log(`Synced: ${from} -> ${to}`);
  } else {
    console.warn(`Warning: Source file not found: ${srcPath}`);
  }
}

function copyDir(from, to) {
  const srcPath = path.join(rootDir, from);
  const destPath = path.join(docsDir, to);

  if (fs.existsSync(srcPath)) {
    if (fs.existsSync(destPath)) {
      fs.rmSync(destPath, { recursive: true, force: true });
    }
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.cpSync(srcPath, destPath, { recursive: true });
    console.log(`Synced Directory: ${from} -> ${to}`);
  } else {
    console.warn(`Warning: Source directory not found: ${srcPath}`);
  }
}

console.log("Syncing shared assets to docs...");
filesToSync.forEach((f) => copyFile(f.from, f.to));
dirsToSync.forEach((d) => copyDir(d.from, d.to));

console.log("Asset sync complete.");
