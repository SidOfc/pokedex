import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
    entry: './src/application',
    output: {
        filename: 'application.js',
        path: path.resolve('dist'),
        clean: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Pokédex',
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
