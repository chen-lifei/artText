const path = require('path')
const webpack = require('webpack')
const vueConfig = require('./vue-loader.config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const SpritesmithPlugin = require('webpack-spritesmith');
const isProd = process.env.NODE_ENV === 'production';
const templateFunction = function (data) {
    const shared = `.edit-ico { display:inline-block; vertical-align:middle; background-image: url(${data.sprites[0].image}) }`;
    const perSprite = data.sprites.map(function (s) {
        return `.edit-ico-${s.name} { width: ${s.width}px; height: ${s.height}px; background-position: ${s.offset_x}px ${s.offset_y}px; }`;
    }).join('\n');
    return shared + '\n' + perSprite;
};

//源码打包模式设置
let devtool = '#eval';

//所有环境通用插件数组
let pluginsArr = [
    new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery"
    })
];

//不同环境下插件数组
if (isProd){
    pluginsArr.push(
        // 雪碧图
        new SpritesmithPlugin({
            src: {
                cwd: path.resolve(__dirname, '../src/assets/pc/images/edit/icons/'),
                glob: '**/*.png' // 匹配任意 png 图标
            },
            target: {
                image: path.resolve(__dirname, '../src/assets/pc/images/edit/sprite/sprites.png'),
                css: [
                    [path.resolve(__dirname, '../src/assets/pc/images/edit/sprite/sprites.css'), {
                        format: 'function_based_template'
                    }]
                ]
            },
            customTemplates: {
                'function_based_template': templateFunction,
            },
            apiOptions: {
                cssImageRef: "sprites.png"    // css文件中引用雪碧图的相对位置路径配置
            },
            spritesmithOptions: {
                algorithm: 'binary-tree', // 从上到下生成方向.
                padding: 5     // 每个小图标之间的间隙
            }
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: false,
            compress: { warnings: false }
        }),
        new ExtractTextPlugin({
            filename: 'common.[chunkhash].css'
        }),
    );
}else{
    pluginsArr.push(new FriendlyErrorsPlugin())
}

module.exports = {
    devtool: devtool,
    output: {
        path: path.resolve(__dirname, '../dist'),
        publicPath: '/dist/',
        filename: '[name].[chunkhash].js'
    },
    resolve: {
        alias: {
            'public': path.resolve(__dirname, '../public'),
            'jquery': 'jquery',
            '@': path.join(__dirname, '..', 'src')
        }
    },
    module: {
        noParse: /es6-promise\.js$/, // avoid webpack shimming process
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: vueConfig
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpe?g|gif|svg|ico|ttf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: '[name].[hash].[ext]'
                }
            },
            {
                test: /\.css$/,
                use: isProd
                    ? ExtractTextPlugin.extract({
                        use: 'css-loader?minimize',
                        fallback: 'vue-style-loader'
                    })
                    : ['vue-style-loader', 'css-loader']
            }
        ]
    },
    performance: {
        maxEntrypointSize: 300000,
        hints: isProd ? 'warning' : false
    },
    plugins: pluginsArr
};