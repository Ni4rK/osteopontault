import {Component, Input, OnInit} from "@angular/core";
import {catchError, take} from "rxjs";
import {CalendarModule} from "primeng/calendar";
import {NgClass, NgForOf, NgIf, NgStyle, NgTemplateOutlet} from "@angular/common";
import {Availability} from "@shared/types/availability.interface";
import AvailabilityService from "../../../services/availability.service";
import {FormsModule} from "@angular/forms";
import DateFormat from "@shared/types/date-format.enum";
import DateHelper from "@shared/helpers/date.helper";
import {TableModule} from "primeng/table";
import {SlotPersisted} from "@shared/types/slot.interface";
import {Practitioner} from "@shared/types/practitioner.enum";
import {AvailabilityEditComponent} from "../availability-edit/availability-edit.component";
import {HexagonComponent} from "../../_design-system/hexagon/hexagon.component";
import {AvailabilityAddComponent} from "../availability-add/availability-add.component";
import {PractitionerIconComponent} from "../../_design-system/practitioner-icon/practitioner-icon.component";
import {ProgressSpinnerModule} from "primeng/progressspinner";

@Component({
  selector: 'op-availability-list',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    CalendarModule,
    CalendarModule,
    NgForOf,
    FormsModule,
    TableModule,
    NgIf,
    AvailabilityEditComponent,
    HexagonComponent,
    NgClass,
    AvailabilityAddComponent,
    NgTemplateOutlet,
    PractitionerIconComponent,
    ProgressSpinnerModule,
    NgStyle
  ],
  templateUrl: './availability-list.component.html',
  styleUrl: './availability-list.component.scss'
})
export class AvailabilityListComponent implements OnInit {
  @Input({ required: true }) practitioner!: Practitioner

  protected readonly DateFormat = DateFormat;
  protected readonly DateHelper = DateHelper;
  protected readonly Practitioner = Practitioner;

  baseDateForSearch = new Date()
  availabilities: Availability[] = []
  isLoadingAvailabilities = false
  editingSlot: SlotPersisted | null = null
  addingAvailability = false
  baseDatesForAddingAvailability: [Date | null, Date | null] = [null, null]

  constructor(
    private readonly availabilityService: AvailabilityService
  ) {
  }

  get week(): Date[] {
    return DateHelper.getWeekFromDate(this.baseDateForSearch)
  }

  get availabilitiesPerWeekDay(): { [dayOfWeek: number]: SlotPersisted[] } {
    const availabilities: { [dayOfWeek: number]: SlotPersisted[] } = {}
    this.week.forEach((dayOfWeek) => {
      availabilities[dayOfWeek.getDay()] = []
    })
    this.availabilities.forEach((availability) => {
      const dayOfWeek = new Date(availability.date).getDay()
      availabilities[dayOfWeek].push(...availability.slots.sort((s1, s2) => s1.from < s2.from ? -1 : 1))
    })
    return availabilities
  }

  ngOnInit() {
    this.loadAvailabilities()
  }

  onAddAvailability(fromDate: string | null, toDate: string | null) {
    if (fromDate) {
      this.baseDatesForAddingAvailability[0] = new Date(fromDate)
    } else {
      this.baseDatesForAddingAvailability[0] = null
    }
    if (toDate) {
      this.baseDatesForAddingAvailability[1] = new Date(toDate)
    } else {
      this.baseDatesForAddingAvailability[1] = null
    }
    this.addingAvailability = true
  }

  onEditSlot(slot: SlotPersisted) {
    this.editingSlot = slot
  }

  onCancelEdit() {
    this.editingSlot = null
  }

  onSlotEditedOrRemoved() {
    this.editingSlot = null
    this.loadAvailabilities()
  }

  onCancelAdd() {
    this.addingAvailability = false
  }

  onAvailabilityAdded() {
    this.addingAvailability = false
    this.loadAvailabilities()
  }

  onPreviousWeek() {
    const newDate = new Date(this.baseDateForSearch)
    newDate.setDate(newDate.getDate() - 7)
    this.baseDateForSearch = newDate
    this.loadAvailabilities()
  }

  onCurrentWeek() {
    this.baseDateForSearch = new Date()
    this.loadAvailabilities()
  }

  onNextWeek() {
    const newDate = new Date(this.baseDateForSearch)
    newDate.setDate(newDate.getDate() + 7)
    this.baseDateForSearch = newDate
    this.loadAvailabilities()
  }

  loadAvailabilities() {
    if (this.isLoadingAvailabilities) {
      return
    }
    this.isLoadingAvailabilities = true
    const from = this.week[0]
    const to = new Date(from)
    to.setDate(to.getDate() + 7)
    this.availabilities = []
    this.availabilityService
      .list(from, to)
      .pipe(
        take(1),
        catchError(() => {
          this.isLoadingAvailabilities = false
          return []
        })
      )
      .subscribe((availabilities) => {
        this.isLoadingAvailabilities = false
        this.availabilities = availabilities
      })
  }

  getSlotsFromDay(dayOfWeek: Date): SlotPersisted[] {
    return this.availabilitiesPerWeekDay[dayOfWeek.getDay()]
  }

  getDefaultSlotDate(dayOfWeek: Date): Date {
    const date = new Date(dayOfWeek)
    date.setHours(12)
    date.setMinutes(0)
    date.setSeconds(0)
    date.setMilliseconds(0)
    return date
  }
}
