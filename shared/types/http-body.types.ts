import {isRole, Role} from "./role.enum";
import {AuthCredentials, isAuthCredentials} from "./auth-credentials.type";
import {isArrayOf, isBoolean, isObject, isString} from "../helpers/common-types.guards";
import {isSlot, isSlotPersisted, Slot, SlotPersisted} from "./slot.interface";
import {isPatient, Patient} from "./patient.interface";
import {isMemberPwaSubscription, MemberPwaSubscription} from "./member.interface";

export type AuthTokenHttpBody = {
  role: Role
  credentials?: AuthCredentials
}

export function isAuthTokenHttpBody(value: unknown): value is AuthTokenHttpBody {
  if (!isObject(value) || !('role' in value) || !isRole(value['role'])) {
    return false
  }
  if (value['role'] === Role.GUEST) {
    return true
  }
  // role === Role.PRACTITIONER
  return 'credentials' in value && isAuthCredentials(value['credentials'])
}

export type AvailabilityInsertHttpBody = Slot[]

export function isAvailabilityInsertHttpBody(value: unknown): value is AvailabilityInsertHttpBody {
  return isArrayOf(value, isSlot)
}

export type AvailabilityUpdateHttpBody = {
  slots: SlotPersisted[],
  sendNotification: boolean
}

export function isAvailabilityUpdateHttpBody(value: unknown): value is AvailabilityUpdateHttpBody {
  return (
    isObject(value) &&
    'slots' in value &&
    isArrayOf(value['slots'], isSlotPersisted) &&
    'sendNotification' in value &&
    isBoolean(value['sendNotification'])
  )
}

export type AvailabilityBookHttpBody = {
  uid: string
  patient: Patient
}

export function isAvailabilityBookHttpBody(value: unknown): value is AvailabilityBookHttpBody {
  return (
    isObject(value) &&
    'uid' in value &&
    isString(value['uid']) &&
    'patient' in value &&
    isPatient(value['patient'])
  )
}

export type MemberPwaSubscriptionHttpBody = MemberPwaSubscription

export function isMemberPwaSubscriptionHttpBody(value: unknown): value is MemberPwaSubscriptionHttpBody {
  return isMemberPwaSubscription(value)
}