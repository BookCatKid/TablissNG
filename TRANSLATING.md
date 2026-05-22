# Translation Guide

This guide covers how to add a new language, update existing translations, and migrate renamed translation keys.

## Quick Start

1. Install dependencies:
   `pnpm install`
2. Sync extracted messages into locale files:
   `pnpm run translations`
3. Edit your language file in `src/locales/lang`.
4. Verify status:
   `pnpm run translations status <lang>`
5. Run app locally to test:
   `pnpm run dev`

## Where Files Live

- Locale files: `src/locales/lang/<lang>.json`
- Compiled locale files (build artifact): `src/locales/lang.compiled/<lang>.json`
- Whitelist files: `src/locales/lang/whitelist_<lang>.json`
- Locale registry (single source of truth): `src/locales/registry.ts`

## Commands

- Sync/extract all messages:
  `pnpm run translations`
- Show status for all locales:
  `pnpm run translations status`
- Show status for one locale:
  `pnpm run translations status fr`
- Compile stripped/minified locale artifacts for production:
  `pnpm run translations compile`
- Create a new locale file:
  `pnpm run translations create de-AT`
- Migrate renamed keys (all locales):
  `pnpm run translations migrate --map old.id=new.id`
- Migrate renamed keys (one locale):
  `pnpm run translations migrate es --map old.id=new.id`

You can pass multiple migration mappings in one command:

`pnpm run translations migrate --map old.one=new.one --map old.two=new.two`

## Adding a New Language

1. Create locale file from extracted defaults:
   `pnpm run translations create <lang>`
2. Add locale metadata in `src/locales/registry.ts`.
3. Ensure locale aliases are correct in `src/locales/registry.ts` if needed (example: `zh` -> `zh-CN`).
4. Translate values in `src/locales/lang/<lang>.json`.
5. Run `pnpm run translations` to normalize and sort keys.
6. Check progress with `pnpm run translations status <lang>`.

## Updating Existing Translations

1. Run `pnpm run translations`.
2. Edit target locale files in `src/locales/lang`.
3. Re-run `pnpm run translations`.
4. Verify with `pnpm run translations status <lang>`.

## Migrating Renamed Keys

When IDs are renamed in code, preserve existing translated values with the migrate command.

Example:

`pnpm run translations migrate --map plugins.github.month.jan=time.month.short.jan`

Then run:

`pnpm run translations`

This updates locale files to the new IDs and keeps extracted files in sync.

## Whitelist Files

Whitelist files (`whitelist_<lang>.json`) define keys that should remain in English for that locale.

Example:

If `widgets` is in `whitelist_fr.json`, French keeps the English word "widgets".

Production builds automatically run `pnpm run translations compile` and load compiled locale artifacts.
