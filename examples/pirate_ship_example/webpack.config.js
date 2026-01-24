import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: "development",
  entry: "./src/main.ts",
  devtool: "source-map", // Changed from "inline-source-map"
  devServer: {
    static: './dist',
    hot: true,
    port: 3000,
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: true,
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|jpeg|gif|obj|glb|gltf)$/i,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      // Force single instance of @vicimpa/glm
      '@vicimpa/glm': path.resolve(__dirname, 'node_modules/@vicimpa/glm')
    }
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
    new CopyPlugin({
      patterns: [
        { from: "public", to: "" }
      ]
    })
  ],
  stats: {
    errorDetails: true,
  },
};