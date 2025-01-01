import {Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges} from "@angular/core";
import {Practitioner} from "@shared/types/practitioner.enum";
import {Footer} from "primeng/api";
import {Button} from "primeng/button";
import {CalendarModule} from "primeng/calendar";
import {DividerModule} from "primeng/divider";
import {DialogModule} from "primeng/dialog";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {PaginatorModule} from "primeng/paginator";
import DateFormat from "@shared/types/date-format.enum";
import {take} from "rxjs";
import AvailabilityService from "../../../services/availability.service";
import {NgIf} from "@angular/common";
import {SlotPersisted} from "@shared/types/slot.interface";
import {PatientType} from "@shared/types/patient.interface";
import ToasterService from "../../../services/toaster.service";
import {InputOtpModule} from "primeng/inputotp";
import {InputTextModule} from "primeng/inputtext";
import {InputSwitchModule} from "primeng/inputswitch";
import {InputPhoneComponent} from "../../_design-system/input-phone/input-phone.component";
import {createSlotForm} from "../../../forms/slot.form";

@Component({
  selector: 'op-availability-edit',
  standalone: true,
  imports: [
    Footer,
    Button,
    Button,
    Button,
    CalendarModule,
    DividerModule,
    DialogModule,
    FormsModule,
    DropdownModule,
    PaginatorModule,
    NgIf,
    InputOtpModule,
    InputTextModule,
    InputSwitchModule,
    InputPhoneComponent,
    ReactiveFormsModule
  ],
  templateUrl: './availability-edit.component.html',
  styleUrl: './availability-edit.component.scss'
})
export class AvailabilityEditComponent implements OnChanges {
  @Input({ required: true }) slot!: SlotPersisted
  @Output() slotEdited = new EventEmitter<void>()
  @Output() slotRemoved = new EventEmitter<void>()
  @Output() cancelled = new EventEmitter<void>()

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler() {
    if (this.isRemovingSlot) {
      this.onCancelRemoveSlot()
    } else {
      this.cancelled.emit()
    }
  }

  protected readonly Practitioner = Practitioner
  protected readonly DateFormat = DateFormat;
  protected readonly Object = Object
  protected readonly PatientType = PatientType;

  isEditingSlot = false
  isRemovingSlot = false
  form = createSlotForm()

  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly toastService: ToasterService
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    const slotChanges = changes['slot']
    if (slotChanges) {
      const slot = slotChanges.currentValue as SlotPersisted
      this.form.patchValue({
        from: new Date(slot.from),
        to: new Date(slot.to),
        practitioner: slot.practitioner,
        bookedAt: slot.bookedAt ? new Date(slot.bookedAt) : undefined,
        hasPatient: slot.hasPatient,
      })
      if (slot.patient) {
        this.form.controls.patient.patchValue({
          ...slot.patient
        })
      }
    }
  }

  onPhoneChanged(phone: string) {
    this.form.controls.patient.controls.phone.setValue(phone)
  }

  onHasPatientChanged() {
    if (this.form.controls.hasPatient.value) {
      this.form.controls.patient.patchValue(this.slot.patient ?? {
        firstname: "",
        lastname: "",
        phone: "0",
        type: PatientType.ADULT
      })
    }
  }

  onRemoveSlot() {
    if (this.slot.hasPatient) {
      this.isRemovingSlot = true
    } else {
      this.onConfirmRemoveSlot()
    }
  }

  onEditSlot() {
    const newSlotFrom = new Date(this.slot.from)
    const newSlotTo = new Date(this.slot.to)
    const sendNotification = !this.slot.hasPatient && !!this.form.controls.hasPatient.value
    newSlotFrom.setHours(this.form.controls.from.value!.getHours())
    newSlotFrom.setMinutes(this.form.controls.from.value!.getMinutes())
    newSlotTo.setHours(this.form.controls.to.value!.getHours())
    newSlotTo.setMinutes(this.form.controls.to.value!.getMinutes())
    this.availabilityService.edit({
      uid: this.slot.uid,
      from: newSlotFrom.toISOString(),
      to: newSlotTo.toISOString(),
      practitioner: this.form.controls.practitioner.value!,
      bookedAt: this.form.controls.bookedAt.value?.toISOString(),
      hasPatient: !!this.form.controls.hasPatient.value,
      patient: !this.form.controls.hasPatient.value ? null : {
        firstname: this.form.controls.patient.controls.firstname.value!,
        lastname: this.form.controls.patient.controls.lastname.value!,
        phone: this.form.controls.patient.controls.phone.value!,
        type: this.form.controls.patient.controls.type.value!
      }
    }, sendNotification).pipe(take(1)).subscribe(() => {
      this.toastService.sendToast({
        severity: "success",
        summary: "Créneau modifié"
      })
      this.isEditingSlot = false
      this.slotEdited.emit();
    })
  }

  onCancelRemoveSlot() {
    this.isRemovingSlot = false
  }

  onConfirmRemoveSlot() {
    this.isEditingSlot = true
    this.availabilityService.remove(this.slot).pipe(take(1)).subscribe(() => {
      this.toastService.sendToast({
        severity: "success",
        summary: "Créneau supprimé"
      })
      this.isEditingSlot = false
      this.slotRemoved.emit();
    })
  }
}
