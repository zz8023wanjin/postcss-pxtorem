const typeFn = (s) => Object.prototype.toString.call(s).slice(8, -1).toLowerCase()

const types = ['String', 'Array', 'Undefined', 'Boolean', 'Number', 'Function', 'Symbol', 'Object']

export const type: any = types.reduce((acc, str) => {
  acc['is' + str] = (val) => typeFn(val) === str.toLowerCase()
  return acc
}, {})
