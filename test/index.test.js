import { test, expect, suite } from 'vitest'
import pxtorem from '../src/index'
import postcss from 'postcss'

suite('pxtorem Plugin Tests', () => {
  test('Should convert px to rem', async () => {
    const code = `.container { width: 320px; font-size: 16px;}`
    const processedCode = await postcss(pxtorem()).process(code)

    expect(processedCode.css).toMatch('.container { width: 320px; font-size: 1rem;}')
  })

  test('Should handle pxtorem options', async () => {
    const code = `.container { width: 320px; font-size: 16px;}`
    const options = {
      rootValue: 10,
      propList: ['*'],
    }

    const processedCode = await postcss(pxtorem(options)).process(code)

    expect(processedCode.css).toMatch('.container { width: 32rem; font-size: 1.6rem;}')
  })
})
