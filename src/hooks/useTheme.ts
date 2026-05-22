import { db } from "../db/state";
import { useValue } from "../lib/db/react";
import { useSystemTheme } from "./";

export function useTheme() {
  const preference = useValue(db, "themePreference");
  const systemIsDark = useSystemTheme();

  return {
    preference,
    isDark: preference === "system" ? systemIsDark : preference === "dark",
  };
}
