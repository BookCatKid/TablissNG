---
title: GitHub Actions Artifacts
sidebar_position: 6
---

# GitHub Actions Artifacts

If you want to try out the absolute latest features before they are even released to the **nightly-auto** release, you can download build artifacts directly from GitHub Actions.

Artifacts are files generated during the build process of every commit. They are stored for a limited time (usually 90 days).

## How to Download Artifacts

1. **Go to the [Push Workflow page](https://github.com/BookCatKid/TablissNG/actions/workflows/push.yml)** on GitHub.
2. Click on the latest workflow run with a green checkmark.
3. Scroll down to the **Artifacts** section at the bottom of the page.
4. Click on the `.zip` file for your browser (e.g., `tabliss-chromium`, `tabliss-firefox`, or `tabliss-safari`) to download it.

:::note GitHub Account Required
You must be logged into a GitHub account to download artifacts directly from the Actions tab.

**If you don't have an account or can't log in:**
You can use [nightly.link](https://nightly.link/BookCatKid/TablissNG/workflows/push/main) to download the latest artifacts without a GitHub account.
:::

## Installing the Artifact

Once downloaded, you can follow the **Manual Installation** steps for your browser:

- [Chrome & Chromium](../getting-started/installation/chrome.md#method-2-manual-installation-developer-mode)
- [Firefox](../getting-started/installation/firefox.md#method-3-temporary-installation-standard-firefox)
- [Microsoft Edge](../getting-started/installation/edge.md#method-2-manual-installation)
- [Safari](../getting-started/installation/safari.md#installation)

:::tip Which artifact to choose?

- For Chrome, Edge, and Brave, use **`tabliss-chromium`**.
- For Firefox, use **`tabliss-firefox`**.
- For Safari, use **`tabliss-safari`**.
  :::
