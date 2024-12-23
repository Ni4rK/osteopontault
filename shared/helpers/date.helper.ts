import DateFormat from "../types/date-format.enum";
import {isDate} from "./common-types.guards";
import {SlotPersisted} from "../types/slot.interface";

export default class DateHelper {
  static format(date: Date | string, format: DateFormat): string {
    if (!date) {
      return ''
    }
    const dateToFormat: Date = isDate(date) ? date : new Date(date)
    let formatter = new Intl.DateTimeFormat('fr-FR', {
      timeZone: "Europe/Paris"
    })
    switch (format) {
      case DateFormat.FULL_DATE:
        formatter = new Intl.DateTimeFormat('fr-FR', {
          month: "long",
          day: "2-digit",
          weekday: "long",
          timeZone: "Europe/Paris"
        })
        break
      case DateFormat.MEDIUM_DATE:
        formatter = new Intl.DateTimeFormat('fr-FR', {
          month: "short",
          day: "2-digit",
          weekday: "short",
          timeZone: "Europe/Paris"
        })
        break
      case DateFormat.DATE_TIME:
        formatter = new Intl.DateTimeFormat('fr-FR', {
          month: "long",
          day: "2-digit",
          weekday: "long",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Paris"
        })
        break
      case DateFormat.SHORT_DATE:
        formatter = new Intl.DateTimeFormat('fr-FR', {
          day: "numeric",
          weekday: "short",
          timeZone: "Europe/Paris"
        })
        break
      case DateFormat.TIME:
        formatter = new Intl.DateTimeFormat('fr-FR', {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Paris"
        })
        break
      case DateFormat.TIME_SECONDS:
        formatter = new Intl.DateTimeFormat('fr-FR', {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Europe/Paris"
        })
        break
      case DateFormat.DATE_PRIME:
      case DateFormat.SHORT_DATE_API:
      default:
    }
    return formatter.format(dateToFormat)
  }

  static isWednesday(date: Date | string): boolean {
    const dateToCheck: Date = isDate(date) ? date : new Date(date)
    const day = new Intl.DateTimeFormat('en-EN', {
      weekday: "long"
    }).format(dateToCheck)
    return day.toLowerCase() === 'wednesday'
  }

  static getTimeInMinutes(date: Date | string): number {
    const d: Date = isDate(date) ? date : new Date(date)
    return d.getHours() * 60 + d.getMinutes()
  }

  static getDifferenceOfTimeInMinutes(date1: Date | string, date2: Date | string): number {
    const d1: Date = isDate(date1) ? date1 : new Date(date1)
    const d2: Date = isDate(date2) ? date2 : new Date(date2)
    d1.setSeconds(0)
    d1.setMilliseconds(0)
    d2.setSeconds(0)
    d2.setMilliseconds(0)
    return (d2.getTime() - d1.getTime()) / (60 * 1000)
  }

  static getDifferenceOfTimeInSeconds(date1: Date | string, date2: Date | string): number {
    const d1: Date = isDate(date1) ? date1 : new Date(date1)
    const d2: Date = isDate(date2) ? date2 : new Date(date2)
    d1.setMilliseconds(0)
    d2.setMilliseconds(0)
    return (d2.getTime() - d1.getTime()) / 1000
  }

  static getWeekFromDate(date: Date): Date[] {
    const startOfWeek = this.getStartOfWeekFromDate(date)
    startOfWeek.setHours(0)
    startOfWeek.setMinutes(0)
    return [0, 1, 2, 3, 4, 5, 6].map((offset) => {
      const dayOfWeek = new Date(startOfWeek)
      dayOfWeek.setDate(startOfWeek.getDate() + offset)
      return dayOfWeek
    })
  }

  static getStartOfWeekFromDate(date: Date): Date {
    const day = date.getDay()
    const offsetForStartOfWeek = day - 1
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - offsetForStartOfWeek)
    startOfWeek.setSeconds(0)
    startOfWeek.setMilliseconds(0)
    return startOfWeek
  }

  static parseMinutes(minutes: number): string {
    const parts: string[] = []
    const parsedHours = Math.floor(minutes / 60)
    const parsedMinutes = Math.floor(minutes % 60)
    if (parsedHours) {
      parts.push(`${parsedHours}h`)
    }
    if (parsedMinutes) {
      parts.push(`${parsedMinutes}min`)
    }
    return parts.join('')
  }

  static parseSeconds(seconds: number): string {
    const parts: string[] = []
    const parsedMinutes = Math.floor(seconds / 60)
    const parsedSeconds = Math.floor(seconds % 60)
    if (parsedMinutes) {
      parts.push(`${parsedMinutes}min`)
    }
    if (parsedSeconds) {
      parts.push(`${parsedSeconds}s`)
    }
    return parts.join('')
  }
}