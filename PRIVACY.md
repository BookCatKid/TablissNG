# Privacy Policy

TablissNG is designed to be local-first: it has no accounts, no advertising,
no analytics, and no tracking of your browsing activity.

## Crash Reports

TablissNG uses [Sentry](https://sentry.io/) to collect error reports that help us identify and fix bugs.

Automatic error reporting is enabled by default and can be disabled at any time in Settings or the Errors panel.

Error reports may include:

- The full error message, exception type, and stack trace, including source file names and line numbers.
- The TablissNG version and build target.
- Technical information such as browser and operating system type and version.

We configure Sentry to exclude user identifiers, cookies, HTTP headers, request and response bodies, browsing activity, breadcrumbs, session replay, performance tracing, and unrelated application data.

We do not intentionally collect your personal information, settings, widget contents, or browsing history through error reporting.

However, error messages and stack traces are generated at runtime and may occasionally contain sensitive information, such as a URL or a value included in an error message. We cannot guarantee that every error report is free of personal information.

Reports are transmitted to Sentry for processing and storage. Sentry may process network information, including your IP address, when receiving reports. We do not intentionally attach your IP address to error reports or use it to identify you.

You can disable automatic reporting at any time. Disabling it prevents subsequent error reports from being sent but does not delete reports that have already been submitted.

For more information about Sentry's handling of data, see its [privacy policy](https://sentry.io/privacy/).

## Optional Third-Party Services

Some widgets and background providers make requests to third-party services
that **you** choose and configure, for example weather providers, quote
providers, stock/crypto data, and image services such as Unsplash, GIPHY,
NASA, and Trello. When you enable these features, the request (including any
API key you provided) goes directly from your browser to that service and is
governed by that service's own privacy policy. These features are optional;
the extension works without them.

## Data Storage

Your settings are stored in your browser, not on our servers. Extension builds use browser sync storage, which may synchronize settings across your devices depending on your browser settings. Web builds use local IndexedDB.

## Your Choices

- Turn off crash reporting in Settings → System or in the Errors panel.
  Turning it off takes effect immediately and stops all future reports.
- Don't enable optional widgets or third-party providers.

## Changes

If this policy changes, the updated version will be published in this
repository with the release that contains the change.

## Contact

Questions? Email shenryroff@gmail.com or open an issue at
https://github.com/BookCatKid/TablissNG/issues
