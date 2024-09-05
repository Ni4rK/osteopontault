import {Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges} from "@angular/core";
import {Practitioner} from "@shared/types/practitioner.enum";
import {Footer} from "primeng/api";
import {Button} from "primeng/button";
import {CalendarModule} from "primeng/calendar";
import {DividerModule} from "primeng/divider";
import {DialogModule} from "primeng/dialog";
import {FormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {PaginatorModule} from "primeng/paginator";
import DateFormat from "@shared/types/date-format.enum";
import {take} from "rxjs";
import AvailabilityService from "../../../services/availability.service";
import {NgIf} from "@angular/common";
import {SlotPersisted} from "@shared/types/slot.interface";
import {Patient, PatientType} from "@shared/types/patient.interface";
import ToasterService from "../../../services/toaster.service";
import {InputOtpModule} from "primeng/inputotp";
import {InputTextModule} from "primeng/inputtext";
import {InputSwitchModule} from "primeng/inputswitch";

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
    InputSwitchModule
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
  editedSlot = {
    from: new Date(),
    to: new Date(),
    practitioner: Practitioner.ROSE,
    bookedAt: undefined as Date | undefined,
    hasPatient: false,
    patient: null as Patient | null
  }

  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly toastService: ToasterService
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    const slotChanges = changes['slot']
    if (slotChanges) {
      const slot = slotChanges.currentValue as SlotPersisted
      this.editedSlot = {
        from: new Date(slot.from),
        to: new Date(slot.to),
        practitioner: slot.practitioner,
        bookedAt: slot.bookedAt ? new Date(slot.bookedAt) : undefined,
        hasPatient: slot.patient !== null,
        patient: slot.patient
      }
    }
  }

  onHasPatientChanged() {
    if (this.editedSlot.hasPatient) {
      this.editedSlot.patient = this.slot.patient ?? {
        firstname: "",
        lastname: "",
        phone: "0",
        type: PatientType.ADULT
      }
    } else {
      this.editedSlot.patient = null
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
    newSlotFrom.setHours(this.editedSlot.from.getHours())
    newSlotFrom.setMinutes(this.editedSlot.from.getMinutes())
    newSlotTo.setHours(this.editedSlot.to.getHours())
    newSlotTo.setMinutes(this.editedSlot.to.getMinutes())
    this.availabilityService.edit({
      uid: this.slot.uid,
      from: newSlotFrom.toISOString(),
      to: newSlotTo.toISOString(),
      practitioner: this.editedSlot.practitioner,
      bookedAt: this.editedSlot.bookedAt ? this.editedSlot.bookedAt.toISOString() : undefined,
      hasPatient: this.editedSlot.hasPatient,
      patient: this.editedSlot.hasPatient ? this.editedSlot.patient : null
    }).pipe(take(1)).subscribe(() => {
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
