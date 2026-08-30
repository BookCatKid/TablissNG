const assert = require("node:assert/strict");
const test = require("node:test");

const { buildCrowdinSeed, mergeCrowdinTranslation } = require("./crowdin");

const sourceCatalog = {
  greeting: { message: "Hello, {name}", description: "A greeting" },
  product: { message: "TablissNG", description: "Product name" },
  save: { message: "Save", description: "Save button" },
};

test("Crowdin seed excludes English placeholders and keeps intentional English", () => {
  const seed = buildCrowdinSeed(
    sourceCatalog,
    {
      greeting: "Bonjour, {name}",
      product: "TablissNG",
      save: "Save",
    },
    new Set(["product"]),
  );

  assert.deepEqual(seed, {
    greeting: { message: "Bonjour, {name}", description: "A greeting" },
    product: { message: "TablissNG", description: "Product name" },
  });
});

test("Crowdin import overlays downloaded translations without erasing existing work", () => {
  const merged = mergeCrowdinTranslation(
    {
      greeting: "Hello, {name}",
      product: "TablissNG",
      save: "Save",
    },
    {
      greeting: "Salut, {name}",
      product: "TablissNG",
      save: "Enregistrer",
    },
    { greeting: "Bonjour, {name}" },
    new Set(["product"]),
  );

  assert.deepEqual(merged, {
    greeting: "Bonjour, {name}",
    product: "TablissNG",
    save: "Enregistrer",
  });
});

test("Crowdin import rejects IDs that are not present in source", () => {
  assert.throws(
    () =>
      mergeCrowdinTranslation(
        { save: "Save" },
        { save: "Enregistrer" },
        { removed: "Supprimé" },
        new Set(),
      ),
    /unknown message IDs: removed/,
  );
});
