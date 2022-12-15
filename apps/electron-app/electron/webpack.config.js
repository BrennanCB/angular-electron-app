const path = require('path');
const Dotenv = require('dotenv-webpack');
const TerserPlugin = require("terser-webpack-plugin");

const {IgnorePlugin} = require('webpack');

const plugins = [
  new Dotenv()
]

if (process.platform !== "darwin") {
  plugins.push(
    new IgnorePlugin({
      resourceRegExp: /^fsevents$/
    })
  );
}

module.exports = {
  target: 'electron-main',
  entry: {
    preload: './apps/electron-app/electron/preload',
    main: './apps/electron-app/electron/main',
  },
  externals: {
    'fsevents': "require('fsevents')",
    'electron-debug': "require('electron-debug')",
    'electron-reload': "require('electron-reload')",
    'keytar': "require('keytar')",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'ts-loader',
          options: {
            configFile: "tsconfig.electron.json"
          }
        }],
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false
          }
        },
        extractComments: false
      })
    ]
  },
  plugins,
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname)
  }
}
