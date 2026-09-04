import { DB } from "../lib";

export const cache = DB.init<Record<string, unknown | undefined>>();
