import {isString} from "@shared/helpers/common-types.guards";
import {Patient} from "@shared/types/patient.interface";
import {Slot, SlotPersisted} from "@shared/types/slot.interface";
import TextHelper from "@shared/helpers/text.helper";
import DateHelper from "@shared/helpers/date.helper";
import DateFormat from "@shared/types/date-format.enum";

export default class SmsHelper {
  static BOOK_CONFIRMED_SMS_TEMPLATE = "Bonjour {PATIENT_NAME},\nRendez-vous confirmé pour le {SLOT_DATE_TIME}.\nInfos pratiques sur osteopontault.fr\nModification ou annulation au 0695084023"
  static BOOK_REMINDER_SMS_TEMPLATE = "Bonjour {PATIENT_NAME},\nPour rappel votre rendez-vous demain {SLOT_DATE_TIME}.\nInfos pratiques sur osteopontault.fr"
  static BLACKLIST_PHONES = [
    "0666666666",
    "0111111111",
    "0222222222",
    "0333333333",
    "0444444444",
    "0555555555",
    "0666666666",
    "0777777777",
    "0888888888",
    "0999999999",
    "0000000000",
    "1111111111",
    "2222222222",
    "3333333333",
    "4444444444",
    "5555555555",
    "6666666666",
    "7777777777",
    "8888888888",
    "9999999999",
    "0123456789",
    "0987654321",
  ]

  static isValidPhone(value: unknown): boolean {
    return (
      isString(value) &&
      value.startsWith('0') &&
      /^[0-9]{10}$/.test(value) &&
      !SmsHelper.BLACKLIST_PHONES.includes(value)
    )
  }

  static generateBookConfirmationSmsBody(slot: Slot, patient: Patient): string {
    return SmsHelper.BOOK_CONFIRMED_SMS_TEMPLATE
      .replace("{PATIENT_NAME}", `${TextHelper.toUcFirst(patient.firstname)} ${patient.lastname.toUpperCase()}`)
      .replace("{SLOT_DATE_TIME}", DateHelper.format(slot.from, DateFormat.DATE_TIME))
  }

  static transformIntoFrenchPhoneNumber(phone: string): string {
    if (phone.startsWith("+33")) {
      return phone
    }
    if (phone.startsWith("0")) {
      return `+33${phone.slice(1)}`
    }
    return phone
  }
}