import HttpClientService from "./http-client.service";
import HttpPath from "@shared/types/http-path.enum";
import {Availability} from "@shared/types/availability.interface";
import {
  AvailabilityBookHttpBody,
  AvailabilityInsertHttpBody,
  AvailabilityUpdateHttpBody
} from "@shared/types/http-body.types";
import {Practitioner} from "@shared/types/practitioner.enum";
import {SlotPersisted} from "@shared/types/slot.interface";
import {Patient} from "@shared/types/patient.interface";
import ToasterService from "../snackbar/toaster.service";
import Exception from "@/utils/exception";
import {AxiosError} from "axios";
import {Container, Service} from "typedi";

@Service()
export default class AvailabilityHttpService {
  private readonly httpClientService = Container.get(HttpClientService)
  private readonly toasterService = Container.get(ToasterService)

  public async list(from?: Date, to?: Date): Promise<Availability[]> {
    try {
      const query: string[] = []
      const baseUrl = HttpPath.AVAILABILITY_GET
      if (from) {
        from.setHours(0)
        from.setMinutes(0)
        from.setSeconds(0)
        query.push(`from=${from.toISOString()}`)
      }
      if (to) {
        to.setHours(0)
        to.setMinutes(0)
        to.setSeconds(0)
        query.push(`to=${to.toISOString()}`)
      }
      const availabilities = await this.httpClientService.get<Availability[]>(`${baseUrl}?${query.join('&')}`)
      if (!availabilities) {
        return []
      }
      availabilities.forEach((availability) => {
        availability.slots.sort((s1, s2) => s1.from < s2.from ? -1 : 1)
      })
      return availabilities.sort((a1, a2) => a1.date < a2.date ? -1 : 1)
    } catch (error) {
      console.error(error)
      throw new Exception(`Unable to get availabilities from ${from} to ${to}`)
    }
  }

  public async create(practitioner: Practitioner, date: Date, stepTime: number, howMany: number): Promise<void> {
    try {
      const payload: AvailabilityInsertHttpBody = []
      date.setSeconds(0)
      date.setMilliseconds(0)
      for (let s = 0; s < howMany; s += 1) {
        const from = new Date(date)
        from.setMinutes(date.getMinutes() + s * stepTime)
        const to = new Date(date)
        to.setMinutes(date.getMinutes() + (s + 1) * stepTime)
        payload.push({
          from: from.toISOString(),
          to: to.toISOString(),
          practitioner: practitioner,
          hasPatient: false,
          patient: null
        })
      }
      return this.httpClientService.post<void, AvailabilityInsertHttpBody>(HttpPath.AVAILABILITY_INSERT, payload)
    } catch (error) {
      console.error(error)
      throw new Exception(`Unable to create availabilities for ${practitioner} at ${date}, stepTime=${stepTime}, howMany=${howMany}`)
    }
  }

  public async edit(slot: SlotPersisted, sendNotification: boolean): Promise<void> {
    try {
      return this.httpClientService.patch<void, AvailabilityUpdateHttpBody>(
        HttpPath.AVAILABILITY_UPDATE, {
          slots: [slot],
          sendNotification: sendNotification
        }
      )
    } catch (error) {
      console.error(error)
      throw new Exception(`Unable to edit slot`, slot, sendNotification)
    }
  }

  public async book(uid: string, patient: Patient): Promise<void> {
    try {
      return this.httpClientService.patch<void, AvailabilityBookHttpBody>(HttpPath.AVAILABILITY_BOOK, {
        uid: uid,
        patient: patient
      })
    } catch (error) {
      console.error(error)
      if (error instanceof AxiosError && error.message) {
        this.toasterService.sendToast({
          type: "error",
          message: error.message
        })
      } else {
        throw new Exception(`Unable to book slot with uid ${uid}`, patient)
      }
    }
  }

  public async remove(slot: SlotPersisted): Promise<void> {
    try {
      return this.httpClientService.delete(`${HttpPath.AVAILABILITY_DELETE}?uid=${slot.uid}`)
    } catch (error) {
      console.error(error)
      throw new Exception(`Unable to remove slot`, slot)
    }
  }
}
