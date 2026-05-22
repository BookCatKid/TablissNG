---
title: Sharing Error Logs
sidebar_position: 3
---

# Sharing Error Logs

TablissNG records errors that occur while you use it. You can easily copy and share these logs when reporting a bug.

## How to access your error logs

1. When an error occurs, a **⚠ warning icon** appears next to the settings icon on your New Tab page.
2. Click the **⚠ icon** to open the Errors panel.
3. Click **Copy Error Log** to copy all recorded errors to your clipboard, or take a screenshot of the Errors panel.
4. Paste the copied log or screenshot into a **[GitHub Issue](https://github.com/BookCatKid/TablissNG/issues/new)** so I can diagnose the problem.

## What is included in the log?

Each entry contains:

- **Timestamp** - when the error occurred.
- **Error message** - a description of what went wrong.
- **Stack trace** - technical details showing where the error originated (when available).

## Tips

- Errors are stored in memory and are **cleared when you close or refresh the tab**, so copy them before navigating away.
- If a widget shows **"Sorry this plugin has crashed!"**, an error has been recorded automatically. Open the Errors panel to see it.
