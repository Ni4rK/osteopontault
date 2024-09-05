import {isString} from "../helpers/common-types.guards";

export enum Role {
  GUEST = 'guest',
  PRACTITIONER = 'practitioner'
}

export function isRole(value: unknown): value is Role {
  return isString(value) && (Object.values(Role) as string[]).includes(value)
}
