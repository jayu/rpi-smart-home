'use strict';

let webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    path = require('path'),
    srcPath = path.join(__dirname, 'src'),
    outputPath = "./build";

module.exports = {
    target: 'web',
    cache: true,
    entry: {
        module: ['babel-polyfill', path.join(srcPath, 'index.js')],
        common: [
            'react', 
            'react-dom', 
            'react-router', 
            'redux', 
            'react-redux', 
            'redux-thunk', 
            'isomorphic-fetch',
            'es6-promise'
        ]
    },
    resolve: {
        root: srcPath,
        extensions: ['', '.jsx', '.js', '.css', ".scss"],
        modulesDirectories: ['node_modules', 'src']
    },
    output: {
        //path: path.join(__dirname, 'tmp'),
        path: outputPath,
        publicPath: '',
        filename: '[name].js',
        library: ['Example', '[name]'],
        pathInfo: true
    },

    module: {
        loaders: [
            //{ test: /\.woff(|2)$/,   loader: "url-loader?limit=10000&minetype=application/font-woff" },
            {
              test: /\.woff(|2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
              // Limiting the size of the woff fonts breaks font-awesome ONLY for the extract text plugin
              // loader: "url?limit=10000"
              loader: "url"
            },
            {
              test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
              loader: 'file'
            },
        {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract('style-loader', 'css-loader' )
        },{
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader')
        }, {
            test: /\.js(|x)$/,
            loader: 'babel',
            exclude: [/node_modules/, "bootstrap-sass.config.js"],
            query: {
                presets: ['es2015', "stage-0", 'react'],
                plugins: ["transform-async-to-generator"]
            }
        },{
            test: /\.(jpe?g|png|gif|svg)$/,
            loader: "file-loader?name=[name].[ext]"
        }]
    },
    plugins: [
        //new webpack.optimize.CommonsChunkPlugin('common', 'common.js'),
        new ExtractTextPlugin("[name].css"),
        new HtmlWebpackPlugin({
            inject: true,
            template: 'src/index.html'
        }),
        /*
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        */
        new webpack.NoErrorsPlugin()
    ],

    debug: true,
    devServer: {
        port: 8080,
        contentBase: './tmp',
        historyApiFallback: true
    }
};
