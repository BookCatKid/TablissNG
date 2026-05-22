export type LocaleOption = {
  code: string;
  title: string;
  label: string;
};

export const localeOptions: LocaleOption[] = [
  { code: "ar", title: "Arabic", label: "العربية" },
  { code: "be", title: "Belarusian", label: "Беларуская" },
  { code: "ca-ES", title: "Catalan", label: "Català" },
  { code: "cs", title: "Czech", label: "Čeština" },
  { code: "de", title: "German", label: "Deutsch" },
  { code: "el", title: "Greek", label: "Ελληνικά" },
  { code: "en-AU", title: "English (Australian)", label: "English (AU)" },
  { code: "en-CA", title: "English (Canadian)", label: "English (CA)" },
  { code: "en-GB", title: "English (British)", label: "English (GB)" },
  { code: "en", title: "English (American)", label: "English (US)" },
  { code: "es", title: "Spanish", label: "Español" },
  { code: "fa", title: "Persian", label: "پارسی" },
  { code: "fi", title: "Finnish", label: "Suomi" },
  { code: "fr", title: "French", label: "Français" },
  { code: "ga", title: "Gaeilge", label: "Gaeilge" },
  { code: "gd", title: "Scottish Gaelic", label: "Gàidhlig" },
  { code: "gl", title: "Galician", label: "Galego" },
  { code: "gu", title: "Gujarati", label: "ગુજરાતી" },
  { code: "he", title: "Hebrew", label: "עברית" },
  { code: "hi", title: "Hindi", label: "हिन्दी" },
  { code: "hu", title: "Hungarian", label: "Magyar" },
  { code: "id", title: "Indonesian", label: "Indonesian" },
  { code: "it", title: "Italian", label: "Italiano" },
  { code: "ja", title: "Japanese", label: "日本語" },
  { code: "ko", title: "Korean", label: "한국어" },
  { code: "ko-KP", title: "Korean (North Korea)", label: "조선말" },
  { code: "lb", title: "Luxembourgish", label: "Lëtzebuergesch" },
  { code: "lt", title: "Lithuanian", label: "Lietuvių k." },
  { code: "ne", title: "Nepali", label: "Nepali" },
  { code: "nl", title: "Dutch", label: "Nederlands" },
  { code: "no", title: "Norwegian", label: "Norsk" },
  { code: "pl", title: "Polish", label: "Polski" },
  { code: "pt-BR", title: "Portuguese (Brazil)", label: "Português do Brasil" },
  {
    code: "pt",
    title: "Portuguese (Portugal)",
    label: "Português de Portugal",
  },
  { code: "ro", title: "Romanian", label: "Română" },
  { code: "ru", title: "Russian", label: "Русский" },
  { code: "sk", title: "Slovak", label: "Slovenčina" },
  { code: "sq", title: "Albanian", label: "Shqip" },
  { code: "sr", title: "Serbian", label: "Српски" },
  { code: "sv", title: "Swedish", label: "Svenska" },
  { code: "ta", title: "Tamil", label: "தமிழ்" },
  { code: "th", title: "Thai", label: "ไทย" },
  { code: "tok", title: "Toki Pona", label: "toki pona" },
  { code: "tr", title: "Turkish", label: "Türkçe" },
  { code: "uk", title: "Ukrainian", label: "Українська" },
  { code: "vi", title: "Vietnamese", label: "Tiếng Việt" },
  { code: "zh-CN", title: "Simplified Chinese (China)", label: "中文（中国）" },
  {
    code: "zh-TW",
    title: "Traditional Chinese (Taiwan)",
    label: "中文（台灣）",
  },
];

export const locales = localeOptions.map((locale) => locale.code);
export const translatableLocales = locales.filter((locale) => locale !== "en");

export const localeAliases: Record<string, string> = {
  zh: "zh-CN",
  kp: "ko-KP",
};
