const path = require('path');
const autoprefixer = require('autoprefixer');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const RobotstxtPlugin = require("robotstxt-webpack-plugin").default;
const AppManifestWebpackPlugin = require('app-manifest-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
    entry: {
        main: './src/index.tsx'
    },
    output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: isDevelopment ? 'development' : 'production',
    devtool: isDevelopment && "source-map",
    devServer: {
        historyApiFallback: true,
        port: 3000,
        open: true
    },
    resolve: {
        extensions: ['.js', '.json', '.ts', '.tsx'],
    },

    optimization: {
        splitChunks: {
            //chunks: 'all',
            automaticNameDelimiter: '-'
        },
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    output: {
                        comments: false
                    },
                    ie8: false,
                    toplevel: true
                }
            })
        ]
    },

    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                loader: 'awesome-typescript-loader',
            },
            { 
                test: /\.handlebars$/, 
                loader: "handlebars-loader" 
            },
            {
                test: /\.(scss|css)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: isDevelopment,
                            minimize: !isDevelopment
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            autoprefixer: {
                                browsers: 'last 2 versions, > 1%'
                            },
                            sourceMap: isDevelopment,
                            plugins: () => [
                                autoprefixer
                            ]
                        },
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: isDevelopment
                        }
                    }
                ]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'static/',
                            useRelativePath: true,
                        }
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                          mozjpeg: {
                            progressive: true,
                            quality: 90
                          },
                          optipng: {
                            enabled: true,
                          },
                          pngquant: {
                            quality: '80-90',
                            speed: 4
                          },
                          gifsicle: {
                            interlaced: false,
                          },
                          /*webp: {
                            quality: 75
                          }*/
                        }
                    }
                ]
            }
        ],
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name]-styles.css",
            chunkFilename: "[name].css"
        }),
        new HtmlWebpackPlugin({
            hash: isDevelopment,
            //favicon: './src/img/favicon.png',
            title: 'IN2RP',
            minify: !isDevelopment,
            template: './src/index.html',
            filename: './index.html',

            //inject: 'head',
        }),
        new AppManifestWebpackPlugin({
            logo: './src/img/favicon.png',
            output: '/mobile/',
            inject: !isDevelopment,
            persistentCache: false,
            emitStats: false,
            config: {
                appName: 'IN2RP', // Your application's name. `string`
                appDescription: 'Strona stworzona na potrzeby serwera IN2RP (GTA V roleplay). Autor: Aktyn.', // Your application's description. `string`
                lang: 'pl',
                developerName: 'Aktyn', // Your (or your developer's) name. `string`
                developerURL: null, // Your (or your developer's) URL. `string`
                background: '#40535d', // Background colour for flattened icons. `string`
                theme_color: '#40535d', // Theme color for browser chrome. `string`
                display: 'standalone', // Android display: "browser" or "standalone". `string`
                orientation: 'any', // Android orientation: "portrait" or "landscape". `string`
                start_url: '/', // Android start application's URL. `string`
                version: '1.6', // Your application's version number. `number`
                logging: false, // Print logs to console? `boolean`
                icons: {
                    // Platform Options:
                    // - offset - offset in percentage
                    // - shadow - drop shadow for Android icons, available online only
                    // - background:
                    //   * false - use default
                    //   * true - force use default, e.g. set background for Android icons
                    //   * color - set background for the specified icons
                    //
                    android: true, // Create Android homescreen icon. `boolean` or `{ offset, background, shadow }`
                    appleIcon: true, // Create Apple touch icons. `boolean` or `{ offset, background }`
                    appleStartup: true, // Create Apple startup images. `boolean` or `{ offset, background }`
                    coast: { offset: 25 }, // Create Opera Coast icon with offset 25%. `boolean` or `{ offset, background }`
                    favicons: true, // Create regular favicons. `boolean`
                    firefox: true, // Create Firefox OS icons. `boolean` or `{ offset, background }`
                    windows: true, // Create Windows 8 tile icons. `boolean` or `{ background }`
                    yandex: false, // Create Yandex browser icon. `boolean` or `{ background }`
                },
            }
        }),
        new RobotstxtPlugin({
            policy: [{
                userAgent: "*",
                //allow: "/",
                disallow: ["/wl_requests", "/logs_mng", "/admins_mng", "/statistics", "/snake"],
                crawlDelay: 1,//seconds (useful for sites with huge amount of pages)
            }],
            host: "http://in2rp.pl"
        })
    ]
};
