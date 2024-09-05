import {Availability} from "@shared/types/availability.interface";
import clientDatabase from "../database/client.database";
import {isSlotPersisted, mapDatabaseItemToSlotPersisted, Slot, SlotPersisted} from "@shared/types/slot.interface";
import DateHelper from "@shared/helpers/date.helper";
import DateFormat from "@shared/types/date-format.enum";
import {Patient} from "@shared/types/patient.interface";
import BadRequestException from "../exceptions/bad-request.exception";
import type {NativeAttributeValue} from "@aws-sdk/util-dynamodb";
import EnvironmentHelper from "../utils/environment.helper";
import NotificationPushService from "./notification-push.service";

export default class AvailabilityService {
  static async find(uid: string): Promise<SlotPersisted> {
    const slots = await clientDatabase.find({
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
    const slotsByDate: { [date: string]: SlotPersisted[] } = {}
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
    const result = await clientDatabase.find({
      TableName: EnvironmentHelper.getAvailabilitySlotTableName(),
      FilterExpression: filterExpressions.length ? filterExpressions.join(' AND ') : undefined,
      ExpressionAttributeValues: filterExpressions.length ? expressionAttributeValues : undefined
    })

    ;(result?.Items ?? []).forEach(item => {
      const slot = mapDatabaseItemToSlotPersisted(item)
      const date = DateHelper.format(slot.from, DateFormat.SHORT_DATE_API)
      if (slotsByDate[date] === undefined) {
        slotsByDate[date] = []
      }
      slotsByDate[date].push(slot)
    })

    return Promise.resolve(Object.keys(slotsByDate).map(date => ({
      date: slotsByDate[date][0].from,
      slots: slotsByDate[date]
    })))
  }

  static async insertAvailabilitySlots(slots: (Slot)[]): Promise<void> {
    for (const slot of slots) {
      const hasPatient = !!slot.patient && !!slot.patient.firstname && !!slot.patient.lastname && !!slot.patient.phone && !!slot.patient.type
      await clientDatabase.insert({
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

  static async updateAvailabilitySlots(slots: SlotPersisted[]): Promise<void> {
    await slots.forEach(async slot => {
      const bookedAt = slot.bookedAt ? slot.bookedAt : new Date().toISOString()
      await clientDatabase.update({
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
  }

  static async bookAvailabilitySlots(slotUid: string, patient: Patient): Promise<void> {
    const slot = await this.find(slotUid)
    if (slot.hasPatient) {
      throw new BadRequestException("Créneau déjà réservé")
    }
    const bookedAt = new Date().toISOString()
    await clientDatabase.update({
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

    const slotShortDateTime = `${DateHelper.format(slot.from, DateFormat.SHORT_DATE)} à ${DateHelper.format(slot.from, DateFormat.TIME)}`
    const slotLongDateTime = DateHelper.format(slot.from, DateFormat.DATE_TIME)
    await NotificationPushService.notify(slot.practitioner, {
      title: `Créneau reservé (${slotShortDateTime})`,
      body: `${patient.lastname} ${patient.firstname} a pris le créneau du ${slotLongDateTime}`
    })
  }

  static async removeAvailabilitySlots(slotsUid: string[]): Promise<void> {
    await slotsUid.forEach(async uid => {
      await clientDatabase.remove({
        TableName: EnvironmentHelper.getAvailabilitySlotTableName(),
        Key: {
          uid: uid
        }
      })
    })
  }
}
