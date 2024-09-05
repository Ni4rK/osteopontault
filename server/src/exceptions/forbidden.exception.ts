import HttpException from "./http.exception";

export default class ForbiddenException extends HttpException {
  constructor(public override message: string = "Access forbidden") {
    super(403, message)
  }
}