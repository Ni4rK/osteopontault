import HttpService from "./http.service";
import {catchError, map, Observable, of, throwError} from "rxjs";
import {Injectable} from "@angular/core";
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
import ToasterService from "./toaster.service";
import {HttpErrorResponse} from "@angular/common/http";

@Injectable({providedIn: 'root'})
export default class AvailabilityService {
  constructor(
    private readonly http: HttpService,
    private readonly toastService: ToasterService,
  ) {
  }

  public list(from?: Date, to?: Date): Observable<Availability[]> {
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
    return this.http.get<Availability[]>(`${baseUrl}?${query.join('&')}`).pipe(
      map((availabilities) => {
        if (!availabilities) {
          return []
        }
        availabilities.forEach((availability) => {
          availability.slots.sort((s1, s2) => s1.from < s2.from ? -1 : 1)
        })
        return availabilities.sort((a1, a2) => a1.date < a2.date ? -1 : 1)
      }),
      catchError((error) => {
        console.error(error)
        this.toastService.sendToast({
          severity: "error",
          summary: "Impossible de récupérer les créneaux",
        })
        return throwError(error)
      })
    )
  }

  public create(practitioner: Practitioner, date: Date, stepTime: number, howMany: number): Observable<void> {
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
    return this.http.post<void, AvailabilityInsertHttpBody>(HttpPath.AVAILABILITY_INSERT, payload).pipe(
      catchError((error) => {
        console.error(error)
        this.toastService.sendToast({
          severity: "error",
          summary: "Impossible de créer les créneaux",
        })
        return throwError(error)
      })
    )
  }

  public edit(slot: SlotPersisted, sendNotification: boolean): Observable<void> {
    return this.http.patch<void, AvailabilityUpdateHttpBody>(HttpPath.AVAILABILITY_UPDATE, {
      slots: [slot],
      sendNotification: sendNotification
    }).pipe(
      catchError(error => {
        console.error(error)
        this.toastService.sendToast({
          severity: "error",
          summary: "Impossible de modifier le créneau",
        })
        return throwError(error)
      })
    )
  }

  public book(uid: string, patient: Patient): Observable<void> {
    return this.http.patch<void, AvailabilityBookHttpBody>(HttpPath.AVAILABILITY_BOOK, {
      uid: uid,
      patient: patient
    }).pipe(
      catchError(error => {
        console.error(error)
        this.toastService.sendToast({
          severity: "error",
          summary: error instanceof HttpErrorResponse && error.error ? error.error : "Impossible de réserver le créneau",
          sticky: true
        })
        return throwError(error)
      })
    )
  }

  public remove(slot: SlotPersisted): Observable<void> {
    return this.http.delete<void>(`${HttpPath.AVAILABILITY_DELETE}?uid=${slot.uid}`).pipe(
      catchError(error => {
        console.error(error)
        this.toastService.sendToast({
          severity: "error",
          summary: "Impossible de supprimer le créneau",
        })
        return throwError(error)
      })
    )
  }
}
