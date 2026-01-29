const fs = require("fs/promises");
const { execSync } = require("child_process");
const path = require("path");

const ADDON_ID = "extension@tabliss-maintained";
const GH_HEADERS = {
  Authorization: `token ${process.env.GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "TablissNG-Release",
};

async function run() {
  try {
    const missing = [];
    if (!process.env.GITHUB_TOKEN) missing.push("GITHUB_TOKEN");
    if (!process.env.WEB_EXT_API_KEY) missing.push("WEB_EXT_API_KEY");
    if (!process.env.WEB_EXT_API_SECRET) missing.push("WEB_EXT_API_SECRET");

    if (missing.length > 0) {
      throw new Error(`Missing secrets: ${missing.join(", ")}`);
    }

    console.log("Running tests...");
    execSync("npm run test", { stdio: "inherit" });

    const pkg = JSON.parse(await fs.readFile("./package.json", "utf-8"));
    const baseVer = pkg.version;

    let updates = { addons: { [ADDON_ID]: { updates: [] } } };
    try {
      updates = JSON.parse(await fs.readFile("./updates.json", "utf-8"));
    } catch {
      console.log("Failed to read updates.json, using empty object");
    }

    const history = updates.addons[ADDON_ID].updates;
    const last = history[history.length - 1];
    const patch =
      last && last.version.startsWith(baseVer)
        ? parseInt(last.version.split(".")[3]) + 1
        : 0;
    const version = `${baseVer}.${patch}`;
    console.log(`Version: ${version}`);

    console.log("Building and signing...");
    execSync("npm run build:firefox", { stdio: "inherit" });

    // Honestly no idea if this even works
    const manifestPath = "./dist/firefox/manifest.json";
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));
    manifest.version = version;
    manifest.browser_specific_settings.gecko.update_url = `https://raw.githubusercontent.com/BookCatKid/TablissNG/main/updates.json`;
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    execSync(
      `npx web-ext sign --source-dir ./dist/firefox --artifacts-dir ./dist/signed --channel unlisted`,
      { stdio: "inherit" },
    );

    const signedFiles = await fs.readdir("./dist/signed");
    const xpi = signedFiles.find((f) => f.endsWith(".xpi"));
    const newXpiPath = path.join("./dist", `tablissng-${version}.xpi`);
    await fs.rename(path.join("./dist/signed", xpi), newXpiPath);

    console.log("Managing release...");
    let res = await fetch(
      `https://api.github.com/repos/BookCatKid/TablissNG/releases/tags/nightly-auto`,
      { headers: GH_HEADERS },
    );
    let release = res.ok ? await res.json() : null;

    if (!release) {
      throw new Error('Release "nightly-auto" not found');
    }

    for (const asset of release.assets) {
      if (/tablissng-.*\.xpi/.test(asset.name)) {
        await fetch(asset.url, { method: "DELETE", headers: GH_HEADERS });
      }
    }

    console.log("Uploading...");
    const fileData = await fs.readFile(newXpiPath);
    const uploadUrl = release.upload_url.replace(
      "{?name,label}",
      `?name=tablissng-${version}.xpi`,
    );
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        ...GH_HEADERS,
        "Content-Type": "application/x-xpinstall",
        "Content-Length": fileData.length,
      },
      body: fileData,
    });
    const downloadUrl = (await uploadRes.json()).browser_download_url;

    console.log("Updating files...");
    updates.addons[ADDON_ID].updates.push({
      version,
      update_link: downloadUrl,
    });
    await fs.writeFile("./updates.json", JSON.stringify(updates, null, 2));

    let readme = await fs.readFile("README.md", "utf-8");
    readme = readme
      .replace(
        /\*\*Nightly\*\* \(v\d+\.\d+\.\d+\.\d+\):/g,
        `**Nightly** (v${version}):`,
      )
      .replace(
        /\[Install Nightly\]\(https:\/\/github\.com\/BookCatKid\/TablissNG\/releases\/download\/nightly-auto\/tablissng-.*\.xpi\)/g,
        `[Install Nightly](${downloadUrl})`,
      );
    await fs.writeFile("README.md", readme);

    let install = await fs.readFile("INSTALL.md", "utf-8");
    await fs.writeFile(
      "INSTALL.md",
      install.replace(
        /tablissng-\d+\.\d+\.\d+\.\d+\.xpi/g,
        `tablissng-${version}.xpi`,
      ),
    );

    console.log("Pushing changes...");
    execSync('git config user.name "github-actions[bot]"', {
      stdio: "inherit",
    });
    execSync(
      'git config user.email "github-actions[bot]@users.noreply.github.com"',
      { stdio: "inherit" },
    );
    execSync("git add updates.json README.md INSTALL.md", { stdio: "inherit" });
    execSync('git commit -m "chore: signed firefox nightly build"', {
      stdio: "inherit",
    });
    execSync("git push", { stdio: "inherit" });

    console.log("Done.");
  } catch (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  }
}

run();
