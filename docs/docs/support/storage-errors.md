---
title: Storage & Cache Errors
sidebar_position: 2
---

# Storage & Cache Errors

TablissNG is unable to load or save settings. This is most commonly caused by private browsing mode, but permissions, disk space, or a corrupt browser profile can also cause issues.

## Storage Error

- **Check for known bugs**
  - Sometimes a browser update or a bug in TablissNG can cause storage issues.
  - Check the **[GitHub Issues](https://github.com/BookCatKid/TablissNG/issues)** to see if others are reporting the same problem. You can also open a new issue if the bug hasn't been reported yet.

- **Check you are not in private or incognito browsing mode**
  - This is important when using the web version of TablissNG.
  - This includes permanent private modes like Firefox's "Never remember history" settings.

- **Check you have plenty of disk space available on your device**
  - Browsers can delete storage if your disk space is low.
  - Choosing the **Persist Settings** option in the settings menu will ask the browser not to clear your settings, even when disk space is low. The **Persist Settings** option is only useful on web builds.

- **Check your browser profile is not corrupt**
  - **Firefox**: You can use the [Refresh Firefox](https://support.mozilla.org/en-US/kb/refresh-firefox-reset-add-ons-and-settings) option to reset.
  - **Chrome**: You can [create a new profile](https://support.google.com/chrome/answer/2364824) to test if it works there.

## Cache Error

This error will cause TablissNG to take longer to load and will prevent it from remembering images you upload to the "Upload Image" background. This error is caused by the same issues that cause the "Storage Error" above and can be fixed with the same steps.
