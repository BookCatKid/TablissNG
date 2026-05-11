const fs = require("fs");
const path = require("path");

const {
  localesDir,
  extractedMessagesPath,
  normalizeExtractedMessages,
  readJson,
  writeJson,
} = require("../shared");

function runCreate(langCode, context) {
  if (!langCode || langCode.length === 0) {
    console.error(
      "✗ Please provide a language code, e.g.: node scripts/translations/translations.js create de-AT",
    );
    process.exit(1);
  }

  const langFile = `${langCode}.json`;
  const langPath = path.join(localesDir, langFile);
  const whitelistPath = path.join(localesDir, `whitelist_${langCode}.json`);

  if (fs.existsSync(langPath)) {
    console.error(`✗ Language file already exists: ${langFile}`);
    process.exit(1);
  }

  if (!fs.existsSync(extractedMessagesPath)) {
    console.error(
      "No extracted messages found. Run `npm run translations` first.\n",
    );
    process.exit(1);
  }
  const defaultMessages = normalizeExtractedMessages(
    readJson(extractedMessagesPath),
  );

  const seeded = {};
  for (const id of Object.keys(defaultMessages).sort()) {
    seeded[id] = defaultMessages[id];
  }
  writeJson(langPath, seeded, context);

  if (context.dryRun) {
    console.log(
      `⊘ DRY RUN: Would create ${langFile} with ${Object.keys(seeded).length} keys.`,
    );
  } else {
    console.log(
      `✓ Created ${langFile} with ${Object.keys(seeded).length} keys.`,
    );
  }

  if (!fs.existsSync(whitelistPath)) {
    writeJson(whitelistPath, [], context);
    if (context.dryRun) {
      console.log(`⊘ DRY RUN: Would create whitelist_${langCode}.json`);
    } else {
      console.log(`✓ Created whitelist_${langCode}.json`);
    }
  }

  console.log("\nNext steps:");
  console.log("  1. Add the locale to src/locales/registry.ts");
  console.log(`  2. Translate the strings in src/locales/lang/${langFile}`);
  console.log(`  3. Add any kept-English keys to whitelist_${langCode}.json`);
  console.log(
    `  4. Use 'pnpm run translations status ${langCode}' to track progress`,
  );
}

module.exports = { runCreate };
