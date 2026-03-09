---
title: Chrome & Chromium Installation
sidebar_position: 3
---

import DataLossWarning from '../../\_data-loss-warning.mdx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export const ChromeLink = () => {
const {siteConfig} = useDocusaurusContext();
const {storeUrls} = siteConfig.customFields;
return <a href={storeUrls.chrome}>Chrome Web Store</a>;
};

# Chrome & Chromium Installation

## Stable Release (Recommended)

### Method 1: Chrome Web Store

Install directly from the <ChromeLink /> for automatic updates and the most stable experience.

---

## Nightly & Manual Installation

Use these methods if you want the absolute latest features (Nightly) or want to install a specific version manually.

### Method 2: Manual Installation (Developer Mode)

:::info key included in manifest
A key is included in the manifest primarily for ease of testing the Trello widget. The key makes the extension install with the same ID every time like it does on Firefox, even when manually installing it.
:::

1. **Go to the [Releases page](https://github.com/BookCatKid/TablissNG/releases)**.
2. Download the build you want:
   - **Stable**: `tabliss-chromium.zip` (from the latest release)
   - **Nightly**: `tabliss-chromium-nightly.zip` (from the [**nightly-auto**](https://github.com/BookCatKid/TablissNG/releases/tag/nightly-auto) release)
3. Unzip the file into a **permanent** folder on your computer.
4. Open Chrome and go to `chrome://extensions/`.
5. Enable **"Developer mode"** in the top right corner.
6. Click **"Load unpacked"**.
7. Select the folder where you unzipped the extension (ensure `manifest.json` is in the root of that folder).

:::warning Keep Folder Location
**Do not move or rename the extension folder after installation.** If you move or delete it, the extension will stop working.
:::

:::note
This **does** persist across browser restarts.
:::

_Note: to get the absolute latest builds, you can download from [GitHub Actions](../../guides/github-artifacts)._

---

## Updating & Switching Versions

### How to Update

Standard installations via the **Chrome Web Store** should update automatically.

To force an update check:

1. Open Chrome and go to `chrome://extensions/`.
2. Ensure **Developer mode** is enabled (toggle in the top right corner).
3. Click the **Update** button in the top toolbar.
4. This will trigger an update check for all installed extensions.

### Switching Between Versions (Stable ↔ Nightly)

If you want to switch between Stable and Nightly builds, or manually update to a newer release without losing your settings, follow these steps:

1. Download the new version's `.zip` file.
2. Extract the files to a folder on your computer.
3. Open Chrome and go to `chrome://extensions/`.
4. Click **"Load unpacked"** and select the new folder.
5. You can now safely delete the old folder.

Because TablissNG uses a consistent extension ID, the browser will treat this as an update to your existing installation, and all your settings will be preserved!

<DataLossWarning />
