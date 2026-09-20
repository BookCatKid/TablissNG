// Builds each target, injects debug IDs, uploads source maps to Sentry, then
// deletes them from dist/. Package dist/ AFTER running — injection rewrites
// the shipped JS.
//
//   node scripts/sentry-sourcemaps.mjs [target|all] [--no-build]

import { execFileSync } from "node:child_process";
import { existsSync, globSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

if (existsSync(".env")) process.loadEnvFile();

const require = createRequire(import.meta.url);
const { SentryCli } = require("@sentry/cli");
const { version } = require("../package.json");

const ORG = "simon-roff";
const PROJECT = "tablissng";
const TARGETS = ["chromium", "firefox", "safari", "web"];

const args = process.argv.slice(2);
const noBuild = args.includes("--no-build");
const arg = args.find((a) => !a.startsWith("--")) ?? "all";
const targets = arg === "all" ? TARGETS : [arg];
const release = `tablissng@${version}`;

const mapsIn = (dir) => globSync("**/*.map", { cwd: dir });

if (noBuild) {
  // Only builds run under this script emit maps (SENTRY_SOURCEMAPS=1), so
  // without them there is nothing to inject or upload.
  const missing = targets.filter(
    (target) =>
      !existsSync(`dist/${target}`) || mapsIn(`dist/${target}`).length === 0,
  );
  if (missing.length > 0) {
    console.error(
      `No source maps found in ${missing.map((t) => `dist/${t}`).join(", ")} — drop --no-build to build with maps.`,
    );
    process.exit(1);
  }
}

if (!process.env.SENTRY_AUTH_TOKEN) {
  try {
    process.env.SENTRY_AUTH_TOKEN = execFileSync("sentry", ["auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    // `sentry` CLI not installed or not logged in
  }
}
if (!process.env.SENTRY_AUTH_TOKEN) {
  console.error(
    "Set SENTRY_AUTH_TOKEN in .env to upload source maps, or run `sentry auth login`.",
  );
  process.exit(1);
}

const cli = new SentryCli(null, { org: ORG, project: PROJECT });

// Created implicitly by the upload if missing; done first so auth or
// permission problems fail fast.
await cli
  .execute(["releases", "new", release], true)
  .catch(() => console.log(`Release ${release} already exists`));

for (const target of targets) {
  const dir = `dist/${target}`;
  if (!noBuild) {
    console.log(`\nBuilding ${target} (with source maps)`);
    execFileSync("pnpm", ["run", `build:${target}`], {
      stdio: "inherit",
      env: { ...process.env, SENTRY_SOURCEMAPS: "1" },
    });
  }
  console.log(`\nUploading source maps for ${dir} (dist=${target})`);
  await cli.execute(["sourcemaps", "inject", dir], true);
  await cli.execute(
    ["sourcemaps", "upload", dir, "--release", release, "--dist", target],
    true,
  );
  for (const map of mapsIn(dir)) {
    rmSync(join(dir, map));
  }
  console.log(`Removed source maps from ${dir}`);
}
