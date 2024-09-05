import handlerWrapper from "../handlers/handler.wrapper";
import HttpRequest from "@shared/types/http-request.interface";
import {HttpResponse} from "@shared/types/http-response.type";
import {http200EmptyResponse} from "@shared/helpers/common.http-responses";

export const optionsHandler = handlerWrapper(async (request: HttpRequest): Promise<HttpResponse> => {
  return http200EmptyResponse
})