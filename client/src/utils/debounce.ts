export default function (func, wait, immediate) {
  let timeout = null

  return function (...args) {
    const that = this
    const callNow = immediate && timeout === null
    const later = function () {
      timeout = null
      if (!immediate) {
        Reflect.apply(func, that, args)
      }
    }
    window.clearTimeout(timeout)
    timeout = window.setTimeout(later, wait)
    if (callNow) {
      Reflect.apply(func, that, args)
    }
  }
}
