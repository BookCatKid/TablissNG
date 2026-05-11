const { runSync } = require("./commands/sync");
const { runStatus } = require("./commands/status");
const { runCreate } = require("./commands/create");
const { runMigrate, parseMigrateArgs } = require("./commands/migrate");
const { runPurge, parsePurgeArgs } = require("./commands/purge");
const { runCompile } = require("./commands/compile");

function parseGlobalOptions(argv) {
  const options = { dryRun: false, quiet: false, check: false };
  const args = [];

  for (const arg of argv) {
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--quiet") {
      options.quiet = true;
      continue;
    }
    if (arg === "--check") {
      options.check = true;
      options.dryRun = true;
      continue;
    }
    args.push(arg);
  }

  return {
    options,
    args,
  };
}

function printUsage() {
  console.log(`Usage: node scripts/translations/translations.js [options] [command] [args...]

Global Options:
	--dry-run           Preview changes without writing to files
	--quiet             Minimize non-essential output
	--check             Check if translations are out of date and exit with error code (sync only, implies --dry-run)

Commands:
	(no command)        Extract messages and sync all language files (default)
	status [lang]       Show translation status for all or a specific language
	compile             Compile stripped/minified locale files for production build
	create <lang>       Create a new language file with default English values
	migrate [lang] --map <mapping> [--map <mapping>...]
					Migrate renamed IDs in language/whitelist files.
					Mapping format: --map old.id=new.id (repeatable)
	purge <key>         Purge a change key from all files so that it can be regenerated correctly.
Examples:
		node scripts/translations/translations.js              # sync all languages
		node scripts/translations/translations.js --dry-run    # preview all changes
		node scripts/translations/translations.js --quiet      # summary-only style output
		node scripts/translations/translations.js --check      # check if translations are up to date (mostly for CI)
		node scripts/translations/translations.js status       # overview of all languages
		node scripts/translations/translations.js status fr    # untranslated keys in French
		node scripts/translations/translations.js compile      # write production locale artifacts
		node scripts/translations/translations.js create de-AT # create Austrian German
		node scripts/translations/translations.js migrate es --map plugins.github.month.jan=time.month.short.jan
		node scripts/translations/translations.js --dry-run migrate --map old.one=new.one --map old.two=new.two
		node scripts/translations/translations.js purge settings.links.list`);
}

const { options, args } = parseGlobalOptions(process.argv.slice(2));
const context = options;

if (context.dryRun && !context.quiet) {
  console.log("⊘ DRY RUN MODE - No files will be written\n");
}

const [command, ...commandArgs] = args;

if (context.check && command && command !== "sync") {
  console.error("✗ --check option is only supported with the sync command.");
  process.exit(1);
}

switch (command) {
  case undefined:
  case "sync":
    {
      const hasChanges = runSync(context);
      if (context.check && hasChanges) {
        console.error(
          "✗ Translations are out of date. Run 'pnpm run translations' to update them.",
        );
        process.exit(1);
      }
    }
    break;
  case "status":
    runStatus(commandArgs[0], context);
    break;
  case "create":
    runCreate(commandArgs[0], context);
    break;
  case "compile":
    runCompile(context);
    break;
  case "migrate":
    {
      const { targetLang, migrations } = parseMigrateArgs(commandArgs);
      runMigrate(targetLang, migrations, context);
    }
    break;
  case "purge":
    {
      const { keyToPurge } = parsePurgeArgs(commandArgs);
      runPurge(keyToPurge, context);
    }
    break;
  case "help":
  case "--help":
  case "-h":
    printUsage();
    break;
  default:
    console.error(`Unknown command: ${command}\n`);
    printUsage();
    process.exit(1);
}
