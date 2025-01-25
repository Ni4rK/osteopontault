import PhoneHelper from "./phone.helper";
import {Practitioner} from "../types/practitioner.enum";

export default class TextHelper {
  static toUcFirst(value: string): string {
    const words = value.split(/[-_'" .]/)
    if (!words.length) {
      return value
    }
    if (words.length > 1) {
      return words.map(TextHelper.toUcFirst).join(" ")
    }

    const word = words[0]
    if (!word.length) {
      return word
    }

    const firstLetter = word.at(0)!.toUpperCase()
    if (word.length < 1) {
      return firstLetter
    }

    const otherLetters = word.slice(1).toLowerCase()
    return `${firstLetter}${otherLetters}`
  }

  static toReadablePhoneNumber(value: string): string {
    return PhoneHelper.toReadableNumber(value)
  }

  static toPractitionerName(value: Practitioner): string {
    if (value === Practitioner.ANAIS) {
      return "Anaïs"
    }
    return "Roselyne"
  }
}
