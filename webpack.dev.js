const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const port = process.env.PORT || 3000;

module.exports = merge(common, {
  entry: ['react-hot-loader/patch'],
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom'
    }
  },
  mode: 'development',  
  output: {
    filename: '[name].bundle.js'
  },
  devtool: 'inline-source-map',
  plugins: [
    new MiniCssExtractPlugin({ filename: '[name].style.css' }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    hot:true,
    host: '127.0.0.1',
    contentBase: path.join(__dirname, 'dist'),
    proxy: {
      "**": "http://localhost:9999"
    },
    port: port,
    historyApiFallback: true,
    open: true,
    stats: {
      color: true
    },
  }
});