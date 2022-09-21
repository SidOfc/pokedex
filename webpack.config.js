import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
    entry: './src/main',
    output: {
        filename: '[name].app.js',
        path: path.resolve('dist'),
        clean: true,
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        alias: {
            '@src': path.resolve('src'),
            '@actions': path.resolve('src', 'actions'),
            '@components': path.resolve('src', 'components'),
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Pokédex',
            favicon: 'dist/favicon.svg',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.[jt]sx?$/i,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', 'solid'],
                    },
                },
            },
            {
                test: /\.css$/i,
                use: [
                    'style-loader',
                    {loader: 'css-loader', options: {modules: true}},
                ],
            },
            {
                test: /\.(?:svg|png|jpe?g|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
    devtool: 'inline-source-map',
    devServer: {static: './dist'},
};
