export default class Environment {
  static getApiUrl(): string {
    return Environment.isDevelopment()
      ? 'http://127.0.0.1:3000'
      : 'https://rixmu64ska.execute-api.eu-west-3.amazonaws.com/Prod'
  }

  static isDevelopment(): boolean {
    return window.location.host.startsWith('localhost')
  }
}
