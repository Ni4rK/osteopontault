<template>
  <div class="Sessions-navigation">
    <v-btn
      color="primary"
      size="small"
      icon="mdi-arrow-left"
      @click="onPreviousDay()"
    />
    <Button :outlined="true" @click="onCurrentDay()">
      Jour : {{ DateHelper.format(baseDateForSearch, DateFormat.FULL_DATE) }}
    </Button>
    <v-btn
      color="primary"
      size="small"
      icon="mdi-arrow-right"
      @click="onNextDay()"
    />
  </div>

  <div class="Sessions-list">
    <v-progress-circular
      v-if="isLoadingSessions"
      class="position-fixed top-40p left-49p"
      color="primary"
      indeterminate
    />

    <h4 v-if="!isLoadingSessions && !sessionsByUser.length" style="text-align: center">
      Aucune activité ce jour
    </h4>

    <v-expansion-panels
      v-if="!isLoadingSessions"
      style="width: 100%"
    >
      <v-expansion-panel
        v-for="(sessionsForUser, index) of sessionsByUser"
        :title="getHeaderForUserSessions(sessionsForUser, index)"
        class="Sessions-item"
        color="primary"
        rounded="lg"
      >
        <template v-slot:text>
          <v-expansion-panels>
            <v-expansion-panel
              v-for="(session, index) of sessionsForUser.sessions"
              :title="getHeaderForSession(session, index)"
              class="Sessions-item-actions"
              rounded="lg"
              color="grey"
            >
              <template v-slot:text>
                <div v-for="actionData of session.actions" class="Sessions-action">
                  <span class="Sessions-action-time">{{ DateHelper.format(actionData.date, DateFormat.TIME_SECONDS) }}</span>
                  <span class="Sessions-action-text">{{ getReadableAction(actionData.action) }}</span>
                  <span v-if="actionData.data && actionData.data.length">&nbsp;{{ getReadableData(actionData) }}</span>
                </div>
              </template>
            </v-expansion-panel>
          </v-expansion-panels>
        </template>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-facing-decorator";
import DateFormat from "@shared/types/date-format.enum";
import DateHelper from "@shared/helpers/date.helper";
import {
  AnalyticsAction,
  type AnalyticsActionData,
  type AnalyticsActionDataTypes,
  type AnalyticsActionsForSession
} from "@shared/types/analytics.types";
import {Container} from "typedi";
import AnalyticsHttpService from "@/services/http/analytics.http-service";
import Button from "@/components/_design-system/Button.vue";
import ToasterService from "@/services/snackbar/toaster.service";

@Component({
  components: {Button}
})
export default class SessionsList extends Vue {
  private readonly analyticsService = Container.get(AnalyticsHttpService)
  private readonly toasterService = Container.get(ToasterService)

  readonly DateFormat = DateFormat
  readonly DateHelper = DateHelper

  isLoadingSessions = false
  baseDateForSearch = new Date()
  sessionsByUser: Array<{
    user: string
    sessions: AnalyticsActionsForSession[]
  }> = []

  mounted() {
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

  async loadSessions() {
    if (this.isLoadingSessions) {
      return
    }
    const from = new Date(this.baseDateForSearch)
    from.setHours(0, 0, 0)
    const to = new Date(this.baseDateForSearch)
    to.setHours(23, 59, 59)

    this.isLoadingSessions = true
    this.sessionsByUser = []

    try {
      const sessions = await this.analyticsService.list(from, to)
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
    } catch {
      this.toasterService.sendToast({
        type: "error",
        message: "Impossible de récupérer les sessions",
      })
    } finally {
      this.isLoadingSessions = false
    }

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
</script>

<style lang="scss">
$listWidthLargeScreen: calc(100vw - 2 * 3rem); // total viewport width - 2 * admin container padding
$listHeight: calc(100vh - 70px - 2 * 1rem - 42px - 3rem - 42px - 5px); // total viewport height - header - admin container padding - filter height - filter margin bottom - scroll top size

.Sessions {
  position: relative;

  &-navigation {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 3rem;
  }

  &-list {
    display: flex;
    flex-direction: column;
    height: $listHeight;
    border: 1px solid white;
    border-radius: 1rem;
    background: white;
    overflow: auto;
    padding: 1rem;
    @media (min-width: 1100px) {
      width: $listWidthLargeScreen;
    }
  }

  &-item {
    display: block;
    margin-bottom: 1rem;

    ::ng-deep .p-accordion-header-link, .p-accordion-content {
      background: var(--primary-color);
      color: white;
    }

    &-actions {
      display: block;
      margin-bottom: 1rem;
    }
  }

  &-action {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;

    &-time {
      font-weight: bold;
      flex-basis: 10%;
      min-width: 100px;
    }
  }
}
</style>
