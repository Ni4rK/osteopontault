import {isString} from "../helpers/common-types.guards";

export enum Practitioner {
  ROSE = 'Rose',
  ANAIS = 'Anais'
}

export function isPractitioner(value: unknown): value is Practitioner {
  return isString(value) && (Object.values(Practitioner) as string[]).includes(value)
}