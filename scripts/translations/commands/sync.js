const fs = require("fs");
const path = require("path");

const {
  localesDir,
  extractedMessagesPath,
  readJson,
  normalizeExtractedMessages,
  extractMessages,
  listLanguageFiles,
  getWhitelistedIds,
  formatSummaryLine,
  logInfo,
  validateMessageObject,
  sortKeys,
} = require("../shared");

function formatChangeLine(label, count, ids) {
  if (count === 0) return "";
  const preview = ids.slice(0, 10);
  const suffix =
    ids.length > preview.length
      ? `, ... (+${ids.length - preview.length} more)`
      : "";
  return `    ${label} ${count} ${count === 1 ? "key" : "keys"}: ${preview.join(", ")}${suffix}`;
}

function mergeLanguage(defaultMessages, existingMessages, whitelistedIds) {
  const merged = {};
  const changes = { added: [], updated: [], removed: [], needsTrimming: [] };

  for (const id of Object.keys(defaultMessages).sort()) {
    const defaultMessage = defaultMessages[id];

    if (whitelistedIds.has(id)) {
      merged[id] = defaultMessage;
      if (!(id in existingMessages)) {
        changes.added.push(id);
      } else if (existingMessages[id] !== defaultMessage) {
        changes.updated.push(id);
      }
      continue;
    }

    const existingMessage = existingMessages[id];
    if (typeof existingMessage === "string" && existingMessage.length > 0) {
      if (existingMessage !== existingMessage.trim()) {
        changes.needsTrimming.push(id);
      }
      merged[id] = existingMessage;
    } else {
      merged[id] = defaultMessage;
      if (!(id in existingMessages)) {
        changes.added.push(id);
      }
    }
  }

  for (const id of Object.keys(existingMessages)) {
    if (!(id in defaultMessages)) {
      changes.removed.push(id);
    }
  }

  return { merged: sortKeys(merged), changes };
}

function runSync(context) {
  logInfo(context, "⟳ Extracting messages from source...\n");
  extractMessages();

  const extractedRaw = readJson(extractedMessagesPath);
  if (
    !extractedRaw ||
    typeof extractedRaw !== "object" ||
    Array.isArray(extractedRaw)
  ) {
    console.error("✗ Extracted messages file is not a valid JSON object.");
    process.exit(1);
  }
  const defaultMessages = normalizeExtractedMessages(extractedRaw);
  const extractedCount = Object.keys(defaultMessages).length;
  logInfo(
    context,
    `  Found ${extractedCount} ${extractedCount === 1 ? "message" : "messages"} in source.\n`,
  );

  const sourceWhitespace = Object.entries(defaultMessages)
    .filter(([, msg]) => msg !== msg.trim())
    .map(([id]) => id);
  if (sourceWhitespace.length > 0) {
    console.warn(
      `  ⚠ Source messages with leading/trailing whitespace: ${sourceWhitespace.join(", ")}`,
    );
  }

  const languageFiles = listLanguageFiles();
  logInfo(
    context,
    `⟳ Syncing ${languageFiles.length} language ${languageFiles.length === 1 ? "file" : "files"}...\n`,
  );

  let totalAdded = 0;
  let totalUpdated = 0;
  let totalRemoved = 0;
  let hasChanges = false;

  for (const languageFile of languageFiles) {
    const languagePath = path.join(localesDir, languageFile);
    const existingMessages = readJson(languagePath);
    const existingString = fs.readFileSync(languagePath, "utf8");
    if (!validateMessageObject(existingMessages, languageFile)) {
      continue;
    }
    const whitelistedIds = getWhitelistedIds(languageFile);
    const { merged, changes } = mergeLanguage(
      defaultMessages,
      existingMessages,
      whitelistedIds,
    );
    // Always write if key order or values changed
    const mergedString = JSON.stringify(merged, null, 2) + "\n";
    if (changes.needsTrimming.length > 0) {
      console.warn(
        `  ⚠ ${languageFile}: values with leading/trailing whitespace: ${changes.needsTrimming.join(", ")}`,
      );
    }
    if (mergedString !== existingString) {
      hasChanges = true;
      if (!context.dryRun) {
        fs.writeFileSync(languagePath, mergedString);
      }
      logInfo(context, `  ${languageFile}: (sorted)`);
      if (changes.added.length > 0) {
        logInfo(
          context,
          formatChangeLine("+", changes.added.length, changes.added),
        );
        totalAdded += changes.added.length;
      }
      if (changes.updated.length > 0) {
        logInfo(
          context,
          formatChangeLine("~", changes.updated.length, changes.updated),
        );
        totalUpdated += changes.updated.length;
      }
      if (changes.removed.length > 0) {
        logInfo(
          context,
          formatChangeLine("-", changes.removed.length, changes.removed),
        );
        totalRemoved += changes.removed.length;
      }
    }
  }

  console.log(
    formatSummaryLine(
      `Done. ${totalAdded} added, ${totalUpdated} updated, ${totalRemoved} removed across all languages.`,
      context,
    ),
  );

  return hasChanges;
}

module.exports = { runSync };
