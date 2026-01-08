require("dotenv/config");

const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const workbox = require("workbox-webpack-plugin");
const webpack = require("webpack");

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
  },
  mode: isProduction ? "production" : "development",
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [isWeb ? MiniCssExtractPlugin.loader : "style-loader", "css-loader"],
      },
      {
        test: /\.(gif|jpe?g|png)$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: isWeb ? "[name].[contenthash:12].[ext]" : "[name].[ext]",
        },
      },
      {
        test: /\.sass$/,
        use: [isWeb ? MiniCssExtractPlugin.loader : "style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.svg$/,
        loader: "raw-loader",
      },
      {
        test: /\.(ts|tsx)$/,
        include: path.resolve("./src"),
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              experimentalWatchApi: true
            }
          }
        ]
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: "target/shared" },
        {
          from: `target/${buildTarget}`,
          filter: (path) => !path.includes("index.html"),
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: `./target/${buildTarget}/index.html`,
    }),
    new MiniCssExtractPlugin({
      filename: isWeb ? "[name].[contenthash:12].css" : "[name].css",
    }),
    new webpack.DefinePlugin({
      BUILD_TARGET: JSON.stringify(buildTarget),
      DEV: JSON.stringify(!isProduction),
      GIPHY_API_KEY: JSON.stringify(process.env.GIPHY_API_KEY),
      VERSION: JSON.stringify(version),
      UNSPLASH_API_KEY: JSON.stringify(process.env.UNSPLASH_API_KEY),
      NASA_API_KEY: JSON.stringify(process.env.NASA_API_KEY),
      TRELLO_API_KEY: JSON.stringify(process.env.TRELLO_API_KEY),
    }),
  ],
  devtool: isWeb || !isProduction ? "source-map" : false,
  stats: {
    warnings: true,
  },
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};

if (isProduction) {
  config.plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
  );
}

if (!isWeb) {
  config.plugins.push(
    new webpack.ProvidePlugin({
      browser: "webextension-polyfill",
    }),
  );
}

if (isWeb && isProduction) {
  config.plugins.push(
    new workbox.GenerateSW({
      cacheId: "tabliss-cache",
      dontCacheBustURLsMatching: /\.\w{12}\./,
    }),
  );
}

module.exports = config;
