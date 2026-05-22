---
sidebar_position: 5
---

# Safari Installation

Due to Apple's developer program requirements, TablissNG is currently not available on the official Mac App Store. You can install it manually using Safari's developer tools.

:::caution
Unsigned Safari extensions can only be installed temporarily. This means that every time you restart your browser, the extension will be removed and will need to be reinstalled.
:::

### Installation

1. **Download the build**: Go to the [Releases page](https://github.com/BookCatKid/TablissNG/releases) and download `tabliss-safari.zip`.
2. **Unzip**: Extract the contents to a permanent location on your Mac.
3. **Enable Developer Menu**:
   - Open Safari and go to **Safari > Settings** (or **Preferences**) in the menu bar.
   - Navigate to the **Advanced** tab.
   - Check the box **"Show features for web developers"** (or "Show Develop menu in menu bar").
4. **Load Extension**:
   - In the menu bar, go to **Develop > Add Temporary Extension...**.
   - Select the folder you unzipped in step 2.
5. **Enable**:
   - In the **Extensions** settings window that appears, ensure TablissNG is checked.
   - Click **"Use for new windows and tabs"** if prompted.
   - If it's not working, go to the **General** tab in Settings and select **TablissNG** for the two **New windows open with** and **New tabs open with** options.

_Note: The extension will be removed when you restart Safari. To get the absolute latest builds, you can download from [GitHub Actions](../../guides/github-artifacts)._
