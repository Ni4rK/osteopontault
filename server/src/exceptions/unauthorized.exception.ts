import HttpException from "./http.exception";

export default class UnauthorizedException extends HttpException {
  constructor(public override message: string = "Unauthorized") {
    super(401, message)
  }
}