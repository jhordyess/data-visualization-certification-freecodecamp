/* global __dirname -- Global defined by Node.js */
import { defineConfig } from 'vite'
import { resolve } from 'path'

const root = 'src'

export default defineConfig({
  base: '/data-visualization-certification/',
  root,
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, root, 'index.html'),
        'bar-chart': resolve(__dirname, root, 'bar-chart/index.html'),
        'choropleth-map': resolve(__dirname, root, 'choropleth-map/index.html'),
        'heat-map': resolve(__dirname, root, 'heat-map/index.html'),
        'scatterplot-graph': resolve(__dirname, root, 'scatterplot-graph/index.html'),
        'treemap-diagram': resolve(__dirname, root, 'treemap-diagram/index.html')
      }
    }
  },
  server: {
    port: 3640
  }
})
