import {isArrayOf, isNull, isObject, isString} from "../helpers/common-types.guards";

export enum AnalyticsAction {
  __SESSION_INIT = "__SESSION_INIT",
  __SESSION_INACTIVE = "__SESSION_INACTIVE",
  __SESSION_RESUMED = "__SESSION_RESUMED",
  READING = "READING",
  INFOS_OPENED = "INFOS_OPENED",
  INFOS_CLOSED = "INFOS_CLOSED",
  OSTEOPATHY_OPENED = "OSTEOPATHY_OPENED",
  OSTEOPATHY_CLOSED = "OSTEOPATHY_CLOSED",
  SLOTS_LIST_SCROLLED_A_BIT = "SLOTS_LIST_SCROLLED_A_BIT",
  SLOTS_LIST_SCROLLED_A_LOT = "SLOTS_LIST_SCROLLED_A_LOT",
  SLOT_NEXT_CLICKED = "SLOT_NEXT_CLICKED",
  SLOT_SPECIFIC_CLICKED = "SLOT_SPECIFIC_CLICKED",
  APPOINTMENT_CANCELED = "APPOINTMENT_CANCELED",
  APPOINTMENT_LASTNAME_FILLED = "APPOINTMENT_LASTNAME_FILLED",
  APPOINTMENT_FIRSTNAME_FILLED = "APPOINTMENT_FIRSTNAME_FILLED",
  APPOINTMENT_PHONE_FILLED = "APPOINTMENT_PHONE_FILLED",
  APPOINTMENT_PATIENT_TYPE_CHANGED = "APPOINTMENT_PATIENT_TYPE_CHANGED",
  APPOINTMENT_BOOKED = "APPOINTMENT_BOOKED",
  LOCATION_CLICKED = "LOCATION_CLICKED",
  PHONE_CLICKED = "PHONE_CLICKED",
}

export function isAnalyticsAction(value: unknown): value is AnalyticsAction {
  return (
    isString(value) &&
    Object.values(AnalyticsAction).includes(value as AnalyticsAction)
  )
}

export type AnalyticsActionDataTypes = {
  [AnalyticsAction.APPOINTMENT_LASTNAME_FILLED]: {
    lastname: string
  }
  [AnalyticsAction.APPOINTMENT_FIRSTNAME_FILLED]: {
    firstname: string
  }
  [AnalyticsAction.APPOINTMENT_PATIENT_TYPE_CHANGED]: {
    patientType: string
  }
  [AnalyticsAction.APPOINTMENT_PHONE_FILLED]: {
    phone: string
  }
  [AnalyticsAction.SLOT_NEXT_CLICKED]: {
    date: string
  }
  [AnalyticsAction.SLOT_SPECIFIC_CLICKED]: {
    date: string
  }
  [AnalyticsAction.SLOT_SPECIFIC_CLICKED]: {
    date: string
  }
  [AnalyticsAction.APPOINTMENT_BOOKED]: {
    date: string
    patient: string
    success: boolean
  }
}

export type AnalyticsActionData = {
  action: AnalyticsAction
  date: string
  data: string | null
}

export function isAnalyticsActionData(value: unknown): value is AnalyticsActionData {
  return (
    isObject(value) &&
    "action" in value &&
    isAnalyticsAction(value["action"]) &&
    "date" in value &&
    isString(value["date"]) &&
    "data" in value &&
    (
      isNull(value["data"]) ||
      isString(value["data"])
    )
  )
}

export type AnalyticsActionsForSession = {
  userId: string
  sessionId: string
  sessionStartDate: string
  sessionEndDate: string
  actions: AnalyticsActionData[]
}

export function isAnalyticsActionsForSession(value: unknown): value is AnalyticsActionsForSession {
  return (
    isObject(value) &&
    "userId" in value &&
    isString(value["userId"]) &&
    "sessionId" in value &&
    isString(value["sessionId"]) &&
    "sessionStartDate" in value &&
    isString(value["sessionStartDate"]) &&
    "sessionEndDate" in value &&
    isString(value["sessionEndDate"]) &&
    "actions" in value &&
    isArrayOf(value["actions"], isAnalyticsActionData)
  )
}

export function mapDatabaseItemToAnalyticsActionsForSession(item: Record<string,any>): AnalyticsActionsForSession {
  return {
    userId: item["userId"],
    sessionId: item["sessionId"],
    sessionStartDate: item["sessionStartDate"],
    sessionEndDate: item["sessionEndDate"],
    actions: item["actions"]
  }
}