export default abstract class HttpException extends Error {
  protected constructor(
    public statusCode: number,
    public override message: string
  ) {
    super(message)
  }
}