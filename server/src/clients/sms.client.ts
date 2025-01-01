import EnvironmentHelper from "../utils/environment.helper";

class SmsClient {
  // public readonly client: SNSClient
  private readonly isDev

  constructor() {
    this.isDev = EnvironmentHelper.getMode() !== "prod"
    // this.client = new SNSClient({} as __CheckOptionalClientConfig<SNSClientConfig>);
  }

  async send(phone: string, message: string) {
    if (this.isDev) {
      console.debug(`Shoud've sent SMS to phone ${phone} with message ${message} (prevented because dev mode)`)
      return
    }

    // const input: PublishCommandInput = {
    //   Message: message,
    //   // One of PhoneNumber, TopicArn, or TargetArn must be specified.
    //   PhoneNumber: phone,
    // }
    // const response = await this.client.send(
    //   new PublishCommand(input),
    // )
    // console.debug(`Sent SMS to phone ${phone} with message ${message}`, response)
    // return response
  }
}

const smsClient = new SmsClient()
export default smsClient
