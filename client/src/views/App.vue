<template>
  <div class="App">
    <Header
      class="App-header"
      @click-infos-menu-item="onOpenInfos"
      @click-osteopathy-menu-item="onOpenOsteopathy"
    />

    <!--  <div class="App-filter">-->
    <!--    <span class="mr-6" (click)="showAllSlots = !showAllSlots">-->
    <!--      Afficher les rendez-vous de la remplaçante :-->
    <!--    </span>-->
    <!--    <p-inputSwitch [(ngModel)]="showAllSlots"/>-->
    <!--  </div>-->

    <div class="App-content">
      <NextAppointment
        v-if="firstSlot"
        class="App-next-appointment"
        :first-slot="firstSlot"
        @slot-clicked="onSlotClicked($event, true)"
      />
      <Timeline
        class="App-timeline"
        id="timeline"
        :is-loading="!isAuthenticated || isLoadingAvailabilities"
        :availabilities="filteredAvailabilities"
        @scroll="onScroll()"
        @slot-clicked="onSlotClicked($event, false)"
      />
    </div>

    <v-btn
      v-if="showScrollTop"
      class="App-scroll_top"
      icon="mdi-arrow-up-bold"
      variant="elevated"
      color="primary"
      @click="onScrollTop()"
    />

    <v-dialog
      v-model="isInfosOpen"
      :fullscreen="isMobile"
      content-class="w-auto"
    >
      <Infos @close-it="onCloseInfos()"/>
    </v-dialog>
    <v-dialog
      v-model="isOsteopathyOpen"
      :fullscreen="isMobile"
      max-width="600"
      content-class="w-auto"
    >
      <Osteopathy @close-it="onCloseOsteopathy()"/>
    </v-dialog>
    <v-dialog
      v-model="isAppointmentOpen"
      content-class="w-auto"
      :fullscreen="isMobile"
    >
      <Appointment
        v-if="slotForAppointment"
        :slot="slotForAppointment"
        @appointment-booked="onAppointmentBooked($event)"
        @cancel-appointment="onCancelAppointment()"
      />
    </v-dialog>

    <v-dialog
      v-model="isBookingSuccessfulOpen"
      content-class="w-auto"
      :fullscreen="isMobile"
    >
      <BookingSuccessful
        v-if="slotOfBookingSuccessful"
        :slot="slotOfBookingSuccessful"
        :patient="slotOfBookingSuccessful!.patient"
        @close="onCloseBookingSuccessful()"
      />
    </v-dialog>
  </div>
</template>

<script lang="ts">
import type {Availability} from "@shared/types/availability.interface";
import type {SlotPersisted} from "@shared/types/slot.interface";
import {Component, Vue} from "vue-facing-decorator";
import Header from "@/components/_design-system/Header.vue";
import NextAppointment from "@/components/app/NextAppointment.vue";
import Timeline from "@/components/app/Timeline.vue";
import Infos from "@/components/app/Infos.vue";
import Osteopathy from "@/components/app/Osteopathy.vue";
import Appointment from "@/components/app/Appointment.vue";
import AuthenticationHttpService from "@/services/http/authentication.http-service";
import AvailabilityHttpService from "@/services/http/availability.http-service";
import ToasterService from "@/services/snackbar/toaster.service";
import {CacheService} from "@/services/cache.service";
import AnalyticsPulsarService from "@/services/analytics-pulsar.service";
import {Practitioner} from "@shared/types/practitioner.enum";
import {Role} from "@shared/types/role.enum";
import {AnalyticsAction, type AnalyticsActionDataTypes} from "@shared/types/analytics.types";
import type {Patient} from "@shared/types/patient.interface";
import {Container} from "typedi";
import Button from "@/components/_design-system/Button.vue";
import Disclaimer from "@/components/_design-system/Disclaimer.vue";
import BookingSuccessful from "@/components/app/BookingSuccessful.vue";

@Component({
  components: {BookingSuccessful, Button, Appointment, Osteopathy, Infos, Timeline, NextAppointment, Header}
})
export default class App extends Vue {
  private readonly toasterService = Container.get(ToasterService)
  private readonly authenticationHttpService = Container.get(AuthenticationHttpService)
  private readonly availabilityHttpService = Container.get(AvailabilityHttpService)
  private readonly cacheService = Container.get(CacheService)
  private readonly analyticsPulsarService = Container.get(AnalyticsPulsarService)

  showAllSlots = true
  showScrollTop = false
  availabilities: Availability[] = []
  loadAvailabilitiesInterval: number | null = null
  slotForAppointment: SlotPersisted | null = null
  slotOfBookingSuccessful: SlotPersisted | null = null

  isAuthenticated = false
  isLoadingAvailabilities = false
  isInfosOpen = false
  isOsteopathyOpen = false
  isAppointmentOpen = false
  isBookingSuccessfulOpen = false

  get isMobile(): boolean {
    return document.body.clientWidth < 800
  }

  get filteredAvailabilities(): Availability[] {
    return this.availabilities.slice()
      .map((availability) => ({
        ...availability,
        slots: availability.slots.slice().filter((slot) => {
          return (
            !slot.patient &&
            (
              this.showAllSlots ||
              slot.practitioner === Practitioner.ROSE
            )
          )
        })
      }))
      .filter((availability) => availability.slots.length > 0)
  }

  get firstSlot(): SlotPersisted | null {
    return this.filteredAvailabilities.at(0)?.slots.at(0) ?? null
  }

  async mounted() {
    this.cacheService.resetForAuthentication()
    const isAuthenticatedAsGuest = await this.authenticationHttpService.authenticate(Role.GUEST)
    const isAuthenticatedAsPractitioner = this.authenticationHttpService.isAuthenticated(Role.PRACTITIONER)
    this.isAuthenticated = isAuthenticatedAsGuest
    if (isAuthenticatedAsGuest && !isAuthenticatedAsPractitioner) {
      this.analyticsPulsarService.start()
    }
    this.loadAvailabilities()
    this.toasterService.sendToast({
      type: "info",
      timeout: 10000,
      component: Disclaimer
    })
  }

  beforeUnmount() {
    if (this.loadAvailabilitiesInterval) {
      window.clearInterval(this.loadAvailabilitiesInterval)
    }
  }

  onOpenInfos() {
    this.isInfosOpen = true
    this.analyticsPulsarService.action(AnalyticsAction.INFOS_OPENED)
  }

  onCloseInfos() {
    this.isInfosOpen = false
    this.analyticsPulsarService.action(AnalyticsAction.INFOS_CLOSED)
  }

  onOpenOsteopathy() {
    this.isOsteopathyOpen = true
    this.analyticsPulsarService.action(AnalyticsAction.OSTEOPATHY_OPENED)
  }

  onCloseOsteopathy() {
    this.isOsteopathyOpen = false
    this.analyticsPulsarService.action(AnalyticsAction.OSTEOPATHY_CLOSED)
  }

  onScroll() {
    const timeline = document.getElementById('timeline')
    if (timeline) {
      const hasShownScrollTop = this.showScrollTop
      this.showScrollTop = timeline.scrollTop > 280
      if (this.showScrollTop !== hasShownScrollTop) {
        this.analyticsPulsarService.action(AnalyticsAction.SLOTS_LIST_SCROLLED_A_LOT)
      } else {
        this.analyticsPulsarService.action(AnalyticsAction.SLOTS_LIST_SCROLLED_A_BIT)
      }
    }
  }

  onScrollTop() {
    const timeline = document.getElementById('timeline')?.parentElement
    if (timeline) {
      timeline.scrollTo(0, 0)
      this.showScrollTop = false
    }
  }

  onSlotClicked(slot: SlotPersisted, firstOne: boolean) {
    if (!slot.patient) {
      this.slotForAppointment = slot
      this.isAppointmentOpen = true

      const analyticsAction = firstOne ? AnalyticsAction.SLOT_NEXT_CLICKED : AnalyticsAction.SLOT_SPECIFIC_CLICKED
      const analyticsData: AnalyticsActionDataTypes[AnalyticsAction.SLOT_SPECIFIC_CLICKED] = {
        date: slot.from,
      }
      this.analyticsPulsarService.action(analyticsAction, analyticsData)
    }
  }

  onAppointmentBooked(data: { slot: SlotPersisted; patient: Patient }) {
    this.slotForAppointment = null
    this.isAppointmentOpen = false
    this.loadAvailabilities()

    const analyticsData: AnalyticsActionDataTypes[AnalyticsAction.APPOINTMENT_BOOKED] = {
      date: data.slot.from,
      patient: `${data.patient.firstname} ${data.patient.lastname}`,
      success: true
    }
    this.analyticsPulsarService.action(AnalyticsAction.APPOINTMENT_BOOKED, analyticsData)

    this.slotOfBookingSuccessful = data.slot
    this.isBookingSuccessfulOpen = true
    this.analyticsPulsarService.action(AnalyticsAction.BOOKING_SUCCESSFUL_OPENED)
  }

  onCancelAppointment() {
    this.slotForAppointment = null
    this.isAppointmentOpen = false
    this.loadAvailabilities()

    this.analyticsPulsarService.action(AnalyticsAction.APPOINTMENT_CANCELED)
  }

  onCloseBookingSuccessful() {
    this.slotOfBookingSuccessful = null
    this.isBookingSuccessfulOpen = false
    this.loadAvailabilities()

    this.analyticsPulsarService.action(AnalyticsAction.BOOKING_SUCCESSFUL_CLOSED)
  }

  async loadAvailabilities() {
    if (!this.isLoadingAvailabilities) {
      this.isLoadingAvailabilities = true
      try {
        this.availabilities = await this.availabilityHttpService.list(new Date())
      } catch {
        this.toasterService.sendToast({
          type: "error",
          message: "Impossible de récupérer les créneaux",
        })
      } finally {
        this.isLoadingAvailabilities = false
      }
    }
  }
}
</script>

<style lang="scss">
.App {
  display: flex;
  flex-direction: column;
  height: 100vh;

  &-header {
    flex-grow: 1;
    flex-shrink: 0;
    margin-bottom: 2rem;
    @media (max-width: 1100px) {
      margin-bottom: 1rem;
    }
  }

  &-next-appointment {
    flex-grow: 1;
    flex-shrink: 0;
    margin: auto;
    margin-bottom: 3rem;
    @media (max-width: 1100px) {
      margin-bottom: 1rem;
    }
  }

  &-filter {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 3rem;
    cursor: pointer;
  }

  &-content {
    height: 100%;
    overflow: auto;
  }

  &-timeline {
    flex-grow: 0;
    flex-shrink: 1;
  }

  &-scroll_top {
    position: fixed;
    bottom: 1rem;
    right: 2rem;
    @media (max-width: 1100px) {
      bottom: 1px;
      right: 1px;
    }
  }
}
</style>
