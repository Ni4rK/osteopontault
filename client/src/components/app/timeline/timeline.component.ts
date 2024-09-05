import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {TimelineModule} from "primeng/timeline";
import {HexagonComponent} from "../../_design-system/hexagon/hexagon.component";
import {Availability} from "@shared/types/availability.interface";
import {Button} from "primeng/button";
import {Practitioner} from "@shared/types/practitioner.enum";
import DateHelper from "@shared/helpers/date.helper";
import DateFormat from "@shared/types/date-format.enum";
import {SlotPersisted} from "@shared/types/slot.interface";
import {PractitionerIconComponent} from "../../_design-system/practitioner-icon/practitioner-icon.component";
import {SkeletonModule} from "primeng/skeleton";

@Component({
  selector: 'op-timeline',
  standalone: true,
  imports: [
    NgStyle,
    TimelineModule,
    HexagonComponent,
    Button,
    NgForOf,
    NgIf,
    NgClass,
    PractitionerIconComponent,
    SkeletonModule
  ],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss'
})
export class TimelineComponent {
  @Input({ required: true }) isLoading!: boolean
  @Input() availabilities!: Availability[]
  @Output() slotClicked = new EventEmitter<SlotPersisted>()

  protected readonly Practitioner = Practitioner
  protected readonly DateHelper = DateHelper
  protected readonly DateFormat = DateFormat

  loaders = new Array<null>(5).fill(null)
  loadingSlots = new Array<null>(5).fill(null)

  onSlotClick(slot: SlotPersisted) {
    this.slotClicked.emit(slot)
  }
}
