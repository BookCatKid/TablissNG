import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "TablissNG Docs",
  titleDelimiter: "·",
  tagline: "A beautiful, private, and customizable new tab page",
  favicon: "img/icons/icon.svg",

  url: "https://tablissng.smrff.dev",
  baseUrl: "/",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true,
    faster: true,
  },

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "BookCatKid", // Usually your GitHub org/user name.
  projectName: "TablissNG", // Usually your repo name.

  customFields: {
    storeUrls: {
      firefox: "https://addons.mozilla.org/en-US/firefox/addon/tablissng/",
      chrome:
        "https://chromewebstore.google.com/detail/tablissng/dlaogejjiafeobgofajdlkkhjlignalk",
      edge: "https://microsoftedge.microsoft.com/addons/detail/tablissng/mkaphhbkcccpgkfaifhhdfckagnkcmhm",
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/BookCatKid/TablissNG/tree/main/docs/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.sass",
        },
        sitemap: {
          lastmod: "date",
          ignorePatterns: ["/data-loss-warning"],
          filename: "sitemap.xml",
          createSitemapItems: async (params) => {
            const items = await params.defaultCreateSitemapItems(params);
            const priority: Record<string, number> = {
              "/": 1.0,
              "/gallery": 0.9,
              "/intro": 0.9,
              "/features": 0.9,
            };
            const byPrefix: [string, number][] = [
              ["/getting-started", 0.7],
              ["/community", 0.7],
              ["/guides", 0.6],
              ["/developing", 0.6],
              ["/support", 0.5],
              ["/category", 0.5],
            ];
            for (const item of items) {
              const path = new URL(item.url).pathname;
              item.priority =
                priority[path] ??
                byPrefix.find(([p]) => path.startsWith(p))?.[1] ??
                0.5;
            }
            items.push({
              url: `${params.siteConfig.url}/web/`,
              priority: 0.8,
            });
            return items;
          },
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: ["docusaurus-plugin-sass"],

  themeConfig: {
    image: "img/screenshots/screenshot_1.png",
    metadata: [
      { property: "og:title", content: "TablissNG" },
      {
        property: "og:description",
        content: "A beautiful, private, and customizable new tab page",
      },
      {
        property: "og:image",
        content: "https://tablissng.smrff.dev/img/screenshots/screenshot_1.png",
      },
      { property: "og:url", content: "https://tablissng.smrff.dev" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#3498db" },
    ],
    navbar: {
      title: "TablissNG",
      logo: {
        alt: "TablissNG Logo",
        src: "img/icons/icon.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Documentation",
        },
        {
          to: "/gallery",
          label: "Gallery",
          position: "left",
        },
        {
          href: "https://tablissng.smrff.dev/web/",
          label: "Web Preview",
          position: "left",
        },
        {
          href: "https://github.com/users/BookCatKid/projects/3/views/1",
          label: "Roadmap",
          position: "left",
        },
        {
          href: "https://github.com/BookCatKid/TablissNG",
          position: "right",
          className: "header-github-link",
          "aria-label": "GitHub repository",
        },
      ],
    },
    footer: {
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Getting Started",
              to: "/intro",
            },
            {
              label: "Features",
              to: "/features",
            },
            {
              label: "Support",
              to: "category/support",
            },
            {
              label: "Gallery",
              to: "/gallery",
            },
            {
              label: "Web Preview",
              href: "https://tablissng.smrff.dev/web/",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "GitHub Issues",
              href: "https://github.com/BookCatKid/TablissNG/issues",
            },
            {
              label: "Roadmap",
              href: "https://github.com/users/BookCatKid/projects/3/views/1",
            },
            {
              label: "Contributing",
              to: "/community/contributing",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/BookCatKid/TablissNG",
            },
          ],
        },
      ],
      copyright: `TablissNG is open source and licensed under GPL-3.0. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
