import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
    libAssetsPlugin({
      limit: 0,
      name: '[name].[ext]',
      outputPath: (url) => {
        if (/\.(jpe?g|png|gif|svg)$/i.test(url)) {
          return 'images'
        }
        if (/\.(ttf|woff|woff2|eot)$/i.test(url)) {
          return 'fonts'
        }
        return 'assets'
      },
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'Magicdown', // 组件库的全局变量名，在 UMD 构建中会用到
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      // 确保外部化 react
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true, // 建议开启 sourcemap
  },
})
