import HttpException from "./http.exception";

export default class BadRequestException extends HttpException {
  constructor(public override message: string = "Bad request") {
    super(400, message)
  }
}