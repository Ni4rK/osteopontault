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
import ToasterService from "../../../services/toaster.service";
import {isDate} from "@shared/helpers/common-types.guards";

@Component({
  selector: 'op-availability-add',
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
    NgIf
  ],
  templateUrl: './availability-add.component.html',
  styleUrl: './availability-add.component.scss'
})
export class AvailabilityAddComponent implements OnChanges {
  @Input({ required: true }) practitioner!: Practitioner
  @Input({ required: true }) baseDates!: [Date | null, Date | null]
  @Output() availabilityAdded = new EventEmitter<void>()
  @Output() cancelAddingAvailability = new EventEmitter<void>()

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler() {
    this.cancelAddingAvailability.emit()
  }

  protected readonly Practitioner = Practitioner
  protected readonly DateFormat = DateFormat;
  protected readonly Object = Object

  DEFAULT_STEP_TIME = 45

  isAddingAvailability = false
  newAvailability = {
    date: new Date(),
    practitioner: Practitioner.ROSE as Practitioner,
    stepTime: this.DEFAULT_STEP_TIME, // in minutes
    howMany: 5, // slots counter
  }

  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly toastService: ToasterService
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['baseDates']) {
      const from = changes['baseDates'].currentValue[0]
      const to = changes['baseDates'].currentValue[1]
      if (!isDate(from) && isDate(to)) {
        const toDate = new Date(to)
        toDate.setTime(to.getTime() - this.DEFAULT_STEP_TIME * 60 * 1000)
        this.newAvailability.howMany = 1
        this.newAvailability.date = toDate
      } else if (isDate(from) && !isDate(to)) {
        this.newAvailability.howMany = 5
        this.newAvailability.date = from
      } else if (isDate(from) && isDate(to)) {
        this.newAvailability.howMany = Math.floor((to.getTime() - from.getTime()) / (this.DEFAULT_STEP_TIME * 60 * 1000))
        this.newAvailability.date = from
      } else if (!isDate(from) && !isDate(to)) {
        const date = new Date()
        date.setHours(date.getHours() + 1)
        date.setMinutes(0)
        this.newAvailability.howMany = 5
        this.newAvailability.date = date
      }
    }
  }

  onAddAvailability() {
    this.isAddingAvailability = true
    this.availabilityService.create(
      this.newAvailability.practitioner,
      this.newAvailability.date,
      this.newAvailability.stepTime,
      this.newAvailability.howMany
    ).pipe(
      take(1)
    ).subscribe(() => {
      this.toastService.sendToast({
        severity: "success",
        summary: "Disponibilité ajoutée"
      })
      this.isAddingAvailability = false
      this.availabilityAdded.emit()
    })
  }
}
