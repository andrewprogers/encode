const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.txt$/, use: ['raw-loader'] }
    ]
  },
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Custom template',
      template: 'src/index.html'
    })
  ]
};