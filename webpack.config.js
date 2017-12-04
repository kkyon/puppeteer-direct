'use strict';

const path = require('path');

module.exports = {
    entry: path.resolve('src/index.ts'),
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist'),
        libraryTarget: 'commonjs'
    },
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    module: {
        loaders: [
            // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
            { test: /\.ts$/, loader: 'ts-loader?'+JSON.stringify({
                compilerOptions: {
                    lib: ['es6', 'ES2015.Promise'],
                    types: ['node', 'mocha'],
                    target: 'es5'
                }
            })}
        ]
    }
};
