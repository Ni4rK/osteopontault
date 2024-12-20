import handlerWrapper from "./handler.wrapper";
import BadRequestException from "../exceptions/bad-request.exception";
import HttpRequest from "@shared/types/http-request.interface";
import {HttpResponse} from "@shared/types/http-response.type";
import HttpMethod from "@shared/types/http-method.enum";
import HttpPath from "@shared/types/http-path.enum";
import AuthenticationService from "../services/authentication.service";
import {isAuthTokenHttpBody, isMemberPwaSubscriptionHttpBody} from "@shared/types/http-body.types";
import MemberService from "../services/member.service";
import {isPractitioner} from "@shared/types/practitioner.enum";
import ForbiddenException from "../exceptions/forbidden.exception";
import {http200EmptyResponse} from "@shared/helpers/common.http-responses";

export const authenticationHandler = handlerWrapper(async (request: HttpRequest): Promise<HttpResponse> => {
  // GET TOKEN
  if (request.path === HttpPath.AUTH_TOKEN && request.method === HttpMethod.POST) {
    const body = request.body
    if (!isAuthTokenHttpBody(body)) {
      throw new BadRequestException()
    }
    return AuthenticationService.getToken(body.role, body.credentials)
  }

  // ADD PWA SUBSCRIPTION
  if (request.path === HttpPath.MEMBER_PWA_SUBSCRIPTION && request.method === HttpMethod.PATCH) {
    const user = request.user
    const body = request.body
    if (!isPractitioner(user)) {
      throw new ForbiddenException()
    }
    if (!isMemberPwaSubscriptionHttpBody(body)) {
      throw new BadRequestException()
    }
    await MemberService.addPwaSubscription(user, body)
    return http200EmptyResponse
  }

  throw new BadRequestException()
}, {
  withAuthentication: true,
  noCacheForBrowsers: true
})