import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/demo/**', 'src/App.tsx', 'src/main.tsx', 'src/**/*.test.ts'],
      rollupTypes: true,
      tsconfigPath: './tsconfig.app.json',
    }),
  ],
  base: './', // For GitHub Pages demo
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'StrataEditor',
      formats: ['es', 'cjs'],
      fileName: (format) => `strata-editor.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
    // Generate sourcemaps for debugging
    sourcemap: true,
    // Don't minify library - consumers will minify
    minify: false,
  },
})
