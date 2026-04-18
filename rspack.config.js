require("dotenv/config");

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

module.exports = config;
