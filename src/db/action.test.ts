import { DB } from "../lib";
import { exportStore, importStore, resetStore } from "./action";
import { cache, db } from "./state";

rstest.mock("./state", () => ({
  db: DB.init({ accent: "#3498db" }),
  cache: DB.init(),
}));

const background = {
  id: "uploaded-background",
  key: "background/image",
  display: { luminosity: -0.4, blur: 2 },
};
const media = {
  items: [new File(["wallpaper"], "wallpaper.png", { type: "image/png" })],
  cursor: 0,
  rotated: 123,
  deps: [],
};

beforeEach(() => {
  resetStore();
  DB.put(db, "background", background);
  DB.put(db, "data/uploaded-background", { paused: true, timeout: 900 });
  DB.put(db, "accent", "#123456");
  DB.put(cache, background.id, media);
});

test("reimports settings without deleting uploaded media or other local cache", () => {
  const dormantMedia = { ...media, cursor: 1 };
  DB.put(cache, "another-background", dormantMedia);
  const exported = exportStore();
  DB.put(db, "accent", "#abcdef");
  DB.put(db, "widget/obsolete", {
    id: "obsolete",
    key: "widget/notes",
    order: 0,
    display: { position: "middleCentre" },
  });

  for (let count = 0; count < 2; count += 1) {
    importStore(JSON.parse(exported));

    expect(JSON.parse(exportStore())).toEqual(JSON.parse(exported));
    expect(DB.get(db, "widget/obsolete")).toBeUndefined();
    expect(DB.get(cache, background.id)).toBe(media);
    expect(DB.get(cache, "another-background")).toBe(dormantMedia);
  }
});

test.each([null, [], {}, { version: 4 }, { backgrounds: [] }])(
  "leaves settings and local media intact when an import is rejected: %j",
  (dump) => {
    const exported = exportStore();
    const configChanges = rstest.fn();
    const cacheChanges = rstest.fn();
    const stopConfig = DB.listen(db, configChanges);
    const stopCache = DB.listen(cache, cacheChanges);

    try {
      expect(() => importStore(dump)).toThrow();
      expect(exportStore()).toBe(exported);
      expect(DB.get(cache, background.id)).toBe(media);
      expect(configChanges).not.toHaveBeenCalled();
      expect(cacheChanges).not.toHaveBeenCalled();
    } finally {
      stopConfig();
      stopCache();
    }
  },
);

test("imports version 2 settings while preserving local media and replacing default widgets", () => {
  importStore({
    backgrounds: [{ ...background, active: true }],
    widgets: [
      {
        id: "legacy-time",
        key: "widget/time",
        display: { position: "topCentre" },
      },
    ],
    data: { [background.id]: { paused: true } },
    locale: "fr",
  });

  expect(DB.get(db, "background")).toMatchObject({
    ...background,
    display: { ...background.display, scale: true },
  });
  expect(DB.get(db, "data/uploaded-background")).toEqual({ paused: true });
  expect(DB.get(db, "widget/default-time")).toBeNull();
  expect(DB.get(db, "widget/default-greeting")).toBeNull();
  expect(DB.get(db, "widget/legacy-time")).toMatchObject({
    id: "legacy-time",
    order: 0,
  });
  expect(DB.get(db, "locale")).toBe("fr");
  expect(DB.get(db, "accent")).toBe("#3498db");
  expect(DB.get(cache, background.id)).toBe(media);
});

test("reset removes local uploads and restores settings defaults", () => {
  resetStore();

  expect(DB.get(db, "background")).toBeUndefined();
  expect(DB.get(db, "accent")).toBe("#3498db");
  expect(Array.from(DB.prefix(cache, ""))).toEqual([]);
});
