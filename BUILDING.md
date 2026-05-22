# Building TablissNG

This guide provides step-by-step instructions for setting up your development environment and building TablissNG from source for various platforms.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 22.x or higher is recommended.
- **pnpm**: You can install pnpm globally using npm: (you can also install it with other package managers, see https://pnpm.io/installation)

  ```bash
  npm install -g pnpm
  ```

- **Git**: To clone the repository.

## Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/BookCatKid/TablissNG.git
   cd TablissNG
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

## Development

To run TablissNG in development mode with hot reloading:

### Web Version (Browser Preview)

This will start a local development server and open the web version in your browser.

```bash
pnpm run dev
```

### Browser Extensions

To develop for specific browsers with auto-rebuild on file changes:

```bash
# Chromium (Chrome, Edge, Brave, etc.)
pnpm run dev:chromium

# Firefox
pnpm run dev:firefox

# Safari
pnpm run dev:safari
```

The output will be in the `dist/` directory.

### Loading the extension

- **Chromium**
  1.  Go to [chrome://extensions](chrome://extensions).
  2.  Enable Developer Mode (top right).
  3.  Click "Load unpacked".
  4.  Select the `dist/chromium` folder.

- **Firefox**
  1.  Go to [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox).
  2.  Click "Load Temporary Add-on".
  3.  Select the `manifest.json` inside the `dist/firefox` folder.

**Warning: Data Persistence Notice**

Installing manual or nightly builds alongside the store version can cause configuration conflicts. Switching back from a manual build to a store version often requires a full re-installation, which **will erase your settings and data** unless you have exported them. Always [export your settings](https://tablissng.smrff.dev/guides/backup-and-export) before switching versions.

## Building for Production

To create a production-ready build for a specific platform:

### Extension Builds

```bash
# Chromium (Chrome, Edge, Brave, etc.)
pnpm run build:chromium

# Firefox
pnpm run build:firefox

# Safari
pnpm run build:safari
```

### Web Build

```bash
pnpm run build
```

All production builds are located in the `dist/` directory, organized by platform (e.g., `dist/firefox/`, `dist/chromium/`).

## Other Scripts

- `pnpm test`: Run the test suite.
- `pnpm run lint`: Check for code style and potential errors.
- `pnpm run lint:fix`: Automatically fix linting errors.
- `pnpm run prettier`: Format the codebase using Prettier.
- `pnpm run prettier:check`: Check if the codebase follows Prettier formatting rules.
- `pnpm run typecheck`: Run TypeScript type checking.
- `pnpm run translations`: Extract and sync translation files.
- `pnpm run translations status`: Show translation status (`pnpm run translations status fr`).
- `pnpm run translations create`: Create a new locale file (`pnpm run translations create de-AT`) and add the locale to `src/locales/registry.ts`.
- `pnpm run translations compile`: Build production locale artifacts in `src/locales/lang.compiled`.
- `pnpm run translations migrate`: Migrate renamed translation keys (`pnpm run translations migrate --map old.id=new.id`).
- `pnpm run sign:firefox`: Manually sign the Firefox extension (requires credentials, mostly for gh workflows).
- `pnpm run deps:check`: Check for outdated dependencies using `npm-check`.
- `pnpm run deps:update`: Interactively update dependencies.
- `pnpm run prepare`: Set up Husky git hooks.
