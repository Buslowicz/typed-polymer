var webpack = require("webpack");
var _ = require("lodash");

var baseConfig = {
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
};

var devConfig = {};

var prodConfig = {
//  plugins: [
//    new webpack.optimize.UglifyJsPlugin({
//      compress: {
//        warnings: false
//      }
//    })
//  ]
};

module.exports.prod = _.merge(baseConfig, prodConfig);
module.exports.dev = _.merge(baseConfig, devConfig);
