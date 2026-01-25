<p align="left">
  <img src="src/views/shared/tabliss.svg" alt="TablissNG logo" width="400" />
</p>

> A beautiful, customisable New Tab page for Firefox and Chrome.

<img src="screenshots/screenshot_1.png" width="49%"/> <img src="screenshots/screenshot_2.png" width="50%"/>
<img src="screenshots/screenshot_3.png" width="49%"/> <img src="screenshots/screenshot_4.png" width="50%"/>
<img src="screenshots/screenshot_5.png" width="24%"/>
<img src="screenshots/screenshot_6.png" width="24%"/>
<img src="screenshots/screenshot_7.png" width="24%"/>
<img src="screenshots/screenshot_8.png" width="24%"/>

<div align="center">
    <a href="https://chromewebstore.google.com/detail/tablissng/dlaogejjiafeobgofajdlkkhjlignalk">
        <img src="https://img.shields.io/chrome-web-store/users/dlaogejjiafeobgofajdlkkhjlignalk?logo=googlechrome&logoColor=ffffff&color=0779ba"></a>
    <a href="https://addons.mozilla.org/en-US/firefox/addon/tablissng/">
        <img src="https://img.shields.io/amo/users/tablissng?logo=firefoxbrowser&logoColor=ffffff"></a>
    <a href="https://github.com/BookCatKid/TablissNG/stargazers">
        <img src="https://img.shields.io/github/stars/BookCatKid/TablissNG?style=flat"></a>
    <a href="https://github.com/BookCatKid/TablissNG/commits/main/">
        <img src="https://img.shields.io/github/last-commit/BookCatKid/TablissNG?color=0779ba"></a>
    <a href="https://github.com/BookCatKid/TablissNG/releases/latest">
        <img src="https://img.shields.io/github/v/release/BookCatKid/TablissNG.svg?logo=github"></a>
    <a href="https://www.gnu.org/licenses/gpl-3.0">
        <img src="https://img.shields.io/badge/License-GNU%20GPL%20v3-blue"></a>
</div>

## Maintained Fork of Tabliss

This repository is a maintained fork of Tabliss, originally a customizable new tab page for Firefox and Chrome. The original project has been abandoned, with no updates for over a year and numerous unmerged pull requests. I cloned the repository and merged most pending pull requests to bring in improvements and bug fixes. Moving forward, I will actively maintain and update this fork to keep Tabliss functional and up to date.

### What's Next?

- Continued updates and bug fixes
- Adding new features from community contributions
- Keeping dependencies up to date

If you were a contributor to the original repo or have ideas for improvements, feel free to open an issue or submit a pull request. Let’s keep Tabliss alive!

### Looking for contribution ideas?

Check out the [github project](https://github.com/users/BookCatKid/projects/3?query=sort%3Aupdated-desc+is%3Aopen) for a list of features that are wanted, but not yet implemented. Anything not in `in progress` is most likely free for you to work on!

---

## Brief Overview of a Few Improvements Over Tabliss

This list is by no means exhaustive. TablissNG includes many other tweaks, quality-of-life improvements, and features not detailed here.

- Customization
  - Support for custom search engines and browser defaults
  - Many more style options in display/font settings (eg. scale, underline, text outline, custom css class)

- Widgets
  - Time Tracker, Bitcoin Mempool, Top Sites, Binary Clock, Bookmarks, Custom HTML.
  - Enhancements: Daily Routine for Todos, Bible verses in Quotes, Markdown in Notes
  - "Free Move" mode for dragging widgets (very beta, but functional)

- Backgrounds & Visuals
  - Wikimedia Image of the Day, NASA APOD
  - Support for Videos, GIFs, and online image URLs
  - Automatic night dimming and random gradients

- Interface & Accessibility
  - Full dark mode
  - Complete translation support for all settings

## Installation

<a href="https://addons.mozilla.org/en-US/firefox/addon/tablissng/"><img src="https://blog.mozilla.org/addons/files/2020/04/get-the-addon-fx-apr-2020.svg" height="70"></a>
<a href="https://chromewebstore.google.com/detail/tabliss-a-beautiful-new-t/dlaogejjiafeobgofajdlkkhjlignalk"><img src="https://developer.chrome.com/static/docs/webstore/branding/image/HRs9MPufa1J1h5glNhut.png" alt="Get the Extension on Chrome" height="70" style="border: 1px solid transparent; border-radius:6px;"></a>
<a href="https://microsoftedge.microsoft.com/addons/detail/tablissng/mkaphhbkcccpgkfaifhhdfckagnkcmhm"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Get_it_from_Microsoft_Badge.svg/320px-Get_it_from_Microsoft_Badge.svg.png" alt="Get the Extension on Edge" height="70" style="border: 1px solid transparent; border-radius:4px;"></a>

The extension is available in the [Firefox Add-ons Store](https://addons.mozilla.org/en-US/firefox/addon/tablissng/), in the [Chrome Web Store](https://chromewebstore.google.com/detail/tabliss-a-beautiful-new-t/dlaogejjiafeobgofajdlkkhjlignalk), and in the [Edge Add-ons Store](https://microsoftedge.microsoft.com/addons/detail/tablissng/mkaphhbkcccpgkfaifhhdfckagnkcmhm). If you want to use safari, see [INSTALL.md](INSTALL.md).

**Nightly Builds (Firefox):**

- **Nightly** (v1.6.1.2): [Install Nightly](https://github.com/BookCatKid/TablissNG/releases/download/nightly-auto/tablissng-1.6.1.2.xpi)

If you want to install the extension manually, or want nightly builds, see [INSTALL.md](INSTALL.md).

## Running Locally

For local development, you'll need Node.js and NPM installed. Latest versions should work.

First, clone the repo:

```sh
git clone https://github.com/BookCatKid/TablissNG.git
cd TablissNG
```

Then install the dependencies:

```sh
npm install
```

### Available Commands

- `npm run dev` — Start a local development server
- `npm run build` — Build the project
- `npm run test` — Run tests
- `npm run translations` — Manage translation files (see TRANSLATING.md)
- `npm run lint:fix` — Run ESLint with --fix (or just `npm run lint` for checking)
- `npm run prettier` — Run Prettier with --write (or npm run `prettier:check` for checking)
- `npm run deps:update` — Run interactive dependency update tool (or `npm run deps:check` to just check for updates and unused dependencies)

By default, build and dev will target the web version. To specify a platform (Chromium or Firefox), append `:chromium` or `:firefox` to the command. For example:

```sh
npm run dev:chromium
npm run build:firefox
```

<details>
  <summary>To test extension locally</summary>
  <br>
  <p>Find the extension in <code>dist</code> folder.</p>

  <p>For Chrome, go to <code>chrome://extensions</code>, turn on devoloper mode and click on "Load unpacked".</p>

  <p>For Firefox, go to <code>about:debugging#/runtime/this-firefox</code> and click on "Load Temporary Add-on".</p>
</details>

### Environment variables

To develop with external services, you'll need to sign up for API keys and enter them into your `.env` file. Start by copying the example:

```sh
cp .env.example .env
```

Then, fill in your API keys:

```ini
GIPHY_API_KEY=your_key_here
UNSPLASH_API_KEY=your_key_here
NASA_API_KEY=your_key_here
TRELLO_API_KEY=your_key_here # this requires the correct redirect URI to be set up in your Trello app settings: https://53dad6be72180770ccc08f0a6e2fc8a64dcf7b42.extensions.allizom.org and https://dlaogejjiafeobgofajdlkkhjlignalk.chromiumapp.org should work for firefox and chromium respectively.
```

## Credits

Special thanks to **joelshepherd** for originally creating and maintaining this project.
Also, huge appreciation to everyone who contributed, especially those whose pull requests I merged!

<a href="https://github.com/BookCatKid/TablissNG/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=BookCatKid/TablissNG&max=30" />
</a>

## Contributing

Take a look at the guide to [contributing](CONTRIBUTING.md) before starting.

## Translations

Check out the guide to [adding translations](TRANSLATING.md).
