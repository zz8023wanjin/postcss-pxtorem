import { test, expect, suite } from 'vitest'
import pxtorem from '../src/index'
import postcss from 'postcss'

suite('pxtorem Plugin Tests', () => {
  test('Should convert px to rem', async () => {
    const code = `.container {
      width: 320px;
      font-size: 16px;
      .context {
        height: 320px;
        font-size: 32px
      }
    }`
    const processedCode = postcss(pxtorem()).process(code).css

    expect(processedCode).toMatch(`.container {
      width: 320px;
      font-size: 1rem;
      .context {
        height: 320px;
        font-size: 2rem
      }
    }`)
  })

  test('Should handle pxtorem options', async () => {
    const code = `.container {
      width: 320px;
      font-size: 16px;
      .context {
        height: 320px;
        font-size: 32px
      }
    }`
    const options = {
      rootValue: 10,
      propList: ['*'],
    }

    const processedCode = postcss(pxtorem(options)).process(code).css

    expect(processedCode).toMatch(`.container {
      width: 32rem;
      font-size: 1.6rem;
      .context {
        height: 32rem;
        font-size: 3.2rem
      }
    }`)
  })
})
