import HttpException from "../exceptions/http.exception";
import HttpRequest from "@shared/types/http-request.interface";
import {HttpResponse, isHttpResponseWithStatusAndCode} from "@shared/types/http-response.type";
import HttpMethod from "@shared/types/http-method.enum";
import {TokenBearer, TokenHeader} from "@shared/types/token-header.type";
import {isArrayOf, isString} from "@shared/helpers/common-types.guards";
import AuthenticationService from "../services/authentication.service";
import {HttpResponseHeaders} from "@shared/types/http-headers.interface";
import EnvironmentHelper from "../utils/environment.helper";

function createHeadersForResponse(): HttpResponseHeaders {
  if (EnvironmentHelper.getMode() === 'dev') {
    return {
      "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials" : true, // Required for cookies, authorization headers with HTTPS
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE"
    }
  }
  return {
    "Access-Control-Allow-Origin" : "https://osteopontault.fr", // Required for CORS support to work
    "Access-Control-Allow-Credentials" : true, // Required for cookies, authorization headers with HTTPS
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE"
  }
}

function createRequestFromEvent(event: any): HttpRequest {
  return {
    method: event.httpMethod.toUpperCase() as HttpMethod,
    path: event.path,
    headers: event.headers,
    query: event.queryStringParameters ?? {},
    body: JSON.parse(event.body ?? '{}'),
    user: null
  }
}

function createAPIGatewayProxyResultFromResponse(response: HttpResponse | {}): any {
  if (isHttpResponseWithStatusAndCode(response)) {
    return {
      statusCode: response.statusCode,
      headers: createHeadersForResponse(),
      body: JSON.stringify(response.data)
    }
  }
  return {
    statusCode: 200,
    headers: createHeadersForResponse(),
    body: JSON.stringify(response)
  }
}

function createAPIGatewayProxyResultFromError(error: HttpException | unknown): any {
  // TODO: add some logs in console
  console.error("Exception: ", error)
  if (error instanceof HttpException) {
    return {
      statusCode: error.statusCode,
      headers: createHeadersForResponse(),
      body: JSON.stringify(error.message)
    }
  }
  return {
    statusCode: 500,
    headers: createHeadersForResponse(),
    body: JSON.stringify('Server error')
  }
}

function handleAuthentication(request: HttpRequest) {
  const header = request.headers[TokenHeader]
  if (!isString(header)) {
    request.user = null
    return
  }
  const bearer = header.split(' ')
  if (!isArrayOf(bearer, isString) || bearer.length < 2 || bearer[0].trim() !== TokenBearer) {
    request.user = null
    return
  }
  const token = bearer[1].trim()
  request.user = AuthenticationService.authenticate(token)
}

export default function handlerWrapper(
  handler: (request: HttpRequest) => Promise<HttpResponse | {}>,
  withAuthentication = false
): (event: any, context: any) => Promise<any> {
  return async function (event: any, context: any): Promise<any> {
    try {
      const request = createRequestFromEvent(event)
      if (withAuthentication) {
        handleAuthentication(request)
      }
      const response = await handler(request)
      return Promise.resolve(createAPIGatewayProxyResultFromResponse(response))
    } catch (error) {
      return Promise.resolve(createAPIGatewayProxyResultFromError(error))
    }
  }
}