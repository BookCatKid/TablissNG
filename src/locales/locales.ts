import { pick } from "in-browser-language";

import extractedMessages from "./extractedMessages/messages.json";
import {
  localeAliases,
  locales as localeCodes,
  translatableLocales,
} from "./registry";

export type LocaleMessages = Record<string, string>;

type LocaleModule = { default: LocaleMessages };
type LocaleLoader = () => Promise<LocaleModule>;

export const baseMessages: LocaleMessages = Object.fromEntries(
  Object.entries(extractedMessages).map(([id, entry]) => [
    id,
    typeof entry.defaultMessage === "string" ? entry.defaultMessage : "",
  ]),
);

const createLocaleLoader = (code: string): LocaleLoader => {
  if (DEV) {
    return () =>
      import(
        /* webpackChunkName: "locales/[request]" */
        `./lang/${code}.json`
      );
  }

  return () =>
    import(
      /* webpackChunkName: "locales/[request]" */
      `./lang.compiled/${code}.json`
    );
};

const localeLoaders: Record<string, LocaleLoader> = Object.fromEntries(
  translatableLocales.map((code) => [code, createLocaleLoader(code)]),
);

const loadedLocaleMessages = new Map<string, LocaleMessages>();

export const locales = [...localeCodes, ...Object.keys(localeAliases)];
export const defaultLocale = pick(locales, "en");

export const resolveLocale = (locale: string): string => {
  if (locale === "en") return "en";
  if (localeLoaders[locale]) return locale;

  const mappedLocale = localeAliases[locale];
  if (mappedLocale) return mappedLocale;

  const baseLocale = locale.split("-")[0];
  if (baseLocale) {
    if (baseLocale === "en") return "en";

    const mappedBaseLocale = localeAliases[baseLocale];
    if (mappedBaseLocale) return mappedBaseLocale;

    if (localeLoaders[baseLocale]) return baseLocale;
  }

  return "en";
};

export const loadMessages = async (locale: string): Promise<LocaleMessages> => {
  const resolvedLocale = resolveLocale(locale);
  if (resolvedLocale === "en") return {};

  const cached = loadedLocaleMessages.get(resolvedLocale);
  if (cached) return cached;

  const loader = localeLoaders[resolvedLocale];
  if (!loader) return {};

  try {
    const module = await loader();
    const messages = module.default;
    loadedLocaleMessages.set(resolvedLocale, messages);
    return messages;
  } catch (error) {
    console.error(`Failed to load locale "${resolvedLocale}":`, error);
    return {};
  }
};
