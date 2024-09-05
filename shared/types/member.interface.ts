import {isArrayOf, isNull, isNumber, isObject, isString} from "../helpers/common-types.guards";

export interface MemberPwaSubscription {
  endpoint: string
  expirationTime: number | null
  p256dh: string
  authToken: string
}

export function isMemberPwaSubscription(value: unknown): value is MemberPwaSubscription {
  return (
    isObject(value) &&
    'endpoint' in value &&
    isString(value['endpoint']) &&
    'expirationTime' in value &&
    (
      isNull(value['expirationTime']) ||
      isNumber(value['expirationTime'])
    ) &&
    'p256dh' in value &&
    isString(value['p256dh']) &&
    'authToken' in value &&
    isString(value['authToken'])
  )
}

export interface Member {
  username: string
  passwordHashed: string
  pwaSubscriptions: MemberPwaSubscription[]
}

export function isMember(value: unknown): value is Member {
  return (
    isObject(value) &&
    'username' in value &&
    isString(value['username']) &&
    'passwordHashed' in value &&
    isString(value['passwordHashed']) &&
    'pwaSubscriptions' in value &&
    isArrayOf(value['pwaSubscriptions'], isMemberPwaSubscription)
  )
}
