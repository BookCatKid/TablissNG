# Building TablissNG

This guide provides step-by-step instructions for setting up your development environment and building TablissNG from source for various platforms.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 22.x or higher is recommended.
- **npm**: Usually comes bundled with Node.js.
- **Git**: To clone the repository.

## Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/BookCatKid/TablissNG.git
   cd TablissNG
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Development

To run TablissNG in development mode with hot reloading:

### Web Version (Browser Preview)

This will start a local development server and open the web version in your browser.

```bash
npm run dev
```

### Browser Extensions

To develop for specific browsers with auto-rebuild on file changes:

```bash
# Chromium (Chrome, Edge, Brave, etc.)
npm run dev:chromium

# Firefox
npm run dev:firefox

# Safari
npm run dev:safari
```

The output will be in the `dist/` directory. You can then load this as an "unpacked extension" in your browser.

**Warning: Data Persistence Notice**

Installing manual or nightly builds alongside the store version can cause configuration conflicts. Switching back from a manual build to a store version often requires a full re-installation, which **will erase your settings and data** unless you have exported them. Always [export your settings](https://bookcatkid.github.io/TablissNG/docs/guides/backup-and-export) before switching versions.

## Building for Production

To create a production-ready build for a specific platform:

### Extension Builds

```bash
# Chromium (Chrome, Edge, Brave, etc.)
npm run build:chromium

# Firefox
npm run build:firefox

# Safari
npm run build:safari
```

### Web Build

```bash
npm run build
```

All production builds are located in the `dist/` directory, organized by platform (e.g., `dist/firefox/`, `dist/chromium/`).

## Other Scripts

- `npm test`: Run the test suite.
- `npm run lint`: Check for code style and potential errors.
- `npm run lint:fix`: Automatically fix linting errors.
- `npm run prettier`: Format the codebase using Prettier.
- `npm run prettier:check`: Check if the codebase follows Prettier formatting rules.
- `npm run typecheck`: Run TypeScript type checking.
- `npm run translations`: Manage and update translation files.
- `npm run sign:firefox`: Manually sign the Firefox extension (requires credentials, mostly for gh workflows).
- `npm run deps:check`: Check for outdated dependencies using `npm-check`.
- `npm run deps:update`: Interactively update dependencies.
- `npm run prepare`: Set up Husky git hooks.
