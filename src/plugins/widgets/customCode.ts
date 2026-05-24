export type CodeLanguage = "css" | "html" | "javascript";

const widgetLanguageMap: Record<string, CodeLanguage> = {
  "widget/css": "css",
  "widget/html": "html",
  "widget/js": "javascript",
};

export const isCustomCodeWidget = (
  key: string,
): key is keyof typeof widgetLanguageMap => key in widgetLanguageMap;

export const getCodeLanguageForWidget = (
  key: string,
): CodeLanguage | undefined => widgetLanguageMap[key];

export const customCodeWidgetKeys = Object.keys(widgetLanguageMap);
