export function isUndefined(value: unknown): value is undefined {
  return value === undefined
}

export function isNull(value: unknown): value is null {
  return value === null
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number'
}

export function isObject(value: unknown): value is {} {
  return typeof value === 'object'
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date
}

export function isFunction(value: unknown): value is Function {
  return (
    value instanceof Function ||
    typeof value === 'function'
  )
}

export function isArray(value: unknown): value is Array<any> {
  return Array.isArray(value)
}

export function isArrayOf<T>(value: unknown, guard: (v: unknown) => v is T): value is T[] {
  if (!isArray(value)) {
    return false
  }
  for (const element of value) {
    if (!guard(element)) {
      return false
    }
  }
  return true
}