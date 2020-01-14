const pluginUri = 'systems.dmx.geomaps'

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CleanWebpackPlugin   = require('clean-webpack-plugin')
const { VueLoaderPlugin }  = require('vue-loader')

module.exports = {
  entry: './src/main/js/plugin.js',
  output: {
    path: __dirname + '/src/main/resources/web',
    filename: '[chunkhash].plugin.js',
    chunkFilename: '[chunkhash].[name].js',
    publicPath: '/' + pluginUri + '/',
    library: '_' + pluginUri.replace(/[.-]/g, '_'),
    libraryTarget: 'jsonp'
  },
  resolve: {
    extensions: [".js", ".vue"]
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
        loader: 'file-loader'
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[contenthash].style.css'
    }),
    new CleanWebpackPlugin(),
    new VueLoaderPlugin()
  ],
  stats: {
    entrypoints: false,
    assetsSort: 'chunks'
  },
  performance: {
    hints: false
  }
}
