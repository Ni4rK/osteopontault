import {isString} from "./common-types.guards";

export default class PhoneHelper {
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

  static isValidNumber(value: unknown): boolean {
    return (
      isString(value) &&
      value.startsWith('0') &&
      /^[0-9]{10}$/.test(value) &&
      !PhoneHelper.BLACKLIST_PHONES.includes(value)
    )
  }

  static sanitizeNumber(value: string): string {
    let number = value
    if (!number.startsWith('0')) {
      number = `0${number}`
    }
    return number
      .replace(/[^0-9]/g, "")
      .substring(0, 10)
  }

  static toReadableNumber(value: string): string {
    const numbers: string[] = []
    const phone = PhoneHelper.sanitizeNumber(value)
    for (let index = 0; index < phone.length; index += 2) {
      const digits: string[] = [phone[index]]
      if (index + 1 < phone.length) {
        digits.push(phone[index + 1])
      }
      numbers.push(digits.join(""))
    }
    return numbers.join(" ")
  }

  static toFrenchNumber(phone: string): string {
    if (phone.startsWith("+33")) {
      return phone
    }
    if (phone.startsWith("0")) {
      return `+33${phone.slice(1)}`
    }
    return phone
  }
}