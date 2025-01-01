import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {HeaderComponent} from "../_design-system/header/header.component";
import {TimelineComponent} from "./timeline/timeline.component";
import {Button} from "primeng/button";
import {Availability} from "@shared/types/availability.interface";
import {Practitioner} from "@shared/types/practitioner.enum";
import {NgIf} from "@angular/common";
import {InputSwitchModule} from "primeng/inputswitch";
import {FormsModule} from "@angular/forms";
import {NextAppointmentComponent} from "./next-appointment/next-appointment.component";
import {DialogModule} from "primeng/dialog";
import AuthenticationService from "../../services/authentication.service";
import {Role} from "@shared/types/role.enum";
import {catchError, take} from "rxjs";
import AvailabilityService from "../../services/availability.service";
import {InfosComponent} from "./infos/infos.component";
import {OsteopathyComponent} from "./osteopathy/osteopathy.component";
import {SlotPersisted} from "@shared/types/slot.interface";
import {AppointmentComponent} from "./appointment/appointment.component";
import {ToasterComponent} from "../_design-system/toaster/toaster.component";
import ToasterService from "../../services/toaster.service";
import {CacheService} from "../../services/cache.service";
import {ROSE_PHONE} from "../../utils/constants";
import AnalyticsPulsar from "./analytics.pulsar";
import {AnalyticsAction, AnalyticsActionDataTypes} from "@shared/types/analytics.types";
import {Patient} from "@shared/types/patient.interface";
import PhoneHelper from "@shared/helpers/phone.helper";

@Component({
  selector: 'op-app',
  standalone: true,
  imports: [
    HeaderComponent,
    NextAppointmentComponent,
    TimelineComponent,
    Button,
    Button,
    Button,
    InputSwitchModule,
    DialogModule,
    NgIf,
    FormsModule,
    RouterOutlet,
    InfosComponent,
    OsteopathyComponent,
    AppointmentComponent,
    ToasterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'client'
  showAllSlots = true
  showScrollTop = false
  availabilities: Availability[] = []
  loadAvailabilitiesInterval: number | null = null
  slotForAppointment: SlotPersisted | null = null

  isLoadingAvailabilities = false
  isInfosOpen = false
  isOsteopathyOpen = false

  constructor(
    private readonly toasterService: ToasterService,
    private readonly authenticationService: AuthenticationService,
    private readonly availabilityService: AvailabilityService,
    private readonly cacheService: CacheService,
    private readonly analyticsPulsar: AnalyticsPulsar
  ) {
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

  ngOnInit() {
    this.cacheService.resetForAuthentication()
    this.authenticationService.authenticate(Role.GUEST)
      .pipe(take(1))
      .subscribe(isAuthenticatedAsGuest => {
        const isAuthenticatedAsPractitioner = this.authenticationService.isAuthenticated(Role.PRACTITIONER)
        if (isAuthenticatedAsGuest && !isAuthenticatedAsPractitioner) {
          this.analyticsPulsar.start()
        }
        this.loadAvailabilities()
      })
    this.toasterService.sendToast({
      severity: "success",
      summary: `Pour toute demande urgente, n'hésitez pas à appeler le ${PhoneHelper.toReadableNumber(ROSE_PHONE)}`,
      sticky: true
    })
  }

  ngOnDestroy() {
    if (this.loadAvailabilitiesInterval) {
      window.clearInterval(this.loadAvailabilitiesInterval)
    }
  }

  onOpenInfos() {
    this.isInfosOpen = true
    this.analyticsPulsar.action(AnalyticsAction.INFOS_OPENED)
  }

  onCloseInfos() {
    this.isInfosOpen = false
    this.analyticsPulsar.action(AnalyticsAction.INFOS_CLOSED)
  }

  onOpenOsteopathy() {
    this.isOsteopathyOpen = true
    this.analyticsPulsar.action(AnalyticsAction.OSTEOPATHY_OPENED)
  }

  onCloseOsteopathy() {
    this.isOsteopathyOpen = false
    this.analyticsPulsar.action(AnalyticsAction.OSTEOPATHY_CLOSED)
  }

  onScroll() {
    const timeline = document.getElementById('timeline')
    if (timeline) {
      const hasShownScrollTop = this.showScrollTop
      this.showScrollTop = timeline.scrollTop > 280
      if (this.showScrollTop !== hasShownScrollTop) {
        this.analyticsPulsar.action(AnalyticsAction.SLOTS_LIST_SCROLLED_A_LOT)
      } else {
        this.analyticsPulsar.action(AnalyticsAction.SLOTS_LIST_SCROLLED_A_BIT)
      }
    }
  }

  onScrollTop() {
    const timeline = document.getElementById('timeline')
    if (timeline) {
      timeline.scrollTo(0, 0)
      this.showScrollTop = false
    }
  }

  onSlotClicked(slot: SlotPersisted, firstOne: boolean) {
    if (!slot.patient) {
      this.slotForAppointment = slot

      const analyticsAction = firstOne ? AnalyticsAction.SLOT_NEXT_CLICKED : AnalyticsAction.SLOT_SPECIFIC_CLICKED
      const analyticsData: AnalyticsActionDataTypes[AnalyticsAction.SLOT_SPECIFIC_CLICKED] = {
        date: slot.from,
      }
      this.analyticsPulsar.action(analyticsAction, analyticsData)
    }
  }

  onAppointmentBooked(data: { slot: SlotPersisted; patient: Patient }) {
    this.slotForAppointment = null
    this.loadAvailabilities()

    const analyticsData: AnalyticsActionDataTypes[AnalyticsAction.APPOINTMENT_BOOKED] = {
      date: data.slot.from,
      patient: `${data.patient.firstname} ${data.patient.lastname}`,
      success: true
    }
    this.analyticsPulsar.action(AnalyticsAction.APPOINTMENT_BOOKED, analyticsData)
  }

  onCancelAppointment() {
    this.slotForAppointment = null
    this.loadAvailabilities()

    this.analyticsPulsar.action(AnalyticsAction.APPOINTMENT_CANCELED)
  }

  loadAvailabilities() {
    if (!this.isLoadingAvailabilities) {
      this.isLoadingAvailabilities = true
      this.availabilityService.list(new Date()).pipe(
        take(1),
        catchError(() => {
          this.isLoadingAvailabilities = false
          return []
        })
      ).subscribe((availabilities) => {
        this.isLoadingAvailabilities = false
        this.availabilities = availabilities;
      })
    }
  }
}
