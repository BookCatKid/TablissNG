// API used: https://github.com/noworneverev/leetcode-api

import { Activity } from "react-activity-calendar";

const url = "https://leetcode-api-pied.vercel.app/user";

export const fetchCalendar = async (userId: string) => {
  try {
    const res = await fetch(`${url}/${userId}/calendar`);

    if (!res.ok) return null;

    const json = await res.json();
    const calendar = json.submissionCalendar;

    if (Object.keys(calendar).length === 0) return null;

    const entries: Activity[] = [];

    for (const timestamp in calendar) {
      const date = new Date(Number(timestamp) * 1000);
      const count: number = calendar[timestamp];

      entries.push({
        date: date.toLocaleDateString("en-CA"),
        count,
        level: getLevel(count),
      });
    }

    return entries;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const getLevel = (count: number) => {
  /*
   Heatmap intensity levels based on count:
    0 → no activity
    1 → 1–3
    2 → 4–5
    3 → 6–8
    4 → >8
  */

  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 5) return 2;
  if (count <= 8) return 3;
  return 4;
};
