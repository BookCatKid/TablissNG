import { nanoid } from "nanoid";
import { DB } from "../lib";
import migrateFrom2 from "./migrations/migrate2";
import { selectWidgets } from "./select";
import { BackgroundDisplay, cache, db, WidgetDisplay } from "./state";

export const createId = (): string => nanoid(12);

// Background actions

/** Change the background */
export const setBackground = (key: string): void => {
  const current = DB.get(db, "background");

  const defaultDisplay: BackgroundDisplay = {
    blur: 0,
    luminosity: -0.2,
    nightDim: false,
    scale: true,
    nightStart: "21:00",
    nightEnd: "05:00",
  };

  // Save current background id and display for later restore.
  try {
    DB.put(db, `background/id/${current.key}` as any, current.id as any);
    const displayKey = `background/display/${current.key}` as any;
    try {
      const isDefault =
        JSON.stringify(current.display || {}) ===
        JSON.stringify(defaultDisplay);
      if (isDefault) {
        // Remove any stored default display.
        DB.del(db, displayKey);
      } else {
        DB.put(db, displayKey, current.display as any);
      }
    } catch {
      //
    }
    // Backup plugin data for this background
    try {
      const currentData = DB.get(db, `data/${current.id}` as any);
      if (typeof currentData !== "undefined") {
        DB.put(db, `background/data/${current.key}` as any, currentData);
      }
    } catch {
      //
    }
  } catch {
    //
  }

  // Reuse a previously allocated id for this key so that any plugin
  // specific `data/{id}` remains available when switching back.
  const prevId = DB.get(db, `background/id/${key}` as any) as unknown as string;
  const prevDisplay = DB.get(db, `background/display/${key}` as any) as
    | BackgroundDisplay
    | undefined;
  const id = prevId || createId();

  // Restore per-background plugin data into `data/{id}` if missing.
  try {
    const existingData = DB.get(db, `data/${id}`);
    if (typeof existingData === "undefined") {
      const storedData = DB.get(db, `background/data/${key}` as any);
      if (typeof storedData !== "undefined") {
        DB.put(db, `data/${id}`, storedData);
      }
    }
  } catch (err) {
    console.warn("Failed to restore plugin data:", err);
  }

  DB.put(db, "background", {
    id,
    key,
    display: prevDisplay || defaultDisplay,
  });
};

// Widget actions

/** Add a new widget */
export const addWidget = (key: string): void => {
  const id = createId();
  const widgets = selectWidgets();
  const order = widgets.length > 0 ? widgets[widgets.length - 1].order + 1 : 0;
  DB.put(db, `widget/${id}`, {
    id,
    key,
    order,
    display: { position: "middleCentre" },
  });
};

/** Remove a widget */
export const removeWidget = (id: string): void => {
  DB.put(db, `widget/${id}`, null);
  DB.del(db, `data/${id}`);
  DB.del(cache, id);
};

/** Reorder a widget */
export const reorderWidget = (from: number, to: number): void => {
  const widgets = selectWidgets();
  widgets.splice(to, 0, widgets.splice(from, 1)[0]);
  widgets.forEach((widget, order) =>
    DB.put(db, `widget/${widget.id}`, { ...widget, order }),
  );
};

/** Set display properties of a widget */
export const setWidgetDisplay = (
  id: string,
  display: Partial<WidgetDisplay>,
) => {
  const widget = DB.get(db, `widget/${id}`);
  if (!widget) {
    console.error(`Widget ${id} not found`);
    return;
  }

  DB.put(db, `widget/${id}`, {
    ...widget,
    display: { ...widget.display, ...display },
  });
};

// UI actions

/** Toggle dashboard focus mode */
export const toggleFocus = () => {
  DB.put(db, "focus", !DB.get(db, "focus"));
};

// Store actions

/** Import database from a dump */
export const importStore = (dump: any): void => {
  // TODO: Add proper schema validation
  if (typeof dump !== "object" || dump === null)
    throw new TypeError("Unexpected format");

  resetStore();
  if ("backgrounds" in dump) {
    // Version 2 config
    DB.put(db, `widget/default-time`, null);
    DB.put(db, `widget/default-greeting`, null);
    dump = migrateFrom2(dump);
  } else if (dump.version === 3) {
    // Version 3 config
    delete dump.version;
  } else if (dump.version > 3) {
    // Future version
    throw new TypeError("Settings exported from a newer version of Tabliss");
  } else {
    // Unknown version
    throw new TypeError("Unknown settings version");
  }
  // @ts-ignore
  Object.entries(dump).forEach(([key, val]) => DB.put(db, key, val));
};

/** Export a database dump */
export const exportStore = (): string => {
  return JSON.stringify({
    ...Object.fromEntries(DB.prefix(db, "")),
    version: 3,
  });
};

/** Reset the database */
export const resetStore = (): void => {
  clear(db);
  clear(cache);
};

const clear = (db: DB.Database): void => {
  // @ts-ignore
  for (const [key] of DB.prefix(db, "")) DB.del(db, key);
};
