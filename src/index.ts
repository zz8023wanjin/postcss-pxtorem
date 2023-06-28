import { pxRegex } from './utils/pixel-unit-regex'
import { filterPropList } from './utils/filter-prop-list'
import { type } from './utils/type'
import type { Input } from 'postcss'

export type Options = Partial<{
  rootValue: number | ((input: Input | undefined) => number)
  unitPrecision: number
  selectorBlackList: (string | RegExp)[]
  propList: string[]
  replace: boolean
  mediaQuery: boolean
  minPixelValue: number
  exclude: string | RegExp | ((filePath: string) => boolean) | null
}>

const defaults: Options = {
  rootValue: 16,
  unitPrecision: 5,
  selectorBlackList: [],
  propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
  replace: true,
  mediaQuery: false,
  minPixelValue: 0,
  exclude: null,
}

function createPxReplace(rootValue, unitPrecision, minPixelValue) {
  return (m, $1) => {
    if (!$1) return m
    const pixels = parseFloat($1)
    if (pixels < minPixelValue) return m
    const fixedVal = toFixed(pixels / rootValue, unitPrecision)
    return fixedVal === 0 ? '0' : fixedVal + 'rem'
  }
}

function toFixed(number, precision) {
  const multiplier = Math.pow(10, precision + 1),
    wholeNumber = Math.floor(number * multiplier)
  return (Math.round(wholeNumber / 10) * 10) / multiplier
}

function declarationExists(decls, prop, value) {
  return decls.some((decl) => decl.prop === prop && decl.value === value)
}

function blacklistedSelector(blacklist, selector) {
  if (typeof selector !== 'string') return
  return blacklist.some((regex) => {
    if (typeof regex === 'string') {
      return selector.indexOf(regex) !== -1
    }
    return selector.match(regex)
  })
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

const pxtorem = (options: Options = {}) => {
  const opts: Options = Object.assign({}, defaults, options)
  const satisfyPropList = createPropListMatcher(opts.propList)
  const exclude = opts.exclude
  let isExcludeFile = false
  let pxReplace
  return {
    postcssPlugin: 'postcss-pxtorem',
    Once(css) {
      const filePath = css.source.input.file
      if (
        exclude &&
        ((type.isFunction(exclude) && exclude(filePath)) ||
          (type.isString(exclude) && filePath.indexOf(exclude) !== -1) ||
          filePath.match(exclude) !== null)
      ) {
        isExcludeFile = true
      } else {
        isExcludeFile = false
      }

      const rootValue = typeof opts.rootValue === 'function' ? opts.rootValue(css.source.input) : opts.rootValue
      pxReplace = createPxReplace(rootValue, opts.unitPrecision, opts.minPixelValue)
    },
    Declaration(decl) {
      if (isExcludeFile) return

      if (
        decl.value.indexOf('px') === -1 ||
        !satisfyPropList(decl.prop) ||
        blacklistedSelector(opts.selectorBlackList, decl.parent.selector)
      )
        return

      const value = decl.value.replace(pxRegex, pxReplace)

      // if rem unit already exists, do not add or replace
      if (declarationExists(decl.parent, decl.prop, value)) return

      if (opts.replace) {
        decl.value = value
      } else {
        decl.cloneAfter({ value: value })
      }
    },
    AtRule(atRule) {
      if (isExcludeFile) return

      if (opts.mediaQuery && atRule.name === 'media') {
        if (atRule.params.indexOf('px') === -1) return
        atRule.params = atRule.params.replace(pxRegex, pxReplace)
      }
    },
  }
}

pxtorem.postcss = true

export default pxtorem

export { pxtorem }