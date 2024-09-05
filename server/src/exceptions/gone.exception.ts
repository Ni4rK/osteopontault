import HttpException from "./http.exception";

export default class GoneException extends HttpException {
  constructor(public override message: string = "Gone") {
    super(410, message)
  }
}