import path from "path"
import webpack from "webpack"

export default {
    mode: "development",
    entry: {
        app: "./public/js/app.js",
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve("./public/dist")
    },
    module: {
        rules: [    
          {
            test: /\.m?js$/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
    }
}