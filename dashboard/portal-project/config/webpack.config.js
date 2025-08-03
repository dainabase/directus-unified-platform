const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
    entry: {
        // Core
        core: [
            './assets/js/Core/app.js',
            './assets/js/Core/auth-notion.js',
            './assets/js/Core/permissions-notion.js'
        ],
        
        // Client
        client: [
            './assets/js/Client/dashboard-client-notion.js',
            './assets/js/Client/projects-notion.js',
            './assets/js/Client/documents-notion.js',
            './assets/js/Client/finances-notion.js'
        ],
        
        // Prestataire
        prestataire: [
            './assets/js/Prestataire/dashboard-prestataire-notion.js',
            './assets/js/Prestataire/missions-notion.js',
            './assets/js/Prestataire/calendar-notion.js',
            './assets/js/Prestataire/tasks-notion.js'
        ],
        
        // Revendeur
        revendeur: [
            './assets/js/Revendeur/dashboard-revendeur-notion.js',
            './assets/js/Revendeur/pipeline-notion.js',
            './assets/js/Revendeur/clients-notion.js',
            './assets/js/Revendeur/leads-notion.js'
        ],
        
        // Superadmin
        superadmin: [
            './assets/js/Superadmin/auth-superadmin.js',
            './assets/js/Superadmin/permissions-superadmin.js',
            './assets/js/Superadmin/dashboard-superadmin.js',
            './assets/js/Superadmin/ocr-processor.js',
            './assets/js/Superadmin/invoices-in-notion.js',
            './assets/js/Superadmin/invoices-out-notion.js',
            './assets/js/Superadmin/expenses-notion.js',
            './assets/js/Superadmin/revolut-connector.js',
            './assets/js/Superadmin/accounting-engine.js'
        ],
        
        // Optimizations
        optimizations: [
            './assets/js/Optimizations/pagination-system.js',
            './assets/js/Optimizations/virtual-scroll.js',
            './assets/js/Optimizations/advanced-cache.js',
            './assets/js/Optimizations/lazy-loader.js'
        ]
    },
    
    output: {
        path: path.resolve(__dirname, '../dist/js'),
        filename: '[name].bundle.js',
        chunkFilename: '[name].[contenthash].chunk.js',
        clean: true
    },
    
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    
    devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map',
    
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-syntax-dynamic-import']
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
                generator: {
                    filename: '../img/[name].[contenthash][ext]'
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: '../fonts/[name].[contenthash][ext]'
                }
            }
        ]
    },
    
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        }),
        
        new MiniCssExtractPlugin({
            filename: '../css/[name].[contenthash].css',
            chunkFilename: '../css/[name].[contenthash].chunk.css'
        }),
        
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })
    ],
    
    optimization: {
        minimize: process.env.NODE_ENV === 'production',
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: process.env.NODE_ENV === 'production',
                        drop_debugger: process.env.NODE_ENV === 'production'
                    }
                }
            }),
            new CssMinimizerPlugin()
        ],
        
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
                common: {
                    name: 'common',
                    minChunks: 2,
                    chunks: 'all',
                    enforce: true
                }
            }
        }
    },
    
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '../assets'),
            '@js': path.resolve(__dirname, '../assets/js'),
            '@css': path.resolve(__dirname, '../assets/css'),
            '@img': path.resolve(__dirname, '../assets/img')
        }
    },
    
    devServer: {
        contentBase: path.resolve(__dirname, '../'),
        port: 8080,
        hot: true,
        open: true,
        historyApiFallback: true
    }
};