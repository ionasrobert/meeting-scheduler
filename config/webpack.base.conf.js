const path = require('path');
const webpack = require('webpack');

const loadersPath = path.resolve(__dirname, 'loaders');
const cssMasterClassLoader = path.resolve(
  loadersPath, 'css-master-class-loader',
);
const srcPath = path.resolve(__dirname, '../src/');
const nodeModulePath = path.resolve(__dirname, '../node_modules/');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PostCssDiscardFontFace = require('postcss-discard-font-face');
const CssNano = require('cssnano');
const AutoPrefixer = require('autoprefixer');
const common = require('./common');

function generateConfig(env = {}) {
  const devMode = env.mode === 'development';

  const cssMinifier = (env.optimization && env.optimization.minimize)
    ? [CssNano()] : [];

  const styleLoaders = [
    devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        plugins: () => [
          PostCssDiscardFontFace(['woff']),
          AutoPrefixer(),
        ].concat(cssMinifier),
      },
    },
    cssMasterClassLoader,
  ];

  return {
    mode: env.mode,
    entry: env.entry,
    resolve: {
      extensions: ['.js'],
      modules: common.resolvePaths,
    },
    output: env.output,
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.js$/,
          exclude: [
            nodeModulePath,
          ],
          loader: 'eslint-loader',
          options: {
            /* eslint-disable-next-line */
            formatter: require('eslint-friendly-formatter'),
            emitWarning: true, // emitError: true in prod
          },
        },
        {
          test: /\.js$/,
          use: [
            'babel-loader',
          ],
        },
        // place .vue rule just for VueLoader plugin to work
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        {
          test: /index\.js$/,
          include: [path.resolve(srcPath, 'view/components')],
          use: [
            'vue-loader',
            path.resolve(loadersPath, 'vuize-loader.js'),
            'babel-loader',
          ],
        },
        {
          test: /\.pug$/,
          loader: 'pug-plain-loader',
        },
        {
          test: /\.css$/,
          use: styleLoaders,
        },
        // Vuetify components import styl files for component styles
        {
          test: /\.styl$/,
          use: styleLoaders.concat(['stylus-loader']),
        },
        {
          test: /\.scss$/,
          loader: styleLoaders.concat(['sass-loader']),
        },
        {
          test: /\.png$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
          },
        },
        {
          test: /\.woff$/,
          loader: 'url-loader',
          options: {
            limit: 75 * 1024,
          },
        },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
    ].concat(env.plugins),
    devtool: '#source-map',
    optimization: Object.assign({
      noEmitOnErrors: true,
    }, env.optimization),
    performance: {
      maxEntrypointSize: 10 * 1024 * 1024,
      maxAssetSize: 10 * 1024 * 1024,
    },
  };
}

module.exports = generateConfig;
