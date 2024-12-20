import handlerWrapper from "./handler.wrapper";
import BadRequestException from "../exceptions/bad-request.exception";
import HttpRequest from "@shared/types/http-request.interface";
import {HttpResponse} from "@shared/types/http-response.type";
import HttpMethod from "@shared/types/http-method.enum";
import HttpPath from "@shared/types/http-path.enum";
import {isAnalyticsPutHttpBody} from "@shared/types/http-body.types";
import {http200EmptyResponse} from "@shared/helpers/common.http-responses";
import UnauthorizedException from "../exceptions/unauthorized.exception";
import {isString} from "@shared/helpers/common-types.guards";
import AnalyticsService from "../services/analytics.service";
import {isPractitioner} from "@shared/types/practitioner.enum";

export const analyticsHandler = handlerWrapper(async (request: HttpRequest): Promise<HttpResponse> => {
  const body = request.body

  if (!request.user) {
    throw new UnauthorizedException()
  }

  // PUT ACTIONS
  if (request.path === HttpPath.ANALYTICS_POST && request.method === HttpMethod.POST) {
    if (!isAnalyticsPutHttpBody(body)) {
      throw new BadRequestException()
    }
    await AnalyticsService.put(body)
    return http200EmptyResponse
  }

  // GET ACTIONS
  if (request.path === HttpPath.ANALYTICS_GET && request.method === HttpMethod.GET) {
    if (!isPractitioner(request.user)) {
      throw new UnauthorizedException()
    }
    const from = request.query.from
    const to = request.query.to
    const fromDate = isString(from) ? new Date(from) : new Date()
    const toDate = isString(to) ? new Date(to) : undefined
    return AnalyticsService.list(fromDate, toDate)
  }

  throw new BadRequestException()
}, {
  withAuthentication: true,
  noCacheForBrowsers: true
})