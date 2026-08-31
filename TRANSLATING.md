# Translating TablissNG

Translations are contributed through two supported workflows:

1. **Crowdin** is the main translation platform for all languages it supports.
2. **Direct repository changes** are used for Toki Pona and Korean (North
   Korea), which are not available as Crowdin target languages.

## Translate with Crowdin

Most translators do not need to clone the repository or install development
tools.

1. Open the **[TablissNG project on Crowdin](https://crowdin.com/project/tablissng)**.
2. Sign in or create a free Crowdin account.
3. Select the language you want to translate.
4. Choose a file and translate its unfinished strings, or improve an existing
   translation.
5. Submit your translations for review.

New and edited translations stay in Crowdin until they are approved. The
translation automation downloads approved work, validates it against the
English messages, and opens or updates a translation pull request. A project
maintainer then reviews and merges that pull request into TablissNG.

## Translate Toki Pona or Korean (North Korea)

Crowdin does not currently offer Toki Pona (`tok`) or Korean (North Korea)
(`ko-KP`) as project target languages. Changes for these two languages are
accepted directly through GitHub.

1. Fork and clone the repository.
2. Install dependencies with `pnpm install`.
3. Edit the appropriate catalog:
   - Toki Pona: `src/locales/lang/tok.json`
   - North Korean Korean: `src/locales/lang/ko-KP.json`
4. Run `pnpm run translations` to add new source strings, remove obsolete
   strings, normalize the catalog, and preserve its key ordering.
5. Check the language's progress:
   - `pnpm run translations status tok`
   - `pnpm run translations status ko-KP`
6. Run `pnpm test`.
7. Open a pull request containing the locale-file change.

Do not edit English source text or invent new translation IDs in a locale file.

## Request a new language

[Open a GitHub issue](https://github.com/BookCatKid/TablissNG/issues/new) if the
language is not already listed in TablissNG. Include the language's English
name, native name, and locale code.

If Crowdin supports the language, maintainers will add it to the Crowdin
project. If Crowdin does not support it, maintainers may establish another
direct repository catalog like `tok` and `ko-KP`.

## Maintainer and developer reference

Application source messages remain authoritative in the TypeScript and TSX
files. Crowdin provides translation editing and approval; it does not replace
the repository's locale registry, validation, or build pipeline.

### Translation files

- `src/locales/lang/<locale>.json`: reviewed application catalogs
- `src/locales/lang/whitelist_<locale>.json`: strings intentionally kept in
  English
- `src/locales/registry.ts`: supported locales, labels, and aliases
- `src/locales/lang.compiled/<locale>.json`: generated production catalogs
- `src/locales/crowdin`: ignored exchange catalogs generated for Crowdin

### Common commands

- `pnpm run translations`: extract source messages and synchronize every locale
- `pnpm run translations status`: show progress for every locale
- `pnpm run translations status <locale>`: show untranslated strings for one
  locale
- `pnpm run translations compile`: generate production catalogs
- `pnpm run translations create <locale>`: create a repository catalog
- `pnpm run translations crowdin extract`: generate the Crowdin source catalog
- `pnpm run translations crowdin seed [locale...]`: generate existing
  translation catalogs for an initial maintainer-controlled Crowdin import
- `pnpm run translations crowdin import [locale...]`: validate downloaded
  Crowdin catalogs and merge them into repository catalogs

Routine community translation updates should flow through Crowdin and the
approved-translation automation. The `seed` command is only for establishing
existing repository translations as a new Crowdin language's initial baseline;
it must not be used to bypass review of contributor changes.

### Add a language

1. Run `pnpm run translations create <locale>`.
2. Add its code, English title, and native label to
   `src/locales/registry.ts`.
3. Add any required browser-locale aliases to the registry.
4. Add the target language to Crowdin when Crowdin supports it.
5. Add a `crowdin.yml` locale mapping when Crowdin's locale does not match the
   repository filename. For a language unavailable in Crowdin, exclude it from
   the Crowdin exchange commands instead.
6. Run `pnpm run translations`, `pnpm run translations status <locale>`, and
   `pnpm test`.

### Rename translation IDs

Preserve existing work when a source ID changes by migrating it instead of
making every language start over:

```sh
pnpm run translations migrate --map old.id=new.id
```

To migrate only one locale:

```sh
pnpm run translations migrate es --map old.id=new.id
```

Repeat `--map` to migrate multiple IDs in one run, then run
`pnpm run translations` to synchronize the catalogs.

### Intentionally English strings

Whitelist files identify strings that should remain equal to the English
source in a particular locale. Add a translation ID to
`src/locales/lang/whitelist_<locale>.json` only when retaining the English term
is intentional. Whitelisted values are preserved by both the repository and
Crowdin import workflows.

Production builds run `pnpm run translations compile` automatically and load
the generated compiled catalogs.
