import Logger from '@/utils/logger'

/**
 * Forces the Error message to be displayed even though the Error is caught
 * (avoids catching the error without logging a message)
 *
 * Typically:
 * <<
 *  // in service
 *  fetching () {
 *    return new Promise(() => {
 *      throw new Error('This message *MUST* be displayed')
 *    })
 *  }
 *
 *  // in component
 *  myService.fetching().catch(() => {})    // --> no message in console output
 * >>
 */
export default class Exception extends Error {
  constructor (message: string, ...debugs: unknown[]) {
    super()
    Logger.error(message, ...debugs)
  }
}
