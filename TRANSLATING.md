# Adding Translations

This document gives you a step by step guide for how to add your own translations to Tabliss!

1. Fork and checkout the repository
2. Run `npm install` to download the dependencies
3. Add your language code to the languages array in `scripts/translations.js`
4. Run `npm run translations` to generate your language files in `src/locales/lang`
5. With the help of the default messages and descriptions, edit the JSON file with your translated messages
6. Import your new translations into the `src/locales/locales.ts` file
7. Finally, add your language to the select dropdown in `src/views/settings/System.tsx`
8. Commit your updated files
9. Submit a Pull Request back to the Tabliss repository!

You can test your changes at anytime by running a local development build of Tabliss with `npm run dev`.

### About Whitelist Files

In the `src/locales/lang` directory, you'll find files named like `whitelist_fr.json`, `whitelist_en-CA.json`, etc. These whitelist files tell the translation system which strings should be kept in English and don't need translation for each language.

For example, if `widgets` appears in `whitelist_fr.json`, the system won't prompt you to translate "widgets" into French - it will keep the English word. This is useful if the work does not change in your language or its a word that should remain in English across all languages.
