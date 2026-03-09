---
title: Microsoft Edge Installation
sidebar_position: 4
---

import DataLossWarning from '../../\_data-loss-warning.mdx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export const EdgeLink = () => {
const {siteConfig} = useDocusaurusContext();
const {storeUrls} = siteConfig.customFields;
return <a href={storeUrls.edge}>Microsoft Edge Add-ons store</a>;
};

# Microsoft Edge Installation

## Stable Release (Recommended)

### Method 1: Edge Add-ons

Install directly from the <EdgeLink /> for automatic updates and the most stable experience.

---

## Nightly & Manual Installation

Use these methods if you want the absolute latest features (Nightly) or want to install a specific version manually.

### Method 2: Manual Installation

1. **Go to the [Releases page](https://github.com/BookCatKid/TablissNG/releases)**.
2. Download the build you want:
   - **Stable**: `tabliss-chromium.zip` (from the latest release)
   - **Nightly**: `tabliss-chromium-nightly.zip` (from the [**nightly-auto**](https://github.com/BookCatKid/TablissNG/releases/tag/nightly-auto) release)
3. Unzip the file into a folder.
4. Open Edge and go to `edge://extensions/`.
5. Enable **"Developer mode"** (usually in the bottom left or under a sidebar).
6. Click **"Load unpacked"**.
7. Select the unzipped folder.

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

Standard installations via the **Microsoft Edge Add-ons store** should update automatically.

To force an update check:

1. Open Edge and go to `edge://extensions/`.
2. Ensure **Developer mode** is enabled (toggle in the sidebar or bottom left).
3. Click the **Update** button in the top toolbar.
4. This will trigger an update check for all installed extensions.

### Switching Between Versions (Stable ↔ Nightly)

If you want to switch between Stable and Nightly builds, or manually update to a newer release without losing your settings, follow these steps:

1. Download the new version's `.zip` file.
2. Extract the files to a folder on your computer.
3. Open Edge and go to `edge://extensions/`.
4. Click **"Load unpacked"** and select the new folder.
5. You can now safely delete the old folder.

Because TablissNG uses a consistent extension ID, the browser will treat this as an update to your existing installation, and all your settings will be preserved!

<DataLossWarning />
