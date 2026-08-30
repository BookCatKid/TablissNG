const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  extractedMessagesPath,
  getWhitelistedIds,
  localesDir,
  readJson,
  rootDir,
  runFormatjs,
  sortKeys,
  writeJsonIfChanged,
} = require("../shared");

const crowdinDir = path.join(rootDir, "src", "locales", "crowdin");
const crowdinSourcePath = path.join(crowdinDir, "en.json");

function parseCrowdinArgs(args) {
  const [operation, ...languages] = args;

  if (!operation || !["extract", "seed", "import"].includes(operation)) {
    console.error(
      "✗ Usage: translations crowdin <extract|seed|import> [lang...]",
    );
    process.exit(1);
  }

  if (operation === "seed" && languages.length === 0) {
    console.error("✗ Crowdin seed requires at least one language code.");
    process.exit(1);
  }

  return { operation, languages };
}

function assertLanguageCode(language) {
  if (!/^[A-Za-z0-9-]+$/.test(language)) {
    throw new Error(`Invalid language code: ${language}`);
  }

  const languagePath = path.join(localesDir, `${language}.json`);
  if (!fs.existsSync(languagePath)) {
    throw new Error(`Language file not found: ${language}.json`);
  }

  return languagePath;
}

function extractCrowdinCatalog(outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  runFormatjs([
    "extract",
    "src/**/*.{ts,tsx}",
    "--ignore",
    "**/*.d.ts",
    "--format",
    "crowdin",
    "--out-file",
    path.relative(rootDir, outputPath),
  ]);
}

function runCrowdinExtract(context) {
  if (context.dryRun) {
    console.log(
      "⊘ DRY RUN: Would generate src/locales/crowdin/en.json for Crowdin.",
    );
    return;
  }

  extractCrowdinCatalog(crowdinSourcePath);
  const count = Object.keys(readJson(crowdinSourcePath)).length;
  console.log(`✓ Generated Crowdin source catalog with ${count} messages.`);
}

function buildCrowdinSeed(sourceCatalog, translations, whitelistedIds) {
  const seed = {};

  for (const [id, descriptor] of Object.entries(sourceCatalog)) {
    const sourceMessage = descriptor.message;
    const translatedMessage = translations[id];
    const intentionallyEnglish = whitelistedIds.has(id);
    const isTranslated =
      typeof translatedMessage === "string" &&
      translatedMessage.length > 0 &&
      translatedMessage !== sourceMessage;

    if (!isTranslated && !intentionallyEnglish) continue;

    seed[id] = {
      message: intentionallyEnglish ? sourceMessage : translatedMessage,
      description: descriptor.description,
    };
  }

  return sortKeys(seed);
}

function runCrowdinSeed(languages, context) {
  if (!context.dryRun) extractCrowdinCatalog(crowdinSourcePath);

  const sourceCatalog = context.dryRun
    ? readJson(extractedMessagesPath)
    : readJson(crowdinSourcePath);

  for (const language of languages) {
    const languagePath = assertLanguageCode(language);
    const translations = readJson(languagePath);
    const whitelistedIds = getWhitelistedIds(`${language}.json`);

    const normalizedSource = context.dryRun
      ? Object.fromEntries(
          Object.entries(sourceCatalog).map(([id, descriptor]) => [
            id,
            {
              message: descriptor.defaultMessage,
              description: descriptor.description,
            },
          ]),
        )
      : sourceCatalog;
    const seed = buildCrowdinSeed(
      normalizedSource,
      translations,
      whitelistedIds,
    );
    const targetPath = path.join(crowdinDir, `${language}.json`);

    if (!context.dryRun) {
      writeJsonIfChanged(targetPath, seed, context);
    }

    const action = context.dryRun ? "Would seed" : "Seeded";
    console.log(
      `${context.dryRun ? "⊘ DRY RUN: " : "✓ "}${action} ${language} with ${Object.keys(seed).length} existing translations.`,
    );
  }
}

function mergeCrowdinTranslation(
  sourceMessages,
  existingMessages,
  downloadedMessages,
  whitelistedIds,
) {
  const unknownIds = Object.keys(downloadedMessages).filter(
    (id) => !(id in sourceMessages),
  );
  if (unknownIds.length > 0) {
    throw new Error(
      `Crowdin catalog has unknown message IDs: ${unknownIds.join(", ")}`,
    );
  }

  const merged = {};
  for (const id of Object.keys(sourceMessages).sort()) {
    const sourceMessage = sourceMessages[id];
    const downloadedMessage = downloadedMessages[id];
    const existingMessage = existingMessages[id];

    if (whitelistedIds.has(id)) {
      merged[id] = sourceMessage;
    } else if (
      typeof downloadedMessage === "string" &&
      downloadedMessage.length > 0 &&
      downloadedMessage !== sourceMessage
    ) {
      merged[id] = downloadedMessage;
    } else if (
      typeof existingMessage === "string" &&
      existingMessage.length > 0
    ) {
      merged[id] = existingMessage;
    } else {
      merged[id] = sourceMessage;
    }
  }

  return sortKeys(merged);
}

function compileCrowdinCatalog(crowdinPath, outputPath) {
  runFormatjs([
    "compile",
    path.relative(rootDir, crowdinPath),
    "--format",
    "crowdin",
    "--out-file",
    outputPath,
  ]);
  return readJson(outputPath);
}

function verifyStructure(language, sourceMessages, candidateMessages, tempDir) {
  const sourcePath = path.join(tempDir, "en.json");
  const targetPath = path.join(tempDir, `${language}.json`);
  fs.writeFileSync(sourcePath, `${JSON.stringify(sourceMessages, null, 2)}\n`);
  fs.writeFileSync(
    targetPath,
    `${JSON.stringify(candidateMessages, null, 2)}\n`,
  );

  runFormatjs([
    "verify",
    path.join(tempDir, "*.json"),
    "--source-locale",
    "en",
    "--structural-equality",
    "--extra-keys",
  ]);
}

function listDownloadedLanguages(requestedLanguages) {
  if (requestedLanguages.length > 0) return requestedLanguages;
  if (!fs.existsSync(crowdinDir)) return [];

  return fs
    .readdirSync(crowdinDir)
    .filter((file) => file.endsWith(".json") && file !== "en.json")
    .map((file) => file.replace(/\.json$/, ""))
    .sort();
}

function runCrowdinImport(requestedLanguages, context) {
  const languages = listDownloadedLanguages(requestedLanguages);
  if (languages.length === 0) {
    throw new Error("No downloaded Crowdin language catalogs found.");
  }

  if (!fs.existsSync(crowdinSourcePath)) {
    throw new Error(
      "Crowdin source catalog not found. Run `translations crowdin extract` first.",
    );
  }

  const sourceCatalog = readJson(crowdinSourcePath);
  const sourceMessages = Object.fromEntries(
    Object.entries(sourceCatalog).map(([id, descriptor]) => [
      id,
      descriptor.message,
    ]),
  );
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tabliss-crowdin-"));

  try {
    for (const language of languages) {
      const languagePath = assertLanguageCode(language);
      const crowdinPath = path.join(crowdinDir, `${language}.json`);
      if (!fs.existsSync(crowdinPath)) {
        throw new Error(`Crowdin catalog not found: ${language}.json`);
      }

      const compiledPath = path.join(tempDir, `${language}.compiled`);
      const downloadedMessages = compileCrowdinCatalog(
        crowdinPath,
        compiledPath,
      );
      const existingMessages = readJson(languagePath);
      const whitelistedIds = getWhitelistedIds(`${language}.json`);
      const merged = mergeCrowdinTranslation(
        sourceMessages,
        existingMessages,
        downloadedMessages,
        whitelistedIds,
      );

      verifyStructure(language, sourceMessages, merged, tempDir);
      const changed = writeJsonIfChanged(languagePath, merged, context);
      const prefix = context.dryRun ? "⊘ DRY RUN:" : "✓";
      console.log(
        `${prefix} ${language}: ${changed ? "updated from" : "already matches"} Crowdin download.`,
      );
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function runCrowdin({ operation, languages }, context) {
  try {
    switch (operation) {
      case "extract":
        runCrowdinExtract(context);
        break;
      case "seed":
        runCrowdinSeed(languages, context);
        break;
      case "import":
        runCrowdinImport(languages, context);
        break;
    }
  } catch (error) {
    console.error(`✗ Crowdin ${operation} failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  buildCrowdinSeed,
  mergeCrowdinTranslation,
  parseCrowdinArgs,
  runCrowdin,
};
