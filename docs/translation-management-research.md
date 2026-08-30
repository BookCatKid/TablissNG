# Online translation management research

Research date: 2026-08-30

## Recommendation

Pilot **Crowdin's free Open Source program** first, with **Hosted Weblate Libre** as the no-cost fallback.

Crowdin is the best fit when both requirements are hard constraints: no subscription cost and minimal disruption to the mature existing translation pipeline. Its open-source license is free by application and currently includes unlimited projects, strings, and members. More importantly, FormatJS ships a built-in `crowdin` formatter in both directions. TablissNG can therefore keep source extraction, stable IDs, descriptions, ICU messages, locale registry, whitelists, fallback behavior, compilation, and CI validation under repository control while Crowdin supplies the browser-based contributor and review layer. Its official GitHub Action can upload source catalogs, download translations, and open translation pull requests. [Crowdin pricing and open-source program](https://crowdin.com/pricing), [FormatJS CLI formatters](https://formatjs.github.io/docs/tooling/cli/), [official Crowdin GitHub Action](https://github.com/crowdin/github-action)

Hosted Weblate remains the strongest free fallback and the better choice if using a fully libre, self-hostable service outweighs adapter convenience. It is GPL-licensed, VCS-first, supports GitHub pull requests, has a native Format.JS/React Intl JSON parser with ICU MessageFormat checks, and offers a gratis public Libre plan. TablissNG's current footprint is about 28,656 hosted strings by Weblate's counting method (597 messages across English plus 47 target languages), inside its 160,000-string allowance. [Weblate pricing](https://weblate.org/en/hosting/), [Format.JS JSON support](https://docs.weblate.org/en/latest/formats/formatjs.html), [VCS integration](https://docs.weblate.org/en/latest/vcs.html)

Do not select a service solely from its feature list. Run a two-language proof of concept (French plus one ICU-heavy/low-completion locale) before granting write access to the main branch.

## Current repository situation

- Stack: React 19, TypeScript, `react-intl` 10, and `@formatjs/cli` 6.
- Source messages are extracted from `src/**/*.{ts,tsx}` to `src/locales/extractedMessages/messages.json`. Each entry contains a stable explicit ID, `defaultMessage`, and usually a translator-facing `description`.
- There are currently **597 source messages** and **47 target-language files** under `src/locales/lang/<locale>.json`.
- Target catalogs are flat JSON objects (`message.id` to translated ICU string). They are normalized and sorted by the repository's `pnpm run translations` command.
- Current aggregate status is **6,424 / 28,059 translated values (22.9%)**. Completion is highly uneven: several locales are over 90%, while many are around 3-5%.
- `pnpm run translations status` does not refresh extraction before reading the ignored `messages.json` artifact. During this audit it initially reported 612 source strings and 22.3% completion; after extraction it correctly reported 597 and 22.9%. Fix this independently of the hosted-service choice.
- Missing translations are represented in target JSON by copying the English `defaultMessage`, not by an empty or missing value. The status script treats source-equal values as untranslated unless the ID appears in `whitelist_<locale>.json`.
- Forty-seven `whitelist_<locale>.json` files record strings intentionally left in English. These are repository-specific control files, not translation catalogs.
- Production uses generated, stripped catalogs in `src/locales/lang.compiled/`. Builds run `pnpm run translations compile`; these generated files should not be managed by a TMS.
- The registry in `src/locales/registry.ts` is the source of truth for locale labels and aliases (`zh` to `zh-CN`, `kp` to `ko-KP`). A TMS should not replace it.
- CI already runs `pnpm run translations --check`, which verifies extraction and checked-in catalogs are synchronized. Keep this check after adding hosted translation sync.
- The project is GPL-3.0 licensed (`LICENSE.txt`) and public on GitHub, making it a plausible candidate for each vendor's open-source program. Some programs add non-commercial/no-funding conditions, so eligibility still needs confirmation.

## Service comparison

| Service       | Repository/CI integration                                                                                                                                                                    | Format fit                                                                                                                                                                                                                     | Free/open-source and hosting                                                                                                                                                                                                                                                                                                                                     | Automation                                                                                                               | Fit and migration notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Weblate**   | Native Git backend and GitHub App support for incoming notifications, translation branches, pushes, and pull requests.                                                                       | Native **Format.JS JSON** parser for React Intl files; it automatically enables ICU MessageFormat validation. Simple flat JSON is also supported.                                                                              | Weblate itself is GPLv3+ and self-hostable; Docker is the recommended production installation. Hosted Libre projects can receive a public 160k-string plan gratis. Paid cloud currently starts at €47/month for 10k strings; this repo's all-language footprint would require at least the 40k (€70/month) paid tier if the Libre application were not approved. | Continuous localization pulls repository changes and commits translator changes; API/webhooks and add-ons are available. | Best free fallback. First verify in a sandbox that its Format.JS parser maps the rich extracted source catalog to this repo's flat target catalogs exactly and preserves the desired descriptions. Keep Weblate from touching whitelist and compiled files. [Format docs](https://docs.weblate.org/en/latest/formats/formatjs.html), [Git integration](https://docs.weblate.org/en/latest/vcs.html), [continuous localization](https://docs.weblate.org/en/latest/admin/continuous.html), [installation](https://docs.weblate.org/en/latest/admin/install.html), [pricing](https://weblate.org/en/hosting/)                                                                                                                                                           |
| **Crowdin**   | Official GitHub integration plus a first-party GitHub Action. The Action can upload sources/translations, download translations, preserve hierarchy, and create a PR.                        | JSON is supported, and Crowdin supports ICU syntax in its editor. FormatJS CLI itself provides a built-in `crowdin` extraction formatter, which is useful for preserving source metadata in a Crowdin-oriented source catalog. | Proprietary hosted SaaS; no self-hosted edition identified in official product/docs. The open-source program currently grants unlimited projects, strings, and members. Paid-plan limits are based on hosted words (source words times target languages).                                                                                                        | GitHub Action, CLI, API, webhooks, translation memory, machine translation/AI, and a large integration marketplace.      | Best fit under the clarified requirements and probably the lowest-friction CI implementation. It introduces a service-specific source-catalog generation step if translator descriptions are to be imported cleanly. Decide whether the native GitHub integration or Action owns sync; do not enable both bidirectionally. [Pricing](https://crowdin.com/pricing), [GitHub Action](https://github.com/crowdin/github-action), [ICU support](https://crowdin.com/blog/icu-syntax-in-crowdin), [FormatJS CLI formatters](https://formatjs.github.io/docs/tooling/cli/)                                                                                                                                                                                                  |
| **Lokalise**  | GitHub app can automatically pull selected source files after repository pushes and can export translations as pull requests.                                                                | JSON exports support ICU plural and placeholder formats. FormatJS CLI includes a built-in `lokalise` formatter.                                                                                                                | Proprietary hosted SaaS; no self-hosted edition identified in official product/docs. Lokalise says it is free for qualifying open-source projects; otherwise it offers a 14-day trial followed by paid plans. Current plans meter processed words, seats, target languages, automations, and integrations.                                                       | API, CLI, webhooks, workflow templates/automations, translation memory, AI/MT, tasks, and app integrations.              | Capable but less attractive here unless its editor/workflows are preferred. Confirm that the open-source offer supports all 47 targets and the needed GitHub automation; the normal Explorer plan is limited to 10 target languages. [GitHub integration](https://docs.lokalise.com/en/articles/1684090-github), [ICU export options](https://developers.lokalise.com/reference/api-plurals-and-placeholders), [plans](https://docs.lokalise.com/en/articles/5159153-available-plans-and-payment-methods), [pricing/open-source offer](https://lokalise.com/pricing/), [FormatJS CLI formatters](https://formatjs.github.io/docs/tooling/cli/)                                                                                                                        |
| **Transifex** | Native GitHub integration watches a configured branch, pulls changes automatically, and can push completed translations via commits/PRs. CLI-based CI, API, and webhooks are also supported. | Supports key-value and structured JSON, including a subset of ICU MessageFormat; official docs say JSON with ICU plurals is supported. FormatJS CLI includes a built-in `transifex` formatter.                                 | Proprietary hosted SaaS; no self-hosted edition identified in official product/docs. Free open-source access requires an OSI-approved license and **no funding, revenue, or commercialization model**; open-source projects must be public. Paid Starter pricing currently begins around $160/month depending on hosted-word selection.                          | GitHub auto-sync, CLI push/pull, API, webhooks, translation memory, MT/AI, and completion thresholds.                    | Technically sound, but the open-source eligibility condition is stricter and the paid floor is comparatively high. Also test all current ICU `select` messages: Transifex documents support for only part of ICU MessageFormat. [GitHub integration](https://help.transifex.com/en/articles/6265125-github-installation-and-configuration), [file formats](https://help.transifex.com/en/articles/6219670-introduction-to-file-formats), [ICU support](https://help.transifex.com/en/articles/6231958-working-with-plurals-and-genders), [developer automation](https://help.transifex.com/en/articles/6596399-developer-hub), [open-source terms](https://help.transifex.com/en/articles/6236788-open-source-projects), [pricing](https://www.transifex.com/pricing) |

### Ranking for TablissNG

1. **Crowdin Open Source** — best fit with the existing FormatJS pipeline, free if the open-source application is approved, and the smoothest source-metadata/CI path.
2. **Hosted Weblate Libre** — sufficient free capacity, low lock-in, and a self-host path; use it if Crowdin eligibility is denied or a fully libre service is preferred.
3. **Lokalise Open Source** — polished option, but confirm that the gratis offer removes normal language/integration limits.
4. **Transifex Open Source** — good tooling, but stricter eligibility and partial ICU support make it a weaker first choice.

## Migration implications and safeguards

### 1. Preserve the repository as source of truth

Developers should continue to define IDs, English defaults, and descriptions in TypeScript. The extraction script should continue generating the source catalog. Translators should modify only target values through the service. Disable TMS-side creation/deletion of source IDs unless there is a deliberate workflow for syncing those edits back to code.

### 2. Do not naïvely import the target catalogs

Because source-equal English strings currently mean “untranslated,” importing every value as a completed translation would incorrectly report roughly 77% of the catalog as translated. For initial seeding, generate temporary import files that:

- include only values different from the English default; and
- also include source-equal values whose IDs are in that locale's whitelist, marked intentionally approved if the service supports that state.

The temporary seed files should not become runtime artifacts. After export, the existing `pnpm run translations` command can repopulate missing keys with English defaults.

### 3. Map only canonical inputs and outputs

- Source input: `src/locales/extractedMessages/messages.json`, or a generated vendor-specific source catalog produced by FormatJS CLI.
- Translation outputs: `src/locales/lang/<locale>.json` only.
- Exclude: `src/locales/lang/whitelist_*.json`, `src/locales/lang.compiled/*.json`, registry code, and extracted `.gitignore` files.

### 4. Normalize locale codes explicitly

Create a checked-in mapping between vendor locale identifiers and repository filenames, especially for `ca-ES`, `en-AU`, `en-CA`, `en-GB`, `ko-KP`, `pt`, `pt-BR`, `zh-CN`, `zh-TW`, and `tok`. Keep the runtime aliases in `registry.ts`; do not let a vendor rename files automatically.

### 5. Keep validation in pull requests

Translation updates should arrive on a dedicated branch/PR, not write directly to `main`. The PR workflow should run:

1. `pnpm run translations --check`
2. `pnpm run translations status`
3. `pnpm run translations compile` (or the existing build that invokes it)
4. `pnpm test`

Add an ICU placeholder/structure gate if the chosen TMS does not enforce full FormatJS syntax. Pay special attention to ICU `select`, plurals, rich-text tags such as `<link>`, and ordinary placeholders such as `{count}`.

### 6. Avoid two writers

Choose one synchronization direction and owner. A safe model is:

- repository push updates the TMS source catalog;
- completed/approved translations generate one bot PR;
- the repository's sync command normalizes that PR;
- compiled catalogs are regenerated only during CI/build.

Do not simultaneously run a vendor GitHub app and vendor CLI workflow that both pull and push the same files.

## Proposed next steps

1. Apply for Crowdin's Open Source license and confirm approval before building the integration. Do not design around a paid-plan trial.
2. Make `translations status` extract first (or give its stale-artifact mode an explicit flag), and add FormatJS ICU/structural verification to CI.
3. Create a Crowdin sandbox against a disposable branch or fork, using FormatJS's built-in `crowdin` format for both extraction and compilation.
4. Keep vendor-shaped catalogs in an integration/staging path. Compile them into the existing flat `src/locales/lang/*.json` shape; exclude whitelist and compiled paths from vendor ownership.
5. Seed only French and one low-completion locale using filtered imports, then export to a PR.
6. Verify exact key count, locale filenames, ICU messages, descriptions/context visibility, source-equal handling, JSON formatting, and CI results.
7. If Crowdin rejects the open-source application or its workflow cannot preserve the repository's semantics, repeat the proof of concept on Hosted Weblate Libre.
8. After a successful pilot, document contributor onboarding in `TRANSLATING.md`, make the service the normal translation entry point, and retain the local CLI for extraction, migrations, status, normalization, and builds.
