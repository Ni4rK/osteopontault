import {Component, OnInit} from "@angular/core";
import {catchError, of, take} from "rxjs";
import DateFormat from "@shared/types/date-format.enum";
import DateHelper from "@shared/helpers/date.helper";
import AnalyticsService from "../../../services/analytics.service";
import {
  AnalyticsAction,
  AnalyticsActionData,
  AnalyticsActionDataTypes,
  AnalyticsActionsForSession
} from "@shared/types/analytics.types";
import {Button} from "primeng/button";
import {NgForOf, NgIf, NgStyle} from "@angular/common";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {AccordionModule} from "primeng/accordion";

@Component({
  selector: 'op-sessions-list',
  standalone: true,
  imports: [
    Button,
    NgIf,
    ProgressSpinnerModule,
    NgStyle,
    NgForOf,
    AccordionModule
  ],
  templateUrl: './sessions-list.component.html',
  styleUrl: './sessions-list.component.scss'
})
export class SessionsListComponent implements OnInit {
  protected readonly DateFormat = DateFormat;
  protected readonly DateHelper = DateHelper;

  isLoadingSessions = false
  baseDateForSearch = new Date()
  sessionsByUser: Array<{
    user: string
    sessions: AnalyticsActionsForSession[]
  }> = []

  constructor(
    private readonly analyticsService: AnalyticsService
  ) {
  }

  ngOnInit() {
    this.loadSessions()
  }

  onPreviousDay() {
    const newDate = new Date(this.baseDateForSearch)
    newDate.setDate(newDate.getDate() - 1)
    this.baseDateForSearch = newDate
    this.loadSessions()
  }

  onCurrentDay() {
    this.baseDateForSearch = new Date()
    this.loadSessions()
  }

  onNextDay() {
    const newDate = new Date(this.baseDateForSearch)
    newDate.setDate(newDate.getDate() + 1)
    this.baseDateForSearch = newDate
    this.loadSessions()
  }

  loadSessions() {
    if (this.isLoadingSessions) {
      return
    }
    const from = new Date(this.baseDateForSearch)
    from.setHours(0, 0, 0)
    const to = new Date(this.baseDateForSearch)
    to.setHours(23, 59, 59)

    this.isLoadingSessions = true
    this.sessionsByUser = []
    this.analyticsService
      .list(from, to)
      .pipe(
        take(1),
        catchError(() => {
          this.isLoadingSessions = false
          return of([] as AnalyticsActionsForSession[])
        })
      )
      .subscribe((sessions) => {
        const indexByUser: { [userId: string]: number } = {}
        for (const actionsForSession of sessions) {
          const userId = actionsForSession.userId
          if (indexByUser[userId] === undefined) {
            indexByUser[userId] = this.sessionsByUser.length
            this.sessionsByUser.push({
              user: userId,
              sessions: []
            })
          }
          this.sessionsByUser[indexByUser[userId]].sessions.push(actionsForSession)
        }
        for (const sessionsForUser of this.sessionsByUser) {
          sessionsForUser.sessions.sort((s1, s2) => s1.sessionId < s2.sessionId ? -1 : 1)
        }
        this.sessionsByUser.sort((u1, u2) => u1.user < u2.user ? -1 : 1)
        this.isLoadingSessions = false
      })
  }

  getHeaderForUserSessions(
    sessionsForUser: { user: string; sessions: AnalyticsActionsForSession[] },
    index: number
  ): string {
    const totalSessions = sessionsForUser.sessions.length
    return `User #${index + 1} — ${totalSessions} ${totalSessions > 1 ? 'sessions' : 'session'} — ID ${sessionsForUser.user}`
  }

  getHeaderForSession(session: AnalyticsActionsForSession, index: number): string {
    const date = DateHelper.format(session.sessionStartDate, DateFormat.FULL_DATE)
    const from = DateHelper.format(session.sessionStartDate, DateFormat.TIME_SECONDS)
    const to = DateHelper.format(session.sessionEndDate, DateFormat.TIME_SECONDS)
    const diff = DateHelper.parseSeconds(
      DateHelper.getDifferenceOfTimeInSeconds(session.sessionStartDate, session.sessionEndDate)
    )
    return `Session #${index + 1} — le ${date} (${diff}) — de ${from} à ${to}`
  }

  getReadableAction(action: AnalyticsAction): string {
    switch (action) {
      case AnalyticsAction.__SESSION_INIT:
        return "Connexion"
      case AnalyticsAction.__SESSION_INACTIVE:
        return "Devenu inactif"
      case AnalyticsAction.READING:
        return "Lecture du site"
      case AnalyticsAction.INFOS_OPENED:
        return "A ouvert la popup `Infos pratiques`"
      case AnalyticsAction.INFOS_CLOSED:
        return "A fermé la popup `Infos pratiques`"
      case AnalyticsAction.OSTEOPATHY_OPENED:
        return "A ouvert la popup `Ostéopathie`"
      case AnalyticsAction.OSTEOPATHY_CLOSED:
        return "A fermé la popup `Ostéopathie`"
      case AnalyticsAction.SLOTS_LIST_SCROLLED_A_LOT:
        return "A beaucoup scrollé la liste des créneaux"
      case AnalyticsAction.SLOT_NEXT_CLICKED:
        return "A cliqué sur le `Prochain rendez-vous`, créneau du"
      case AnalyticsAction.SLOT_SPECIFIC_CLICKED:
        return "A cliqué sur le créneau du"
      case AnalyticsAction.APPOINTMENT_CANCELED:
        return "A annulé sa prise de rendez-vous"
      case AnalyticsAction.APPOINTMENT_LASTNAME_FILLED:
        return "A renseigné son nom de famille :"
      case AnalyticsAction.APPOINTMENT_FIRSTNAME_FILLED:
        return "A renseigné son prénom :"
      case AnalyticsAction.APPOINTMENT_PHONE_FILLED:
        return "A renseigné son téléphone :"
      case AnalyticsAction.APPOINTMENT_PATIENT_TYPE_CHANGED:
        return "A changé le type de patient :"
      case AnalyticsAction.APPOINTMENT_BOOKED:
        return "➡️ A cliqué pour réserver le créneau du"
      case AnalyticsAction.LOCATION_CLICKED:
        return "A cliqué sur le lien Maps pour voir la localisation du cabinet"
      case AnalyticsAction.PHONE_CLICKED:
        return "A cliqué sur le lien du téléphone du cabinet"
    }
    return action
  }

  getReadableData(actionData: AnalyticsActionData): string {
    if (actionData.action === AnalyticsAction.SLOT_NEXT_CLICKED || actionData.action === AnalyticsAction.SLOT_SPECIFIC_CLICKED) {
      const data: AnalyticsActionDataTypes[AnalyticsAction.SLOT_NEXT_CLICKED] = JSON.parse(actionData.data!)
      return DateHelper.format(data.date, DateFormat.DATE_TIME)
    } else if (actionData.action === AnalyticsAction.APPOINTMENT_LASTNAME_FILLED) {
      const data: AnalyticsActionDataTypes[AnalyticsAction.APPOINTMENT_LASTNAME_FILLED] = JSON.parse(actionData.data!)
      return data.lastname
    } else if (actionData.action === AnalyticsAction.APPOINTMENT_FIRSTNAME_FILLED) {
      const data: AnalyticsActionDataTypes[AnalyticsAction.APPOINTMENT_FIRSTNAME_FILLED] = JSON.parse(actionData.data!)
      return data.firstname
    } else if (actionData.action === AnalyticsAction.APPOINTMENT_PATIENT_TYPE_CHANGED) {
      const data: AnalyticsActionDataTypes[AnalyticsAction.APPOINTMENT_PATIENT_TYPE_CHANGED] = JSON.parse(actionData.data!)
      return data.patientType
    } else if (actionData.action === AnalyticsAction.APPOINTMENT_PHONE_FILLED) {
      const data: AnalyticsActionDataTypes[AnalyticsAction.APPOINTMENT_PHONE_FILLED] = JSON.parse(actionData.data!)
      return data.phone
    } else if (actionData.action === AnalyticsAction.APPOINTMENT_BOOKED) {
      const data: AnalyticsActionDataTypes[AnalyticsAction.APPOINTMENT_BOOKED] = JSON.parse(actionData.data!)
      return [
        DateHelper.format(data.date, DateFormat.DATE_TIME),
        `, patient ${data.patient} `,
        data.success ? '✅' : '🔴',
      ].join('')
    }
    return actionData.data!
  }
}
