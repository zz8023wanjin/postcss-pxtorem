import { pxRegex } from './utils/pixel-unit-regex'
import { filterPropList } from './utils/filter-prop-list'
import type { Input, Plugin, Root } from 'postcss'
import { isFunction, isRegExp, isString } from 'lodash'

export type Options = Partial<{
  rootValue: number | ((input: Input | undefined) => number)
  unitPrecision: number
  propList: string[]
  replace: boolean
  mediaQuery: boolean
  minPixelValue: number
  exclude: string | RegExp | ((filePath: string) => boolean) | null
}>

const defaults: Required<Options> = {
  rootValue: 16,
  unitPrecision: 5,
  propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
  replace: true,
  mediaQuery: false,
  minPixelValue: 0,
  exclude: null,
}

function toFixed(number: number, precision: number) {
  const multiplier = Math.pow(10, precision + 1),
    wholeNumber = Math.floor(number * multiplier)
  return (Math.round(wholeNumber / 10) * 10) / multiplier
}

function createPxReplace(rootValue: number, unitPrecision: number, minPixelValue: number) {
  return (m: string, $1: string) => {
    if (!$1) return m
    const pixels = parseFloat($1)
    if (pixels < minPixelValue) return m
    const fixedVal = toFixed(pixels / rootValue, unitPrecision)
    return fixedVal === 0 ? '0' : fixedVal + 'rem'
  }
}

function declarationExists(decls, prop, value) {
  return decls.some((decl) => decl.prop === prop && decl.value === value)
}

function createPropListMatcher(propList) {
  const hasWild = propList.indexOf('*') > -1
  const matchAll = hasWild && propList.length === 1
  const lists = {
    exact: filterPropList.exact(propList),
    contain: filterPropList.contain(propList),
    startWith: filterPropList.startWith(propList),
    endWith: filterPropList.endWith(propList),
    notExact: filterPropList.notExact(propList),
    notContain: filterPropList.notContain(propList),
    notStartWith: filterPropList.notStartWith(propList),
    notEndWith: filterPropList.notEndWith(propList),
  }
  return (prop) => {
    if (matchAll) return true
    return (
      (hasWild ||
        lists.exact.indexOf(prop) > -1 ||
        lists.contain.some(function (m) {
          return prop.indexOf(m) > -1
        }) ||
        lists.startWith.some(function (m) {
          return prop.indexOf(m) === 0
        }) ||
        lists.endWith.some(function (m) {
          return prop.indexOf(m) === prop.length - m.length
        })) &&
      !(
        lists.notExact.indexOf(prop) > -1 ||
        lists.notContain.some(function (m) {
          return prop.indexOf(m) > -1
        }) ||
        lists.notStartWith.some(function (m) {
          return prop.indexOf(m) === 0
        }) ||
        lists.notEndWith.some(function (m) {
          return prop.indexOf(m) === prop.length - m.length
        })
      )
    )
  }
}

const pxtorem = (options: Options = {}): Plugin => {
  const opts: Required<Options> = Object.assign({}, defaults, options)

  const satisfyPropList = createPropListMatcher(opts.propList)
  const exclude = opts.exclude
  let isExcludeFile = false
  let pxReplace
  return {
    postcssPlugin: 'postcss-pxtorem',
    Once(css: Root) {
      const filePath = css.source?.input.file!
      if (
        exclude &&
        ((isFunction(exclude) && exclude(filePath)) ||
          (isString(exclude) && filePath.indexOf(exclude) !== -1) ||
          (isRegExp(exclude) && filePath.match(exclude) !== null))
      ) {
        isExcludeFile = true
      } else {
        isExcludeFile = false
      }

      const rootValue = isFunction(opts.rootValue) ? opts.rootValue(css.source?.input) : opts.rootValue
      pxReplace = createPxReplace(rootValue, opts.unitPrecision, opts.minPixelValue)
    },
    Declaration(decl) {
      if (isExcludeFile) {
        return
      }

      if (decl.value.indexOf('px') === -1 || !satisfyPropList(decl.prop)) {
        return
      }

      const value = decl.value.replace(pxRegex, pxReplace)

      // if rem unit already exists, do not add or replace
      if (declarationExists(decl.parent, decl.prop, value)) {
        return
      }

      if (opts.replace) {
        decl.value = value
      } else {
        decl.cloneAfter({ value: value })
      }
    },
    AtRule(atRule) {
      if (isExcludeFile) {
        return
      }

      if (opts.mediaQuery && atRule.name === 'media') {
        if (atRule.params.indexOf('px') === -1) {
          return
        }
        atRule.params = atRule.params.replace(pxRegex, pxReplace)
      }
    },
  }
}

pxtorem.postcss = true

export default pxtorem

export { pxtorem }
