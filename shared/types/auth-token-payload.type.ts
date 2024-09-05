import {Role} from "./role.enum";
import {Practitioner, isPractitioner} from "./practitioner.enum";
import {isObject} from "../helpers/common-types.guards";

export type TokenPayloadGuest = {
  role: Role.GUEST
}

export function isTokenPayloadGuest(value: unknown): value is TokenPayloadGuest {
  return (
    isObject(value) &&
    'role' in value &&
    value['role'] === Role.GUEST
  )
}

export type TokenPayloadPractitioner = {
  role: Role.PRACTITIONER,
  practitioner: Practitioner
}

export function isTokenPayloadPractitioner(value: unknown): value is TokenPayloadPractitioner {
  return (
    isObject(value) &&
    'role' in value &&
    value['role'] === Role.PRACTITIONER &&
    'practitioner' in value &&
    isPractitioner(value['practitioner'])
  )
}

export type TokenPayload = TokenPayloadGuest | TokenPayloadPractitioner

export function isTokenPayload(value: unknown): value is TokenPayload {
  return isTokenPayloadGuest(value) || isTokenPayloadPractitioner(value)
}