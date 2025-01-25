import {Availability} from "@shared/types/availability.interface";
import databaseClient from "../clients/database.client";
import {isSlotPersisted, mapDatabaseItemToSlotPersisted, Slot, SlotPersisted} from "@shared/types/slot.interface";
import DateHelper from "@shared/helpers/date.helper";
import DateFormat from "@shared/types/date-format.enum";
import {Patient} from "@shared/types/patient.interface";
import BadRequestException from "../exceptions/bad-request.exception";
import type {NativeAttributeValue} from "@aws-sdk/util-dynamodb";
import EnvironmentHelper from "../utils/environment.helper";
import NotificationPushService from "./notification-push.service";
import {Practitioner} from "@shared/types/practitioner.enum";

export default class AvailabilityService {
  static async find(uid: string): Promise<SlotPersisted> {
    const slots = await databaseClient.find({
      TableName: EnvironmentHelper.getAvailabilitySlotTableName(),
      FilterExpression: "uid = :uid",
      ExpressionAttributeValues: {":uid": uid}
    })
    if (!slots.Count) {
      throw new BadRequestException(`No slot found with uid ${uid}`)
    }
    if (slots.Count !== 1) {
      throw new BadRequestException(`Too many slots found with uid ${uid}`)
    }
    const slotRaw = slots.Items![0]
    const slot = mapDatabaseItemToSlotPersisted(slotRaw)
    if (!isSlotPersisted(slot)) {
      throw new BadRequestException(`Slot with uid ${uid} does not look like a slot`)
    }
    return slot
  }

  static async getAvailabilities(from?: Date, to?: Date): Promise<Availability[]> {
    const filterExpressions: string[] = []
    const expressionAttributeValues: Record<string, NativeAttributeValue> = {}
    if (from) {
      filterExpressions.push('fromDate >= :fromDate')
      expressionAttributeValues[':fromDate'] = from.toISOString()
    }
    if (to) {
      filterExpressions.push('toDate <= :toDate')
      expressionAttributeValues[':toDate'] = to.toISOString()
    }
    const results = await databaseClient.find({
      TableName: EnvironmentHelper.getAvailabilitySlotTableName(),
      FilterExpression: filterExpressions.length ? filterExpressions.join(' AND ') : undefined,
      ExpressionAttributeValues: filterExpressions.length ? expressionAttributeValues : undefined
    })

    const slotsByDate: { [date: string]: SlotPersisted[] } = {}
    ;(results?.Items ?? []).forEach(item => {
      const slot = mapDatabaseItemToSlotPersisted(item)
      const date = DateHelper.format(slot.from, DateFormat.SHORT_DATE_API)
      if (slotsByDate[date] === undefined) {
        slotsByDate[date] = []
      }
      slotsByDate[date].push(slot)
    })

    return Object.keys(slotsByDate).map(date => ({
      date: slotsByDate[date][0].from,
      slots: slotsByDate[date]
    }))
  }

  static async insertAvailabilitySlots(slots: (Slot)[]): Promise<void> {
    for (const slot of slots) {
      const hasPatient = !!slot.patient && !!slot.patient.firstname && !!slot.patient.lastname && !!slot.patient.phone && !!slot.patient.type
      await databaseClient.insert({
        TableName: EnvironmentHelper.getAvailabilitySlotTableName(),
        Item: {
          uid: `${Math.floor(Math.random() * 1000)}-${Date.now()}`,
          fromDate: slot.from,
          toDate: slot.to,
          practitioner: slot.practitioner,
          hasPatient: hasPatient,
          patientFirstname: hasPatient ? slot.patient!.firstname : null,
          patientLastname: hasPatient ? slot.patient!.lastname : null,
          patientPhone: hasPatient ? slot.patient!.phone : null,
          patientType: hasPatient ? slot.patient!.type : null
        }
      })
    }
  }

  static async updateAvailabilitySlots(slots: SlotPersisted[], sendNotification: boolean, byPractitioner: Practitioner): Promise<void> {
    await slots.forEach(async slot => {
      const bookedAt = slot.bookedAt ? slot.bookedAt : new Date().toISOString()
      await databaseClient.update({
        TableName: EnvironmentHelper.getAvailabilitySlotTableName(),
        Key: {
          uid: slot.uid
        },
        UpdateExpression: "SET" +
          " fromDate = :fromDate," +
          " toDate = :toDate," +
          " practitioner = :practitioner," +
          " bookedAt = :bookedAt," +
          " hasPatient = :hasPatient," +
          " patientFirstname = :patientFirstname," +
          " patientLastname = :patientLastname," +
          " patientPhone = :patientPhone," +
          " patientType = :patientType",
        ExpressionAttributeValues: {
          ":fromDate": slot.from,
          ":toDate": slot.to,
          ":practitioner": slot.practitioner,
          ":bookedAt": bookedAt,
          ":hasPatient": slot.hasPatient,
          ":patientFirstname": slot.hasPatient ? slot.patient!.firstname : null,
          ":patientLastname": slot.hasPatient ? slot.patient!.lastname : null,
          ":patientPhone": slot.hasPatient ? slot.patient!.phone : null,
          ":patientType": slot.hasPatient ? slot.patient!.type : null
        }
      })
    })

    for (const slot of slots) {
      if (!slot.hasPatient) {
        continue
      }
      if (sendNotification) {
        await AvailabilityService.notifyPractitioner(slot, slot.patient!, byPractitioner)
      }
      await AvailabilityService.notifyPatient(slot, slot.patient!)
    }
  }

  static async bookAvailabilitySlots(slotUid: string, patient: Patient): Promise<SlotPersisted> {
    const slot = await this.find(slotUid)
    if (slot.hasPatient) {
      throw new BadRequestException("Créneau déjà réservé")
    }
    const bookedAt = new Date().toISOString()
    await databaseClient.update({
      TableName: EnvironmentHelper.getAvailabilitySlotTableName(),
      Key: {
        uid: slot.uid
      },
      UpdateExpression: "SET" +
        " bookedAt = :bookedAt," +
        " hasPatient = :hasPatient," +
        " patientFirstname = :patientFirstname," +
        " patientLastname = :patientLastname," +
        " patientPhone = :patientPhone," +
        " patientType = :patientType",
      ExpressionAttributeValues: {
        ":bookedAt": bookedAt,
        ":hasPatient": true,
        ":patientFirstname": patient.firstname,
        ":patientLastname": patient.lastname,
        ":patientPhone": patient.phone,
        ":patientType": patient.type
      }
    })

    await AvailabilityService.notifyPractitioner(slot, patient)
    await AvailabilityService.notifyPatient(slot, patient)

    return {
      ...slot,
      hasPatient: true,
      patient: patient
    }
  }

  static async removeAvailabilitySlots(slotsUid: string[]): Promise<void> {
    await slotsUid.forEach(async uid => {
      await databaseClient.remove({
        TableName: EnvironmentHelper.getAvailabilitySlotTableName(),
        Key: {
          uid: uid
        }
      })
    })
  }

  private static async notifyPractitioner(slot: SlotPersisted, patient: Patient, via: Practitioner | null = null) {
    const bookedByPractitioner = via ? ` via ${via}` : ''
    const slotShortDateTime = `${DateHelper.format(slot.from, DateFormat.SHORT_DATE)} à ${DateHelper.format(slot.from, DateFormat.TIME)}`
    const slotLongDateTime = DateHelper.format(slot.from, DateFormat.DATE_TIME)

    await NotificationPushService.notify(slot.practitioner, {
      title: `Créneau reservé (${slotShortDateTime})${bookedByPractitioner}`,
      body: `${patient.lastname} ${patient.firstname} a pris le créneau du ${slotLongDateTime}`
    })
  }

  private static async notifyPatient(slot: SlotPersisted, patient: Patient) {
    // TODO: find some cheap way to notify patient
    // if (SmsHelper.isValidPhone(patient.phone)) {
    //   const body = SmsHelper.generateBookConfirmationSmsBody(slot, patient)
    //   const francePhone = SmsHelper.transformIntoFrenchPhoneNumber(patient.phone)
    //   await SmsClient.send(francePhone, body)
    // }
  }
}
