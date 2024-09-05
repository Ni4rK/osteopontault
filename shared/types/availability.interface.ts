import {isSlot, SlotPersisted} from "./slot.interface";
import {isArrayOf, isDate, isObject, isString} from "../helpers/common-types.guards";

export interface Availability {
  date: string;
  slots: SlotPersisted[];
}

export function isAvailability(value: unknown): value is Availability {
  return (
    isObject(value) &&
    'date' in value &&
    isString(value['date']) &&
    'slots' in value &&
    isArrayOf(value['slots'], isSlot)
  )
}