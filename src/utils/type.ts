type CheckTypeFn = (val: any) => boolean

interface TypeChecker {
  isString: CheckTypeFn
  isArray: CheckTypeFn
  isUndefined: CheckTypeFn
  isBoolean: CheckTypeFn
  isNumber: CheckTypeFn
  isFunction: CheckTypeFn
  isSymbol: CheckTypeFn
  isObject: CheckTypeFn
}

const typeFn = (s: any) => Object.prototype.toString.call(s).slice(8, -1).toLowerCase()

const types = ['String', 'Array', 'Undefined', 'Boolean', 'Number', 'Function', 'Symbol', 'Object']

export const type: TypeChecker = types.reduce((acc, str) => {
  acc['is' + str] = (val: any) => typeFn(val) === str.toLowerCase()
  return acc
}, {} as TypeChecker)
