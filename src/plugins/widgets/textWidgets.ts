const textWidgetKeys = [
  "widget/notes",
  "widget/message",
  "widget/customText",
] as const;

export type TextWidgetKey = (typeof textWidgetKeys)[number];

export const isTextWidget = (key: string): key is TextWidgetKey =>
  (textWidgetKeys as readonly string[]).includes(key);

export const textWidgetList = [...textWidgetKeys];
