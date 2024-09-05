import {isObject, isString} from "../helpers/common-types.guards";

export type AuthCredentials = {
  username: string,
  password: string
}

export function isAuthCredentials(value: unknown): value is AuthCredentials {
  return (
    isObject(value) &&
    'username' in value &&
    isString(value['username']) &&
    'password' in value &&
    isString(value['password'])
  )
}
