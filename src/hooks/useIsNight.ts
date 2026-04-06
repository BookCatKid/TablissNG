import { db } from "../db/state";
import { useValue } from "../lib/db/react";
import { useTime } from "./useTime";

export function useIsNight() {
  const time = useTime();
  const background = useValue(db, "background");
  const currentTime = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;
  const { nightStart = "21:00", nightEnd = "05:00" } = background.display;

  // Handle case where night spans across midnight
  if (nightStart > nightEnd) {
    return currentTime >= nightStart || currentTime < nightEnd;
  }

  return currentTime >= nightStart && currentTime < nightEnd;
}
