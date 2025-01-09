<template>
  <div class="AvailabilityList-filter">
    <v-btn
      color="primary"
      size="small"
      icon="mdi-arrow-left"
      @click="onPreviousWeek()"
    />
    <Button :outlined="true" @click="onCurrentWeek()">
      Semaine : {{ DateHelper.format(week[0], DateFormat.SHORT_DATE_API) }}
    </Button>
    <v-btn
      color="primary"
      size="small"
      icon="mdi-arrow-right"
      @click="onNextWeek()"
    />
  </div>

  <v-dialog
    v-model="editingSlot"
    max-width="600"
    content-class="w-auto"
    :fullscreen="isMobile"
    :scrollable="isMobile"
  >
    <AvailabilityEdit
      :practitioner="practitioner"
      :slot="slotToBeEdited"
      @cancelled="onCancelEdit()"
      @slot-edited="onSlotEditedOrRemoved()"
      @slot-removed="onSlotEditedOrRemoved()"
    />
  </v-dialog>

  <v-dialog
    v-model="addingAvailability"
    max-width="600"
    content-class="w-auto"
    :fullscreen="isMobile"
    :scrollable="isMobile"
  >
    <AvailabilityAdd
      :practitioner="practitioner"
      :base-dates="baseDatesForAddingAvailability"
      @cancel-adding-availability="onCancelAdd()"
      @availability-added="onAvailabilityAdded()"
    />
  </v-dialog>


  <!-- //////////////////////////////////////////////////////////////////////////////////////////////////// -->
  <!-- ////////////////////////////////////////// FOR MOBILE VIEW  //////////////////////////////////////// -->
  <!-- //////////////////////////////////////////////////////////////////////////////////////////////////// -->
  <div
    v-if="isMobile"
    class="AvailabilityListMobile-container"
  >
    <div class="AvailabilityListMobile-calendar">
      <div class="AvailabilityListMobile-calendar-days">
        <div v-for="dayOfWeek of week" class="AvailabilityListMobile-calendar-days-item">
          {{ DateHelper.format(dayOfWeek, DateFormat.MEDIUM_DATE) }}
        </div>
        <div class="AvailabilityListMobile-calendar-days-scrollbar"></div>
      </div>

      <div class="AvailabilityListMobile-calendar-week">
        <div class="AvailabilityListMobile-calendar-week-container" ref="gridMobileComponent" tabindex="0">
          <div v-for="dayOfWeek of week" class="AvailabilityListMobile-calendar-week-day">
            <div class="AvailabilityListMobile-calendar-week-day-hours">
              <div v-for="hour of hours" class="AvailabilityListMobile-calendar-week-day-hours-item">
                {{ hour }} h
              </div>
            </div>
            <div class="AvailabilityListMobile-calendar-week-day-grid">
              <div v-for="_ of hours" class="AvailabilityListMobile-calendar-week-day-grid-hour"></div>
              <v-progress-circular v-if="isLoadingAvailabilities" indeterminate/>
              <AvailabilityListSlotsForDay
                :day-of-week="dayOfWeek"
                :slots-for-day="getSlotsFromDay(dayOfWeek)"
                @edit-slot="onEditSlot($event)"
                @add-availability="onAddAvailability($event)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


  <!-- //////////////////////////////////////////////////////////////////////////////////////////////////// -->
  <!-- ////////////////////////////////////////// FOR DESKTOP VIEW  //////////////////////////////////////// -->
  <!-- //////////////////////////////////////////////////////////////////////////////////////////////////// -->
  <div v-if="!isMobile" class="AvailabilityListDesktop-calendar">
    <div class="AvailabilityListDesktop-calendar-days">
      <div class="AvailabilityListDesktop-calendar-days-hours"><!-- Top of column --></div>
      <v-progress-circular
        v-if="isLoadingAvailabilities"
        class="position-absolute top-40p left-49p"
        color="primary"
        indeterminate
      />
      <div v-for="dayOfWeek of week" class="AvailabilityListDesktop-calendar-days-item">
        {{ DateHelper.format(dayOfWeek, DateFormat.MEDIUM_DATE) }}
      </div>
      <div class="AvailabilityListDesktop-calendar-days-scrollbar"></div>
    </div>

    <div class="AvailabilityListDesktop-calendar-week">
      <div class="AvailabilityListDesktop-calendar-week-hours">
        <div v-for="hour of hours" class="AvailabilityListDesktop-calendar-week-hours-item">
          {{ hour }} h
        </div>
      </div>

      <div class="AvailabilityListDesktop-calendar-week-grid" ref="gridDesktopComponent" tabindex="0">
        <div v-for="dayOfWeek of week" class="AvailabilityListDesktop-calendar-week-grid-day">
          <div v-for="_ of hours" class="AvailabilityListDesktop-calendar-week-grid-day-hour"></div>
          <AvailabilityListSlotsForDay
            :day-of-week="dayOfWeek"
            :slots-for-day="getSlotsFromDay(dayOfWeek)"
            @edit-slot="onEditSlot($event)"
            @add-availability="onAddAvailability($event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Ref, Vue} from "vue-facing-decorator";
import {Practitioner} from "@shared/types/practitioner.enum";
import {Container} from "typedi";
import AvailabilityHttpService from "@/services/http/availability.http-service";
import type {Availability} from "@shared/types/availability.interface";
import type {SlotPersisted} from "@shared/types/slot.interface";
import DateFormat from "@shared/types/date-format.enum";
import DateHelper from "@shared/helpers/date.helper";
import AvailabilityListSlotsForDay from "@/components/admin/AvailabilityListSlotsForDay.vue";
import AvailabilityAdd from "@/components/admin/AvailabilityAdd.vue";
import AvailabilityEdit from "@/components/admin/AvailabilityEdit.vue";
import Button from "@/components/_design-system/Button.vue";
import ToasterService from "@/services/snackbar/toaster.service";

@Component({
  components: {Button, AvailabilityEdit, AvailabilityAdd, AvailabilityListSlotsForDay}
})
export default class AvailabilityListComponent extends Vue {
  @Prop({required: true}) practitioner!: Practitioner
  @Ref("gridDesktopComponent") gridDesktopComponent!: HTMLElement
  @Ref("gridMobileComponent") gridMobileComponent!: HTMLElement

  private readonly availabilityService = Container.get(AvailabilityHttpService)
  private readonly toasterService = Container.get(ToasterService)

  readonly DateFormat = DateFormat
  readonly DateHelper = DateHelper
  readonly Practitioner = Practitioner

  baseDateForSearch = new Date()
  availabilities: Availability[] = []
  isLoadingAvailabilities = false
  slotToBeEdited: SlotPersisted | null = null
  addingAvailability = false
  baseDatesForAddingAvailability: [Date | null, Date | null] = [null, null]

  get isMobile(): boolean {
    return document.body.clientWidth < 800
  }

  get hours(): number[] {
    return new Array<number>(24).fill(0).map((_, index) => index)
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

  get editingSlot(): boolean {
    return this.slotToBeEdited !== null
  }

  mounted() {
    this.loadAvailabilities()
  }

  onAddAvailability({ fromDate, toDate }: { fromDate: string, toDate: string }) {
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
    this.slotToBeEdited = slot
  }

  onCancelEdit() {
    this.slotToBeEdited = null
  }

  onSlotEditedOrRemoved() {
    this.slotToBeEdited = null
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
    this.focusGrid()
  }

  onCurrentWeek() {
    this.baseDateForSearch = new Date()
    this.loadAvailabilities()
    this.focusGrid()
  }

  onNextWeek() {
    const newDate = new Date(this.baseDateForSearch)
    newDate.setDate(newDate.getDate() + 7)
    this.baseDateForSearch = newDate
    this.loadAvailabilities()
    this.focusGrid()
  }

  async loadAvailabilities() {
    if (this.isLoadingAvailabilities) {
      return
    }
    this.isLoadingAvailabilities = true
    const from = this.week[0]
    const to = new Date(from)
    to.setDate(to.getDate() + 7)
    this.availabilities = []

    try {
      this.availabilities = await this.availabilityService.list(from, to)
      this.scrollToMidday()
    } catch {
      this.toasterService.sendToast({
        type: "error",
        message: "Impossible de récupérer les créneaux",
      })
    } finally {
      this.isLoadingAvailabilities = false
    }
  }

  getSlotsFromDay(dayOfWeek: Date): SlotPersisted[] {
    return this.availabilitiesPerWeekDay[dayOfWeek.getDay()]
  }

  focusGrid() {
    if (this.isMobile) {
      this.gridMobileComponent.focus()
    } else {
      this.gridDesktopComponent.focus()
    }
  }

  scrollToMidday() {
    if (!this.isMobile) {
      this.gridDesktopComponent.parentElement?.scrollTo(0, 60 * 11)
    }
  }
}
</script>
