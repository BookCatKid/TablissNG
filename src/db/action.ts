/* eslint-disable @typescript-eslint/ban-ts-comment */
import { nanoid } from "nanoid";

import { DB } from "../lib";
import migrateFrom2 from "./migrations/migrate2";
import { selectWidgets } from "./select";
import {
  BackgroundDisplay,
  cache,
  db,
  initData,
  ProfileState,
  WidgetDisplay,
} from "./state";

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
  // Delete profile-scoped cache entry
  const activeProfileId = DB.get(db, "activeProfileId");
  DB.del(cache, `${activeProfileId}/${id}`);
  // Delete legacy unscoped cache entry for backward compatibility
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

// Profile actions

/** Get current state as a profile object */
const getProfileState = (id: string, name: string): ProfileState => {
  const state: Partial<ProfileState> = { id, name };
  const globalKeys = new Set(["profiles", "activeProfileId"]);

  const profileData = Object.fromEntries(
    Array.from(DB.prefix(db, "")).filter(([key]) => !globalKeys.has(key)),
  ) as Partial<ProfileState>;

  Object.assign(state, profileData);

  return state as ProfileState;
};

/** Create a new profile */
export const createProfile = (name: string): void => {
  const id = createId();

  // Extract default settings from initData, excluding global state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { profiles: _p, activeProfileId: _a, ...defaults } = initData;

  // Create profile using defaults, but inherit current locale
  const profile: ProfileState = {
    ...defaults,
    id,
    name,
    locale: DB.get(db, "locale"),
  } as ProfileState;

  const profiles = { ...DB.get(db, "profiles") };
  profiles[id] = profile;
  DB.put(db, "profiles", profiles);
};

/** Switch to a different profile */
export const switchProfile = (id: string): void => {
  const currentId = DB.get(db, "activeProfileId");
  if (id === currentId) return;

  const profiles = { ...DB.get(db, "profiles") };
  const targetProfile = profiles[id];

  if (!targetProfile) {
    console.error(`Profile ${id} not found`);
    return;
  }

  // Save current state to profiles (Full save)
  const currentName = profiles[currentId]?.name || "Default";
  profiles[currentId] = getProfileState(currentId, currentName);

  // Load target profile
  DB.atomic(db, () => {
    // 1. Clear everything
    const keys = [];
    for (const [key] of DB.prefix(db, "")) keys.push(key);
    keys.forEach((key) => DB.del(db, key as any));

    // 2. Restore defaults (excluding widgets/data to avoid resurrecting deleted defaults)
    Object.entries(initData).forEach(([key, val]) => {
      if (
        !key.startsWith("widget/") &&
        !key.startsWith("data/") &&
        key !== "profiles"
      ) {
        // @ts-ignore
        DB.put(db, key, val);
      }
    });

    // 3. Apply target profile settings
    Object.entries(targetProfile).forEach(([key, val]) => {
      if (key !== "id" && key !== "name") {
        // @ts-ignore
        DB.put(db, key, val);
      }
    });

    // 4. Update profiles map:
    //    - Current profile is now saved fully (done above)
    //    - Target profile becomes "hollow" (metadata only) to avoid duplication
    profiles[id] = { id: targetProfile.id, name: targetProfile.name };
    DB.put(db, "profiles", profiles);

    // 5. Set active ID
    DB.put(db, "activeProfileId", id);
  });
};

/** Rename a profile */
export const renameProfile = (id: string, name: string): void => {
  const profiles = { ...DB.get(db, "profiles") };
  if (profiles[id]) {
    profiles[id] = { ...profiles[id], name };
    DB.put(db, "profiles", profiles);

    // If renaming active profile, we don't need to do anything else
    // because the name is stored in the profiles map, not the root state
  }
};

/** Delete a profile */
export const deleteProfile = (id: string): void => {
  const activeId = DB.get(db, "activeProfileId");
  if (id === activeId) {
    console.error("Cannot delete active profile");
    return;
  }

  // Clean up cache entries scoped to this profile
  const cachePrefix = `${id}/`;
  for (const [key] of DB.prefix(cache, cachePrefix) as Iterable<
    [string, unknown]
  >) {
    DB.del(cache, key);
  }

  const profiles = { ...DB.get(db, "profiles") };
  delete profiles[id];
  DB.put(db, "profiles", profiles);
};

/** Duplicate a profile */
export const duplicateProfile = (id: string): void => {
  const profiles = { ...DB.get(db, "profiles") };
  const activeId = DB.get(db, "activeProfileId");
  const source =
    id === activeId
      ? getProfileState(id, profiles[id]?.name || "Default")
      : profiles[id];

  if (!source) return;

  const newId = createId();
  const newProfile: Record<string, unknown> & { id: string; name: string } = {
    id: newId,
    name: `${source.name} (Copy)`,
  };

  // 1. Copy non-widget/non-data properties
  Object.entries(source).forEach(([key, val]) => {
    if (
      !key.startsWith("widget/") &&
      !key.startsWith("data/") &&
      key !== "id" &&
      key !== "name"
    ) {
      newProfile[key] = val;
    }
  });

  // 2. Process widgets and their associated data
  Object.entries(source).forEach(([key, val]) => {
    if (!key.startsWith("widget/")) return;

    if (!val) {
      newProfile[key] = null;
      return;
    }

    const oldWidgetId = val.id;
    const isDefaultWidget =
      oldWidgetId === "default-time" || oldWidgetId === "default-greeting";
    const newWidgetId = isDefaultWidget ? oldWidgetId : createId();

    // Add new widget
    newProfile[`widget/${newWidgetId}`] = { ...val, id: newWidgetId };

    // Handle associated data
    const oldDataKey = `data/${oldWidgetId}`;
    // @ts-ignore
    if (source[oldDataKey]) {
      // @ts-ignore
      newProfile[`data/${newWidgetId}`] = source[oldDataKey];
    }
  });

  profiles[newId] = newProfile as ProfileState;
  DB.put(db, "profiles", profiles);
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
