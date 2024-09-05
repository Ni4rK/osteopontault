import HttpException from "./http.exception";

export default class InternalErrorException extends HttpException {
  constructor(public override message: string = "Internal error") {
    super(500, message)
  }
}