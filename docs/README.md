# TablissNG Documentation

This is the source code for the TablissNG documentation and landing page, built using [Docusaurus v3](https://docusaurus.io/).

## Shared Assets

To avoid duplication, several assets are synced from the root of the project during the build process:

- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `TRANSLATING.md`
- `BUILDING.md`
- Project screenshots and icons

This is handled by the `sync-assets.js` script, which runs automatically before starting or building the site.

## Local Development

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Start the development server**:
   ```bash
   pnpm start
   ```
   This will run the asset sync and start the Docusaurus development server at [http://localhost:3000/](http://localhost:3000/).

## Build

To generate the static site:

```bash
pnpm run build
```

The output will be located in the `build/` directory.

You can view all available scripts by running:

```bash
pnpm run
```

## Deployment

Deployment is handled automatically via GitHub Actions whenever changes are pushed to the `main` branch. The site is hosted at `https://tablissng.smrff.dev/` (with the web preview at `https://tablissng.smrff.dev/web/`).

The documentation build is part of a unified workflow that assembles both the main web preview and the documentation site into a single deployment.
