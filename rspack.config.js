const fs = require("fs");
if (fs.existsSync(".env")) {
  process.loadEnvFile();
}

const path = require("path");
const { rspack } = require("@rspack/core");
const { ReactRefreshRspackPlugin } = require("@rspack/plugin-react-refresh");

const buildTarget = process.env.BUILD_TARGET || "web";
const isProduction = process.env.NODE_ENV === "production";
const isWeb = buildTarget === "web";
const { version } = require("./package.json");

const config = {
  performance: {
    maxEntrypointSize: 1024000,
    maxAssetSize: 1024000,
  },
  entry: {
    polyfills: "./src/polyfills.ts",
    main: ["normalize.css", "./src/styles.sass", "./src/main.tsx"],
  },
  output: {
    path: path.resolve("dist", buildTarget),
    publicPath: isProduction ? "./" : "/",
    filename: isWeb ? "[name].[contenthash:12].js" : "[name].js",
    cssFilename: isWeb ? "[name].[contenthash:12].css" : "[name].css",
    clean: true,
  },
  mode: isProduction ? "production" : "development",
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        type: "css",
      },
      {
        test: /\.(gif|jpe?g|png)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 10000,
          },
        },
        generator: {
          filename: isWeb ? "[name].[contenthash:12][ext]" : "[name][ext]",
        },
      },
      {
        test: /\.sass$/,
        use: ["sass-loader"],
        type: "css",
      },
      {
        test: /\.svg$/,
        type: "asset/source",
      },
      {
        test: /\.(ts|tsx)$/,
        include: path.resolve("./src"),
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                parser: {
                  syntax: "typescript",
                  tsx: true,
                  dynamicImport: true,
                },
                transform: {
                  react: {
                    runtime: "automatic",
                    refresh: !isProduction,
                    development: !isProduction,
                  },
                },
                target: "es2020",
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    !isProduction && new ReactRefreshRspackPlugin(),
    new rspack.CopyRspackPlugin({
      patterns: [
        { from: "target/shared" },
        {
          from: `target/${buildTarget}`,
          filter: (absolutePath) => !absolutePath.includes("index.html"),
          transform: (content, absolutePath) => {
            if (absolutePath.endsWith("manifest.json")) {
              const manifest = JSON.parse(content.toString());
              if (!isProduction && manifest.background) {
                // In development, remove background service worker.
                // Workbox generates it only in production, and including it in dev breaks Chromium.
                delete manifest.background;
              }
              // Update version so that I don't have to update it manually in each manifest file for releases.
              manifest.version = version;
              return JSON.stringify(manifest, null, 2);
            }
            return content;
          },
        },
      ],
    }),
    new rspack.HtmlRspackPlugin({
      template: "./target/index.html",
      templateParameters: () => ({
        themeColorMeta: isWeb
          ? '<meta name="theme-color" content="#3498db" />'
          : "",
        manifestLink: isWeb ? '<link rel="manifest" href="pwa.json" />' : "",
      }),
    }),

    new rspack.DefinePlugin({
      BUILD_TARGET: JSON.stringify(buildTarget),
      DEV: JSON.stringify(!isProduction),
      GIPHY_API_KEY: JSON.stringify(process.env.GIPHY_API_KEY),
      VERSION: JSON.stringify(version),
      UNSPLASH_API_KEY: JSON.stringify(process.env.UNSPLASH_API_KEY),
      NASA_API_KEY: JSON.stringify(process.env.NASA_API_KEY),
      TRELLO_API_KEY: JSON.stringify(process.env.TRELLO_API_KEY),
    }),
  ].filter(Boolean),
  devtool: isWeb || !isProduction ? "source-map" : false,
  stats: {
    warnings: true,
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};

if (!isWeb) {
  config.plugins.push(
    new rspack.ProvidePlugin({
      browser: "webextension-polyfill",
    }),
  );
}

if (isProduction && buildTarget !== "firefox") {
  const workbox = require("workbox-build");
  config.plugins.push({
    apply(compiler) {
      compiler.hooks.afterEmit.tapPromise("WorkboxPlugin", async () => {
        await workbox.generateSW({
          cacheId: "tabliss",
          swDest: path.join(compiler.options.output.path, "service-worker.js"),
          globDirectory: compiler.options.output.path,
          globPatterns: [],
          skipWaiting: true,
          clientsClaim: true,
          sourcemap: false,
          runtimeCaching: [
            // Cache for APIs (short term)
            {
              urlPattern: ({ url }) =>
                url.hostname === "github-contributions-api.jogruber.de" ||
                url.hostname === "leetcode-api-pied.vercel.app" ||
                url.href.startsWith(
                  "https://api.github.com/repos/BookCatKid/tablissNG",
                ),

              handler: "CacheFirst",
              options: {
                cacheName: "tabliss-cache-apis",
                expiration: {
                  maxAgeSeconds: 24 * 60 * 60, // 1 day
                },
              },
            },

            // Cache favicons (long term)
            {
              urlPattern: ({ url }) =>
                url.href.startsWith("https://www.google.com/s2/favicons") ||
                url.hostname === "icons.duckduckgo.com" ||
                url.hostname === "favicone.com",

              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "tabliss-cache-swr",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                },
              },
            },

            // Cache images (use NetworkFirst to respect server cache-control headers)
            {
              urlPattern: ({ request }) => request.destination === "image",

              handler: "NetworkFirst",
              options: {
                cacheName: "tabliss-cache-images",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200], // allow opaque (0) responses to be cached
                },
              },
            },
          ],
        });
      });
    },
  });
}

module.exports = config;
