import {isNumber, isString} from "@shared/helpers/common-types.guards";
import DbTable from "@shared/types/db-table.enum";

export default class EnvironmentHelper {
  static getAuthenticationMemberTableName(): string {
    if (isString(process.env.DB_AUTHENTICATION_MEMBER_TABLE_NAME) && process.env.DB_AUTHENTICATION_MEMBER_TABLE_NAME.length) {
      return process.env.DB_AUTHENTICATION_MEMBER_TABLE_NAME
    }
    return DbTable.AUTHENTICATION_MEMBER
  }

  static getAvailabilitySlotTableName(): string {
    if (isString(process.env.DB_AVAILABILITY_SLOT_TABLE_NAME) && process.env.DB_AVAILABILITY_SLOT_TABLE_NAME.length) {
      return process.env.DB_AVAILABILITY_SLOT_TABLE_NAME
    }
    return DbTable.AVAILABILITY_SLOT
  }

  static getDbEndpoint(): string | null {
    if (isString(process.env.DB_ENDPOINT) && process.env.DB_ENDPOINT.length) {
      return process.env.DB_ENDPOINT
    }
    return null
  }

  static getMode(): 'prod' | 'dev' {
    if (process.env.MODE === 'prod') {
      return 'prod'
    }
    return 'dev'
  }

  static getAuthKey(): string {
    if (isString(process.env.AUTH_KEY) && process.env.AUTH_KEY.length) {
      return process.env.AUTH_KEY
    }
    return 'fake_auth_key'
  }

  static getAuthExpGuest(): number {
    if (isString(process.env.AUTH_EXP_GUEST) && process.env.AUTH_EXP_GUEST.length && isNumber(+process.env.AUTH_EXP_GUEST)) {
      return +process.env.AUTH_EXP_GUEST
    }
    return 30 * 60
  }

  static getAuthExpPractitioner(): number {
    if (isString(process.env.AUTH_EXP_PRACTITIONER) && process.env.AUTH_EXP_PRACTITIONER.length && isNumber(+process.env.AUTH_EXP_PRACTITIONER)) {
      return +process.env.AUTH_EXP_PRACTITIONER
    }
    return 30 * 60
  }

  static getVapidPrivateKey(): string {
    if (isString(process.env.VAPID_PRIVATE_KEY) && process.env.VAPID_PRIVATE_KEY.length) {
      return process.env.VAPID_PRIVATE_KEY
    }
    return 'fake_vapid_key'
  }
}