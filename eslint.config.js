import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

const { defineConfig } = require('@rain-star/eslint-config')
export default defineConfig([], ['typescript'])
