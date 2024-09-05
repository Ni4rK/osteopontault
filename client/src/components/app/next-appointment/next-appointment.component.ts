import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Button} from "primeng/button";
import {Slot, SlotPersisted} from "@shared/types/slot.interface";
import {NgIf} from "@angular/common";
import DateHelper from "@shared/helpers/date.helper";
import DateFormat from "@shared/types/date-format.enum";

@Component({
  selector: 'op-next-appointment',
  standalone: true,
  imports: [
    Button,
    NgIf
  ],
  templateUrl: './next-appointment.component.html',
  styleUrl: './next-appointment.component.scss'
})
export class NextAppointmentComponent {
  @Input({ required: true }) firstSlot!: SlotPersisted
  @Output() slotClicked = new EventEmitter<SlotPersisted>()

  protected readonly DateHelper = DateHelper
  protected readonly DateFormat = DateFormat

  onSlotClicked() {
    if (this.firstSlot) {
      this.slotClicked.emit(this.firstSlot)
    }
  }
}
