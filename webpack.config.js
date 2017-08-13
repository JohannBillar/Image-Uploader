const path = require('path');

module.exports = {
  context: __dirname,
  entry: ['./src/js/index.js'],
  devtool: 'cheap-eval-source-map',
  output: {
    path: path.join(__dirname, '/public'),
    filename: 'bundle.js'
  },
  devServer: {
    publicPath: '/public/'
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  stats: {
    color: true,
    reasons: true,
    chunks: false
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        loader: 'url-loader?limit=1024&name=images/[name].[ext]'
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'file-loader'
      },
      {
        test: /\.scss$/,
        loader: 'style-loader!css-loader!sass-loader'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }
    ]
  }
};
