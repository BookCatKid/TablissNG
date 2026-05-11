const fs = require("fs");
const path = require("path");

const {
  localesDir,
  extractedMessagesPath,
  normalizeExtractedMessages,
  listLanguageFiles,
  readJson,
  writeJsonIfChanged,
  validateMessageObject,
  formatSummaryLine,
  logInfo,
  sortKeys,
} = require("../shared");

function getDefaultMessagesSafe() {
  if (!fs.existsSync(extractedMessagesPath)) return {};
  const extractedRaw = readJson(extractedMessagesPath);
  if (
    !extractedRaw ||
    typeof extractedRaw !== "object" ||
    Array.isArray(extractedRaw)
  ) {
    return {};
  }
  return normalizeExtractedMessages(extractedRaw);
}

function validateAndParseMigrationPair(pair) {
  const separatorIndex = pair.indexOf("=");
  if (separatorIndex <= 0 || separatorIndex === pair.length - 1) {
    console.error(
      `✗ Invalid migration pair: "${pair}". Expected format old.id=new.id`,
    );
    return null;
  }

  const oldId = pair.slice(0, separatorIndex).trim();
  const newId = pair.slice(separatorIndex + 1).trim();

  if (oldId.length === 0 || newId.length === 0) {
    console.error(`✗ Invalid migration pair: "${pair}". IDs cannot be empty.`);
    return null;
  }

  return { oldId, newId };
}

function parseMigrationPairs(pairs) {
  const migrations = {};

  for (const pair of pairs) {
    const parsed = validateAndParseMigrationPair(pair);
    if (!parsed) {
      process.exit(1);
    }
    migrations[parsed.oldId] = parsed.newId;
  }

  return migrations;
}

function parseMigrateArgs(args) {
  let targetLang;
  const pairArgs = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === "--map") {
      const next = args[i + 1];
      if (!next) {
        console.error(
          "✗ Missing value after --map. Expected --map old.id=new.id",
        );
        process.exit(1);
      }
      pairArgs.push(next);
      i += 1;
      continue;
    }

    if (arg.startsWith("--map=")) {
      pairArgs.push(arg.slice("--map=".length));
      continue;
    }

    if (!targetLang) {
      targetLang = arg;
      continue;
    }

    console.error(`✗ Unexpected argument: ${arg}`);
    process.exit(1);
  }

  if (pairArgs.length === 0) {
    console.error(
      "✗ No migration pairs provided. Pass one or more old.id=new.id mappings.",
    );
    process.exit(1);
  }

  return {
    targetLang,
    migrations: parseMigrationPairs(pairArgs),
  };
}

function runMigrate(targetLang, migrations, context) {
  const defaultMessages = getDefaultMessagesSafe();
  const languageFiles = targetLang
    ? [`${targetLang}.json`]
    : listLanguageFiles();

  let languageFilesUpdated = 0;
  let whitelistFilesUpdated = 0;

  for (const languageFile of languageFiles) {
    const languagePath = path.join(localesDir, languageFile);
    if (!fs.existsSync(languagePath)) {
      console.error(`✗ Language file not found: ${languageFile}`);
      continue;
    }

    const existingMessages = readJson(languagePath);
    if (!validateMessageObject(existingMessages, languageFile)) {
      continue;
    }

    let moved = 0;
    let dropped = 0;
    let conflicts = 0;

    for (const [oldId, newId] of Object.entries(migrations)) {
      if (!(oldId in existingMessages)) continue;

      const oldValue = existingMessages[oldId];
      const hasNew = newId in existingMessages;
      const newValue = existingMessages[newId];
      const newDefault = defaultMessages[newId];
      const newLooksUntranslated =
        !hasNew ||
        newValue === "" ||
        (typeof newDefault === "string" && newValue === newDefault);

      if (newLooksUntranslated && typeof oldValue === "string") {
        existingMessages[newId] = oldValue;
        moved += 1;
      } else if (hasNew && newValue !== oldValue) {
        conflicts += 1;
      }

      delete existingMessages[oldId];
      dropped += 1;
    }

    if (moved > 0 || dropped > 0) {
      writeJsonIfChanged(languagePath, sortKeys(existingMessages), context);
      languageFilesUpdated += 1;
      const changesSummary = `moved ${moved}, removed ${dropped}${conflicts > 0 ? `, kept ${conflicts} existing ${conflicts === 1 ? "value" : "values"}` : ""}`;
      logInfo(context, `  ${languageFile}: ${changesSummary}`);
    }

    const language = languageFile.replace(/\.json$/, "");
    const whitelistPath = path.join(localesDir, `whitelist_${language}.json`);
    if (!fs.existsSync(whitelistPath)) continue;

    const whitelist = readJson(whitelistPath);
    if (!Array.isArray(whitelist)) continue;

    let whitelistChanged = false;
    const migratedWhitelist = whitelist.map((id) => {
      const mapped = migrations[id];
      if (mapped && mapped !== id) {
        whitelistChanged = true;
        return mapped;
      }
      return id;
    });

    const dedupedWhitelist = Array.from(new Set(migratedWhitelist)).sort();
    if (whitelistChanged) {
      writeJsonIfChanged(whitelistPath, dedupedWhitelist, context);
      whitelistFilesUpdated += 1;
      logInfo(context, `    ↳ updated whitelist_${language}.json`);
    }
  }

  console.log(
    formatSummaryLine(
      `Migration complete. Updated ${languageFilesUpdated} language ${languageFilesUpdated === 1 ? "file" : "files"} and ${whitelistFilesUpdated} whitelist ${whitelistFilesUpdated === 1 ? "file" : "files"}.`,
      context,
    ),
  );
}

module.exports = { runMigrate, parseMigrateArgs };
