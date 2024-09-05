import {Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {Button} from "primeng/button";
import {SlotPersisted} from "@shared/types/slot.interface";
import {NgIf} from "@angular/common";
import DateHelper from "@shared/helpers/date.helper";
import DateFormat from "@shared/types/date-format.enum";
import {CalendarModule} from "primeng/calendar";
import {DialogModule} from "primeng/dialog";
import {DividerModule} from "primeng/divider";
import {DropdownModule} from "primeng/dropdown";
import {Footer, Header} from "primeng/api";
import {InputTextModule} from "primeng/inputtext";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Patient, PatientType} from "@shared/types/patient.interface";
import {InputOtpModule} from "primeng/inputotp";
import AvailabilityService from "../../../services/availability.service";
import {catchError, of, take} from "rxjs";
import {AppointmentForm, createAppointmentForm} from "./appointment.form";
import ToasterService from "../../../services/toaster.service";
import {PractitionerIconComponent} from "../../_design-system/practitioner-icon/practitioner-icon.component";

@Component({
  selector: 'op-appointment',
  standalone: true,
  imports: [
    Button,
    NgIf,
    CalendarModule,
    DialogModule,
    DividerModule,
    DropdownModule,
    Footer,
    Header,
    InputTextModule,
    FormsModule,
    InputOtpModule,
    ReactiveFormsModule,
    PractitionerIconComponent
  ],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.scss'
})
export class AppointmentComponent {
  @Input({ required: true }) slot!: SlotPersisted
  @Output() appointmentBooked = new EventEmitter<void>()
  @Output() cancelAppointment = new EventEmitter<void>()

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler() {
    this.cancelAppointment.emit()
  }

  protected readonly DateHelper = DateHelper
  protected readonly DateFormat = DateFormat
  protected readonly Object = Object;
  protected readonly PatientType = PatientType;

  isBookingAppointment = false
  form: AppointmentForm = createAppointmentForm()

  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly toastService: ToasterService
  ) {
  }

  get canBook(): boolean {
    return this.form.valid
  }

  onBookAppointment() {
    if (!this.isBookingAppointment && this.form.valid) {
      const patient: Patient = {
        firstname: this.form.controls.firstname.value!,
        lastname: this.form.controls.lastname.value!,
        phone: this.form.controls.phone.value!,
        type: this.form.controls.type.value!
      }
      this.isBookingAppointment = true
      this.availabilityService.book(this.slot.uid, patient).pipe(
        take(1),
        catchError(() => {
          this.isBookingAppointment = false
          return of()
        })
      ).subscribe(() => {
        this.toastService.sendToast({
          severity: "success",
          summary: "Créneau réservé !"
        })
        this.isBookingAppointment = false
        this.appointmentBooked.emit()
      })
    }
  }
}
