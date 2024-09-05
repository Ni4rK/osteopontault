import {isObject, isString} from "../helpers/common-types.guards";

export enum PatientType {
  ADULT = 'Adulte',
  BABY = 'Bébé',
  PREGNANT_WOMAN = 'Femme enceinte',
  SPORTSMAN = 'Sportif',
  CHILD = 'Enfant',
}

export function isPatientType(value: unknown): value is PatientType {
  return isString(value) && (Object.values(PatientType) as string[]).includes(value)
}

export interface Patient {
  firstname: string;
  lastname: string;
  phone: string;
  type: PatientType;
}

export function isPatient(value: unknown): value is Patient {
  return (
    isObject(value) &&
    'firstname' in value &&
    isString(value['firstname']) &&
    'lastname' in value &&
    isString(value['lastname']) &&
    'phone' in value &&
    isString(value['phone']) &&
    'type' in value &&
    isPatientType(value['type'])
  )
}