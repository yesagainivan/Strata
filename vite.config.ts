import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// Check if building library or demo
const isLibBuild = process.env.BUILD_MODE === 'lib'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Only include dts plugin for library builds
    ...(isLibBuild ? [
      dts({
        include: ['src/**/*.ts', 'src/**/*.tsx'],
        exclude: ['src/demo/**', 'src/App.tsx', 'src/main.tsx', 'src/**/*.test.ts'],
        rollupTypes: true,
        tsconfigPath: './tsconfig.app.json',
      }),
    ] : []),
  ],
  base: './', // For GitHub Pages demo
  build: isLibBuild ? {
    // Library build configuration
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'StrataEditor',
      formats: ['es', 'cjs'],
      fileName: (format) => `strata-editor.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
    sourcemap: true,
    minify: false,
  } : {
    // Demo app build configuration (for GitHub Pages)
    outDir: 'dist',
    sourcemap: false,
  },
})
