import {isPatient, Patient} from "./patient.interface";
import {isPractitioner, Practitioner} from "./practitioner.enum";
import {isDate, isNull, isObject, isString, isUndefined} from "../helpers/common-types.guards";
import DateHelper from "../helpers/date.helper";
import DateFormat from "./date-format.enum";

export interface Slot {
  from: string
  to: string
  practitioner: Practitioner
  hasPatient: boolean
  patient: Patient | null
}

export function isSlot(value: unknown): value is Slot {
  return (
    isObject(value) &&
    'from' in value &&
    isString(value['from']) &&
    'to' in value &&
    isString(value['to']) &&
    'practitioner' in value &&
    isPractitioner(value['practitioner']) &&
    'patient' in value) &&
    (
      isNull(value['patient']) ||
      isPatient(value['patient'])
    )
}

export type SlotPersisted = Slot & {
  uid: string
  bookedAt?: string
}

export function isSlotPersisted(value: unknown): value is SlotPersisted {
  return (
    isSlot(value) &&
    'uid' in value &&
    isString(value['uid']) &&
    (
      !('bookedAt' in value) ||
      isUndefined(value['bookedAt']) ||
      isString(value['bookedAt'])
    )
  )
}

export function mapDatabaseItemToSlotPersisted(item: Record<string,any>): SlotPersisted {
  const from = new Date(item["fromDate"])
  const to = new Date(item["toDate"])
  const bookedAt = item["bookedAt"] ? new Date(item["bookedAt"]) : undefined
  const patient: Patient | null = !item["hasPatient"] ? null : {
    firstname: item["patientFirstname"],
    lastname: item["patientLastname"],
    phone: item["patientPhone"],
    type: item["patientType"]
  }
  return {
    uid: item["uid"],
    from: from.toISOString(),
    to: to.toISOString(),
    practitioner: item["practitioner"],
    bookedAt: bookedAt ? bookedAt.toISOString() : undefined,
    hasPatient: item["hasPatient"],
    patient: patient
  }
}