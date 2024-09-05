import {isNumber, isObject} from "../helpers/common-types.guards";

export type HttpResponseWithStatusAndData<T extends {} = {}> = {
  statusCode: number
  data: T
}

export function isHttpResponseWithStatusAndCode(value: unknown): value is HttpResponseWithStatusAndData {
  return (
    isObject(value) &&
    'statusCode' in value &&
    isNumber(value['statusCode']) &&
    'data' in value &&
    isObject(value['data'])
  )
}

export type HttpResponse<T extends {} = {}> = HttpResponseWithStatusAndData<T> | T
