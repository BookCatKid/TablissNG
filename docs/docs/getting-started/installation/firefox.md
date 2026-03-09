---
title: Firefox Installation
sidebar_position: 2
---

import DataLossWarning from "../../\_data-loss-warning.mdx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export const FirefoxLink = () => {
const { siteConfig } = useDocusaurusContext();
const { storeUrls } = siteConfig.customFields;
return <a href={storeUrls.firefox}>Firefox Add-ons store</a>;
};

# Firefox Installation

## Stable Release (Recommended)

### Method 1: Firefox Add-ons

Install directly from the <FirefoxLink /> for automatic updates and the most stable experience.

---

## Nightly & Manual Installation

Use these methods if you want the absolute latest features (Nightly) or need to install TablissNG on a version of Firefox where the store is unavailable.

:::tip .xpi vs .zip

- **.xpi files**: These are compiled Firefox extensions. All `.xpi` files distributed in our releases are **signed** by Mozilla, meaning they can be installed permanently in any version of Firefox.
- **.zip files**: These contain the raw extension source code. These are generally used for **Temporary Installation** (Method 3), but can sometimes be installed permanently depending on your browser (Method 4).
  :::

### Method 2: Manual Installation

:::tip Nightly Signed Build
For the latest experimental features, you can install the **Signed Nightly** build. This version is signed by Mozilla and will work on standard Firefox releases.

<div style={{ marginBottom: "1rem" }}>
  <a href="https://github.com/BookCatKid/TablissNG/releases/download/nightly-auto/tablissng-1.6.5.0.xpi" className="button button--primary button--sm">Install Signed Nightly</a>
</div>

_(Current version: `v1.6.5.0`)_
:::

#### From a `.xpi`

1. **Go to the [Releases page](https://github.com/BookCatKid/TablissNG/releases)**.
2. Find the latest release (or [**nightly-auto**](https://github.com/BookCatKid/TablissNG/releases/tag/nightly-auto) for experimental features).
3. Download the `.xpi` file:
   - **Nightly**: `tablissng-X.X.X.X.xpi`
   - **Stable**: `tabliss-firefox.xpi`
4. In most cases this should automatically prompt you to install the extension 🎉. If not, then continue as follows:
5. In Firefox, go to `about:addons`.
6. Click the gear icon (⚙️) and select **"Install Add-on from File..."**.
7. Select the downloaded `.xpi` file.

#### From a `.zip`

If you have a `.zip` file, it is unsigned.

- On standard Firefox: You must use **Method 3** below to install it temporarily.
- On Developer Edition/Forks: You may be able to install it permanently using **Method 4**.

_Note: to get the absolute latest builds, you can download from [GitHub Actions](../../guides/github-artifacts)._

---

### Method 3: Temporary Installation (Standard Firefox)

If you want to test a build without permanent installation (e.g., from a `.zip` file), you can load it temporarily.

1. Open Firefox and type `about:debugging` in the address bar.
2. Click **"This Firefox"** in the sidebar.
3. Click **"Load Temporary Add-on..."**.
4. Select the `.zip` file.

_Note: The extension will be removed when you restart Firefox._

---

### Method 4: Permanent Unsigned (Dev Edition & Forks)

Firefox Developer Edition, Nightly, and many forks (like Zen) allow you to bypass signature requirements permanently:

1. Type `about:config` in the address bar and click "Accept the Risk and Continue".
2. Search for `xpinstall.signatures.required`.
3. Double-click the preference to set it to `false`.
4. You can now install unsigned `.zip` or `.xpi` files via **Method 2** and they will remain installed after a restart.

---

## Updating & Switching Versions

### How to Update

Standard installations via the **Firefox Add-ons store** should update automatically.

To force an update check:

1. Open Firefox and go to `about:addons`.
2. Click the **gear icon (⚙️)** in the top right.
3. Select **"Check for Updates"**.
4. This will trigger an update check for all installed extensions.

:::info
To update a manual installation, you can simply navigate to the [Releases page](https://github.com/BookCatKid/TablissNG/releases) in Firefox and click on the `.xpi` file. Firefox will automatically detect it as an update and prompt you to install it.
:::

### Switching Between Versions (Stable ↔ Nightly)

If you want to switch between Stable and Nightly builds, or manually update to a newer release without losing your settings, follow these steps:

1. Download the new version's `.xpi` file.
2. Open Firefox and go to `about:addons`.
3. Click the gear icon (⚙️) and select **"Install Add-on from File..."**.
4. Select the new `.xpi` file.

Because TablissNG uses a consistent extension ID, Firefox will treat this as an update to your existing installation, and all your settings will be preserved!

<DataLossWarning />
