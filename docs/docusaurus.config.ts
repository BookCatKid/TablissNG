import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "TablissNG Docs",
  titleDelimiter: "·",
  tagline: "A beautiful, customizable New Tab page",
  favicon: "img/icons/icon.svg",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://bookcatkid.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/TablissNG/docs/",

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
      } satisfies Preset.Options,
    ],
  ],
  plugins: ["docusaurus-plugin-sass"],

  themeConfig: {
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
          href: "https://bookcatkid.github.io/TablissNG/",
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
              href: "https://bookcatkid.github.io/TablissNG/",
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
    metadata: [
      {
        name: "google-site-verification",
        content: "-jqlgm-10aLbyq4UgXkXf0JTZW7tXeB18i2XTAO8QJQ",
      },
    ],
  } satisfies Preset.ThemeConfig,
};

export default config;
