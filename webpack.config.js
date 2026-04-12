const path = require("path");
const webpack = require("webpack");
const TerserJsPlugin = require("terser-webpack-plugin");

module.exports = env => {
    const pkg = require(path.resolve(__dirname, "package.json"));
    const target = env && env.platform ? env.platform : undefined;
    const platformDist = env && env.platform ? env.platform : undefined;

    const webpackOptions = {
        entry: {},
        mode: "none",
        node: {
            global: true
        },
        target,
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: "ts-loader",
                            options: {
                                configFile: path.resolve(__dirname, "tsconfig.json"),
                            },
                        },
                    ],
                    exclude: /node_modules/,
                }
            ]
        },
        resolve: {
            extensions: [".ts", ".js"],
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, "dist", platformDist || "browser"),
            library: {
                root: pkg.umd_name.split("."),
                amd: pkg.umd_name,
            },
            libraryTarget: "umd",
        },
        plugins: [
            new webpack.SourceMapDevToolPlugin({
                filename: '[name].js.map',
                moduleFilenameTemplate(info) {
                    let resourcePath = info.resourcePath;

                    while (resourcePath.startsWith("./") || resourcePath.startsWith("../")) {
                        if (resourcePath.startsWith("./")) {
                            resourcePath = resourcePath.substring(2);
                        } else {
                            resourcePath = resourcePath.substring(3);
                        }
                    }

                    return `webpack://${pkg.umd_name}/${resourcePath}`;
                }
            }),
        ],
        optimization: {
            sideEffects: true,
            concatenateModules: true,
            providedExports: true,
            usedExports: true,
            innerGraph: true,
            minimize: true,
            minimizer: [new TerserJsPlugin({
                include: /\.min\.js$/,
                terserOptions: {
                    ecma: 2019,
                    compress: {},
                    mangle: {
                        properties: {
                            regex: /^_/
                        }
                    },
                    module: true,
                    format: {
                        ecma: 2019
                    },
                    toplevel: false,
                    keep_classnames: false,
                    keep_fnames: false,
                }
            })]
        },
        stats: {
            warnings: true,
            errors: true,
            performance: true,
            optimizationBailout: true
        },
        externals: [
            "ws",
            "eventsource",
            "node-fetch",
            "abort-controller",
            "fetch-cookie",
        ],
    };

    webpackOptions.entry["signalr"] = path.resolve(__dirname, "src", "browser-index.ts");
    webpackOptions.entry["signalr.min"] = path.resolve(__dirname, "src", "browser-index.ts");
    return webpackOptions;
};
