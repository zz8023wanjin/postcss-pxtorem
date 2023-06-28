import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: !options.watch,
    sourcemap: !!options.watch,
    clean: true,
    minify: false,
  }
})
