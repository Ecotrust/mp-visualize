const path = require('path');

module.exports = {
  entry: './node_modules/mapshaper/mapshaper.js',
  resolve: {
    fallback: {
        "buffer": require.resolve("./node_modules/buffer-from/")
        // "buffer": false
    }
  },
  output: {
    filename: 'mapshaper_vanilla.js',
    path: path.resolve(__dirname, 'dist'),
  },
};