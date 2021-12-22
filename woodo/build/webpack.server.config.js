const webpack = require('webpack');
const merge = require('webpack-merge');
const base = require('./webpack.base.config');
const nodeExternals = require('webpack-node-externals');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const isProd = process.env.NODE_ENV === 'production';

let devtool="#eval";
if (isProd){
    devtool="#source-map";
}
module.exports = merge(base, {
    target: 'node',
    devtool: devtool,
    entry: './src/entry-server.js',
    output: {
        filename: 'server-bundle.js',
        libraryTarget: 'commonjs2'
    },
    resolve: {
        alias: {
            'create-api': './create-api-server.js'
        }
    },
    externals: nodeExternals({
        // do not externalize CSS files in case we need to import it from a dep
        whitelist: /\.css$/
    }),
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.env.VUE_ENV': '"server"'
        }),
        new webpack.optimize.UglifyJsPlugin({
            output: {comments: false},
            compress:{warnings: false}
        }),
        new VueSSRServerPlugin(),
        new FileManagerPlugin({
              onEnd: [
                {
                  delete: [
                    "./dist/*.map"
                  ]
                }
              ]
        })
    ]
})