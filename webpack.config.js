const webpack = require("webpack");

module.exports = {  
  entry: {
    lib: __dirname + "/src/index.js",
  },
  output: {
    path: __dirname + "/dist/",
    filename: "[name].js",
    library: "Revoice",
    libraryTarget: "umd"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              "presets": [["es2015", {"modules": false}]]
            }
          }
        ]
      }
    ]
  },
  target: "node",
  resolve:
  {
    alias: {
      "handlebars" : "handlebars/dist/handlebars.min.js"
    }
  },
  stats: {
    warnings: false,
  }
};
