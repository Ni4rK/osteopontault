import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {HeaderComponent} from "../_shared/header/header.component";
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
import {catchError, switchMap, take} from "rxjs";
import AvailabilityService from "../../services/availability.service";
import {InfosComponent} from "./infos/infos.component";
import {OsteopathyComponent} from "./osteopathy/osteopathy.component";
import {SlotPersisted} from "@shared/types/slot.interface";
import {AppointmentComponent} from "./appointment/appointment.component";
import {ToasterComponent} from "../_shared/toaster/toaster.component";
import ToasterService from "../../services/toaster.service";

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
    private readonly availabilityService: AvailabilityService
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
    // this.loadAvailabilitiesInterval = window.setInterval(() => this.loadAvailabilities(), 10000)
    this.loadAvailabilities()
  }

  ngOnDestroy() {
    if (this.loadAvailabilitiesInterval) {
      window.clearInterval(this.loadAvailabilitiesInterval)
    }
  }

  onScroll() {
    const timeline = document.getElementById('timeline')
    if (timeline) {
      this.showScrollTop = timeline.scrollTop > 280
    }
  }

  onScrollTop() {
    const timeline = document.getElementById('timeline')
    if (timeline) {
      timeline.scrollTo(0, 0)
      this.showScrollTop = false
    }
  }

  onSlotClicked(slot: SlotPersisted) {
    if (!slot.patient) {
      this.slotForAppointment = slot
    }
  }

  onAppointmentBooked() {
    this.slotForAppointment = null
    this.loadAvailabilities()
  }

  onCancelAppointment() {
    this.slotForAppointment = null
  }

  loadAvailabilities() {
    if (!this.isLoadingAvailabilities) {
      this.isLoadingAvailabilities = true
      this.authenticationService.authenticate(Role.GUEST).pipe(
        switchMap(() => this.availabilityService.list(new Date())),
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
