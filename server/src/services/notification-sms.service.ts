import {Slot} from "@shared/types/slot.interface";
import {Patient} from "@shared/types/patient.interface";
import TextHelper from "@shared/helpers/text.helper";
import DateHelper from "@shared/helpers/date.helper";
import DateFormat from "@shared/types/date-format.enum";

export default class NotificationSmsService {
  static BOOK_CONFIRMED_SMS_TEMPLATE = "Bonjour {PATIENT_NAME},\nRendez-vous confirmé pour le {SLOT_DATE_TIME}.\nInfos pratiques sur osteopontault.fr\nModification ou annulation au 0695084023"
  static BOOK_REMINDER_SMS_TEMPLATE = "Bonjour {PATIENT_NAME},\nPour rappel votre rendez-vous demain {SLOT_DATE_TIME}.\nInfos pratiques sur osteopontault.fr"

  static generateBookConfirmationSmsBody(slot: Slot, patient: Patient): string {
    return NotificationSmsService.BOOK_CONFIRMED_SMS_TEMPLATE
      .replace("{PATIENT_NAME}", `${TextHelper.toUcFirst(patient.firstname)} ${patient.lastname.toUpperCase()}`)
      .replace("{SLOT_DATE_TIME}", DateHelper.format(slot.from, DateFormat.DATE_TIME))
  }
}