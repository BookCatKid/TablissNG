const fs = require("fs");
const path = require("path");

const {
  localesDir,
  extractedMessagesPath,
  normalizeExtractedMessages,
  readJson,
  listLanguageFiles,
  getWhitelistedIds,
} = require("../shared");

function getUntranslatedKeys(
  defaultMessages,
  existingMessages,
  whitelistedIds,
) {
  const untranslated = [];
  for (const id of Object.keys(defaultMessages).sort()) {
    if (whitelistedIds.has(id)) continue;
    const existing = existingMessages[id];
    if (
      typeof existing !== "string" ||
      existing.length === 0 ||
      existing === defaultMessages[id]
    ) {
      untranslated.push(id);
    }
  }
  return untranslated;
}

function runStatus(targetLang, context) {
  if (!fs.existsSync(extractedMessagesPath)) {
    console.log(
      "No extracted messages found. Run `npm run translations` first.\n",
    );
    process.exit(1);
  }
  const defaultMessages = normalizeExtractedMessages(
    readJson(extractedMessagesPath),
  );

  const languageFiles = targetLang
    ? [`${targetLang}.json`]
    : listLanguageFiles();

  let aggregateTranslated = 0;
  let aggregateTotal = 0;

  for (const languageFile of languageFiles) {
    const languagePath = path.join(localesDir, languageFile);
    if (!fs.existsSync(languagePath)) {
      console.error(`✗ Language file not found: ${languageFile}`);
      continue;
    }

    const existingMessages = readJson(languagePath);
    const whitelistedIds = getWhitelistedIds(languageFile);
    const untranslated = getUntranslatedKeys(
      defaultMessages,
      existingMessages,
      whitelistedIds,
    );

    const total = Object.keys(defaultMessages).length;
    const translated = total - untranslated.length;
    const pct = total > 0 ? ((translated / total) * 100).toFixed(1) : "100.0";

    aggregateTranslated += translated;
    aggregateTotal += total;

    if (targetLang) {
      if (untranslated.length > 0 && !context.quiet) {
        console.log(`\nUntranslated keys (${untranslated.length}):`);
        for (const id of untranslated) {
          console.log(`  - ${id}: "${defaultMessages[id]}"`);
        }
      } else if (!context.quiet) {
        console.log("\nNo untranslated keys.");
      }

      console.log(
        `\n${languageFile}: ${translated}/${total} (${pct}%) translated`,
      );
      continue;
    }

    console.log(`${languageFile}: ${translated}/${total} (${pct}%) translated`);
  }

  const aggregatePct = ((aggregateTranslated / aggregateTotal) * 100).toFixed(
    1,
  );
  console.log(
    `\nTotal: ${aggregateTranslated}/${aggregateTotal} (${aggregatePct}%) translated across ${languageFiles.length} languages`,
  );
}

module.exports = { runStatus };
