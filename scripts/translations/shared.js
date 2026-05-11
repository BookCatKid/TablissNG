const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..", "..");
const localesDir = path.join(rootDir, "src", "locales", "lang");
const extractedMessagesPath = path.join(
  rootDir,
  "src",
  "locales",
  "extractedMessages",
  "messages.json",
);

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    const rel = path.relative(rootDir, filePath);
    console.error(`\n✗ Failed to parse ${rel}: ${err.message}`);
    process.exit(1);
  }
}

function toJsonContent(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function writeJson(filePath, value, context) {
  const content = toJsonContent(value);
  if (context.dryRun) {
    return;
  }
  fs.writeFileSync(filePath, content);
}

function writeJsonIfChanged(filePath, value, context) {
  const content = toJsonContent(value);
  if (
    fs.existsSync(filePath) &&
    fs.readFileSync(filePath, "utf8") === content
  ) {
    return false;
  }

  if (!context.dryRun) {
    fs.writeFileSync(filePath, content);
  }
  return true;
}

function sortKeys(obj) {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)),
  );
}

function normalizeExtractedMessages(extracted) {
  const normalized = {};
  for (const [id, value] of Object.entries(extracted)) {
    normalized[id] = value.defaultMessage;
  }
  return normalized;
}

function listLanguageFiles() {
  return fs
    .readdirSync(localesDir)
    .filter((file) => file.endsWith(".json") && !file.startsWith("whitelist_"))
    .sort();
}

function getWhitelistedIds(languageFile) {
  const language = languageFile.replace(/\.json$/, "");
  const whitelistPath = path.join(localesDir, `whitelist_${language}.json`);
  if (!fs.existsSync(whitelistPath)) return new Set();
  const whitelist = readJson(whitelistPath);
  return new Set(Array.isArray(whitelist) ? whitelist : []);
}

function formatSummaryLine(message, context) {
  if (context.dryRun) {
    return `\n⊘ DRY RUN: ${message}`;
  }
  return `\n✓ ${message}`;
}

function logInfo(context, message) {
  if (!context.quiet) {
    console.log(message);
  }
}

function validateMessageObject(obj, filename) {
  if (!obj || Array.isArray(obj)) {
    console.error(`  ✗ ${filename}: invalid JSON, skipping.`);
    return false;
  }
  return true;
}

function runFormatjs(args) {
  return execFileSync("pnpm", ["exec", "formatjs", ...args], {
    cwd: rootDir,
    stdio: "inherit",
  });
}

function assertFormatjsInstalled() {
  try {
    execFileSync("pnpm", ["exec", "formatjs", "--version"], {
      cwd: rootDir,
      stdio: "pipe",
    });
  } catch {
    console.error("\n✗ Missing FormatJS CLI dependency: formatjs");
    console.error(
      "  Run `pnpm install` from the repository root, then try again.",
    );
    process.exit(1);
  }
}

function extractMessages() {
  assertFormatjsInstalled();

  try {
    runFormatjs([
      "extract",
      "src/**/*.{ts,tsx}",
      "--ignore",
      "**/*.d.ts",
      "--out-file",
      "src/locales/extractedMessages/messages.json",
    ]);
  } catch (err) {
    console.error(`\n✗ Failed to extract messages: ${err.message}`);
    process.exit(1);
  }
}

module.exports = {
  localesDir,
  extractedMessagesPath,
  readJson,
  writeJson,
  writeJsonIfChanged,
  normalizeExtractedMessages,
  extractMessages,
  listLanguageFiles,
  getWhitelistedIds,
  formatSummaryLine,
  logInfo,
  validateMessageObject,
  sortKeys,
};
