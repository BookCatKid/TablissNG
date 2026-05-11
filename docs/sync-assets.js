const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const docsDir = __dirname;

const filesToSync = [
  { from: "CHANGELOG.md", to: "docs/changelog.md" },
  { from: "CONTRIBUTING.md", to: "docs/community/contributing.md" },
  { from: "TRANSLATING.md", to: "docs/community/translating.md" },
  { from: "BUILDING.md", to: "docs/developing/building.md" },
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

function syncAll() {
  filesToSync.forEach((f) => copyFile(f.from, f.to));
  dirsToSync.forEach((d) => copyDir(d.from, d.to));
}

console.log("Syncing shared assets to docs...");
syncAll();
console.log("Asset sync complete.");

const watchMode = process.argv.includes("--watch");
const serveMode = process.argv.includes("--serve");

if (watchMode) {
  console.log("Watching shared assets for changes...");

  // Debounce per destination so a flurry of fs events results in one sync.
  const pending = new Map();
  function debounce(key, fn) {
    clearTimeout(pending.get(key));
    pending.set(
      key,
      setTimeout(() => {
        pending.delete(key);
        try {
          fn();
        } catch (err) {
          console.error(`Sync failed for ${key}:`, err);
        }
      }, 100),
    );
  }

  filesToSync.forEach(({ from, to }) => {
    const srcPath = path.join(rootDir, from);
    if (!fs.existsSync(srcPath)) return;
    try {
      fs.watch(srcPath, () => debounce(from, () => copyFile(from, to)));
    } catch (err) {
      console.warn(`Cannot watch ${from}:`, err.message);
    }
  });

  dirsToSync.forEach(({ from, to }) => {
    const srcPath = path.join(rootDir, from);
    if (!fs.existsSync(srcPath)) return;
    try {
      fs.watch(srcPath, { recursive: true }, () =>
        debounce(from, () => copyDir(from, to)),
      );
    } catch (err) {
      console.warn(`Cannot watch directory ${from}:`, err.message);
    }
  });

  if (serveMode) {
    const extraArgs = process.argv
      .slice(2)
      .filter((a) => a !== "--watch" && a !== "--serve");
    const child = spawn("pnpm", ["exec", "docusaurus", "start", ...extraArgs], {
      stdio: "inherit",
      cwd: docsDir,
      shell: process.platform === "win32",
    });
    child.on("exit", (code) => process.exit(code ?? 0));
    process.on("SIGINT", () => child.kill("SIGINT"));
    process.on("SIGTERM", () => child.kill("SIGTERM"));
  }
}
