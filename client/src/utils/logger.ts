export default class Logger {
  static info (message: unknown, ...debugs: unknown[]) {
    console.log(message)
    Logger.debug(...debugs)
  }

  static warn (message: unknown, ...debugs: unknown[]) {
    console.warn(message)
    Logger.debug(...debugs)
  }

  static error (message: unknown, ...debugs: unknown[]) {
    console.error(message)
    Logger.debug(...debugs)
  }

  static debug (...data: unknown[]) {
    data.forEach(oneDebug => console.debug(oneDebug))
  }
}
