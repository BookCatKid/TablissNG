const fs = require("fs");
const path = require("path");

const {
  localesDir,
  listLanguageFiles,
  readJson,
  writeJsonIfChanged,
  validateMessageObject,
  formatSummaryLine,
  logInfo,
  sortKeys,
} = require("../shared");

function parsePurgeArgs(args) {
  const keyToPurge = args[0];

  if (!keyToPurge) {
    console.error("✗ Missing key to purge. Pass a translation key ID.");
    process.exit(1);
  }

  return { keyToPurge };
}

function runPurge(keyToPurge, context) {
  const languageFiles = listLanguageFiles();

  let languageFilesUpdated = 0;
  let whitelistFilesUpdated = 0;

  for (const languageFile of languageFiles) {
    const languagePath = path.join(localesDir, languageFile);
    if (!fs.existsSync(languagePath)) continue;

    const existingMessages = readJson(languagePath);
    if (!validateMessageObject(existingMessages, languageFile)) continue;

    if (keyToPurge in existingMessages) {
      delete existingMessages[keyToPurge];
      writeJsonIfChanged(languagePath, sortKeys(existingMessages), context);
      languageFilesUpdated += 1;
      logInfo(context, `  ${languageFile}: removed key`);
    }

    const language = languageFile.replace(/\.json$/, "");
    const whitelistPath = path.join(localesDir, `whitelist_${language}.json`);
    if (!fs.existsSync(whitelistPath)) continue;

    const whitelist = readJson(whitelistPath);
    if (!Array.isArray(whitelist)) continue;

    const originalLength = whitelist.length;
    const purgedWhitelist = whitelist.filter((id) => id !== keyToPurge);
    if (purgedWhitelist.length < originalLength) {
      writeJsonIfChanged(whitelistPath, purgedWhitelist.sort(), context);
      whitelistFilesUpdated += 1;
      logInfo(context, `    ↳ updated whitelist_${language}.json`);
    }
  }

  console.log(
    formatSummaryLine(
      `Purge complete. Updated ${languageFilesUpdated} language ${languageFilesUpdated === 1 ? "file" : "files"} and ${whitelistFilesUpdated} whitelist ${whitelistFilesUpdated === 1 ? "file" : "files"}.`,
      context,
    ),
  );
}

module.exports = { runPurge, parsePurgeArgs };
