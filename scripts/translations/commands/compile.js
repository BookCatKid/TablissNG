const fs = require("fs");
const path = require("path");

const {
  localesDir,
  extractedMessagesPath,
  normalizeExtractedMessages,
  extractMessages,
  readJson,
  listLanguageFiles,
  getWhitelistedIds,
} = require("../shared");

const rootDir = path.resolve(__dirname, "..", "..", "..");
const compiledLocalesDir = path.join(
  rootDir,
  "src",
  "locales",
  "lang.compiled",
);

function ensureCleanCompiledDirectory() {
  fs.rmSync(compiledLocalesDir, { recursive: true, force: true });
  fs.mkdirSync(compiledLocalesDir, { recursive: true });
}

function toMinifiedJson(value) {
  return `${JSON.stringify(value)}\n`;
}

function writeMinifiedJson(filePath, value, context) {
  const content = toMinifiedJson(value);
  if (context.dryRun) return;
  fs.writeFileSync(filePath, content);
}

function compileLanguage(defaultMessages, existingMessages, whitelistedIds) {
  const compiled = {};

  for (const id of Object.keys(defaultMessages).sort()) {
    const defaultMessage = defaultMessages[id];
    const existingMessage = existingMessages[id];

    if (whitelistedIds.has(id)) {
      compiled[id] = defaultMessage;
      continue;
    }

    if (
      typeof existingMessage === "string" &&
      existingMessage.length > 0 &&
      existingMessage !== defaultMessage
    ) {
      compiled[id] = existingMessage;
    }
  }

  return compiled;
}

function runCompile(context) {
  if (!context.quiet) {
    console.log("⟳ Extracting messages from source...\n");
  }
  extractMessages();

  const defaultMessages = normalizeExtractedMessages(
    readJson(extractedMessagesPath),
  );
  const languageFiles = listLanguageFiles();

  if (!context.quiet) {
    console.log(
      `⟳ Compiling ${languageFiles.length} locale ${languageFiles.length === 1 ? "file" : "files"} for production...\n`,
    );
  }

  if (!context.dryRun) {
    ensureCleanCompiledDirectory();
  }

  let totalKeys = 0;

  for (const languageFile of languageFiles) {
    const sourcePath = path.join(localesDir, languageFile);
    const targetPath = path.join(compiledLocalesDir, languageFile);
    const existingMessages = readJson(sourcePath);
    const whitelistedIds = getWhitelistedIds(languageFile);
    const compiled = compileLanguage(
      defaultMessages,
      existingMessages,
      whitelistedIds,
    );
    totalKeys += Object.keys(compiled).length;
    writeMinifiedJson(targetPath, compiled, context);
  }

  if (context.dryRun) {
    console.log(
      `\n⊘ DRY RUN: would compile ${languageFiles.length} locale files (${totalKeys} keys total) to src/locales/lang.compiled`,
    );
    return;
  }

  console.log(
    `\n✓ Compiled ${languageFiles.length} locale files (${totalKeys} keys total) to src/locales/lang.compiled`,
  );
}

module.exports = { runCompile };
