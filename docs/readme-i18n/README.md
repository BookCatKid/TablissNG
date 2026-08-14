# README Localization

This folder stores language-specific translations of the README rendered directly by GitHub.

## File convention

- Source README: [`../../README.md`](../../README.md)
- Translation files: `README.<locale>.md`
- Current translation: [Korean](README.ko.md)

Keep links, commands, environment variable names, error messages, and code blocks unchanged in each translation. Translate the explanations, headings, alt text, and link labels. When adding a language, add it to the language selector at the top of the source README and every translated README.

The extension UI locales are defined in [`src/locales/registry.ts`](../../src/locales/registry.ts).
