import HttpMethod from "./http-method.enum";
import {Practitioner} from "./practitioner.enum";
import {Guest} from "./guest.type";
import {HttpRequestHeaders} from "./http-headers.interface";

export default interface HttpRequest<T extends object = {}> {
  method: HttpMethod
  path: string
  headers: HttpRequestHeaders,
  query: { [name: string]: string | undefined },
  body: T,
  user: Practitioner | typeof Guest | null
}