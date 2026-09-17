export function isFunction(func: unknown): func is (...args: unknown[]) => unknown {
  return Object.prototype.toString.call(func) === '[object Function]'
}

export function isObject(func: unknown): func is Record<string, unknown> {
  return Object.prototype.toString.call(func) === '[object Object]'
}

export function isArray(func: unknown): func is unknown[] {
  return Object.prototype.toString.call(func) === '[object Array]'
}
