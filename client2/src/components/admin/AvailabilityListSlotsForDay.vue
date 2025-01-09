<template>
  <!-- //////////////////////////////////////////////////////////////////////////////////////////////////// -->
  <!-- /////////////////////////////// TEMPLATE for slots list in a specific day ////////////////////////// -->
  <!-- //////////////////////////////////////////////////////////////////////////////////////////////////// -->
  <!-- Empty day -->
  <template v-if="slotsForDay.length === 0">
    <div
      class="AvailabilityList-slot empty cursor-pointer"
      :class="getCssClassesForEmptyDay()"
      @click="onAddAvailabilityFromSlot(null)"
    ></div>
  </template>

  <template v-else>
    <!-- Firsts creation-slots -->
    <template v-for="creationSlotData of firstsCreationSlotsData">
      <AvailabilityListSlot
        :slot="null"
        :from="creationSlotData.from"
        :to="creationSlotData.to"
        :diff="creationSlotData.diff"
        :visible="false"
        @add-availability="onAddAvailabilityFromSlotData(creationSlotData)"
      />
    </template>

    <template v-for="(slot, index) of slotsForDay">
      <!-- Actual created-slot -->
      <AvailabilityListSlot
        :slot="slot"
        :from="slot.from"
        :to="slot.to"
        :diff="DateHelper.getDifferenceOfTimeInMinutes(slot.from, slot.to)"
        :visible="true"
        @edit-slot="editSlot(slot)"
      />

      <!-- In-between creation-slots -->
      <template v-if="index >= 0 && index < slotsForDay.length - 1">
        <template v-for="creationSlotData of getCreationSlotsDataFor(slot.from, slotsForDay[index].to, slotsForDay[index + 1].from)">
          <AvailabilityListSlot
            :slot="null"
            :from="creationSlotData.from"
            :to="creationSlotData.to"
            :diff="creationSlotData.diff"
            :visible="true"
            @edit-slot="editSlot(slot)"
            @add-availability="onAddAvailabilityFromSlotData(creationSlotData)"
          />
        </template>
      </template>

      <!-- Lasts creation-slots -->
      <template v-for="creationSlotData of lastsCreationSlotsData">
        <AvailabilityListSlot
          :slot="null"
          :from="creationSlotData.from"
          :to="creationSlotData.to"
          :diff="creationSlotData.diff"
          :visible="false"
          @add-availability="onAddAvailabilityFromSlotData(creationSlotData)"
        />
      </template>
    </template>
  </template>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue} from "vue-facing-decorator";
import IconPractitioner from "@/components/_design-system/IconPractitioner.vue";
import type {SlotPersisted} from "@shared/types/slot.interface";
import DateHelper from "@shared/helpers/date.helper";
import DateFormat from "@shared/types/date-format.enum";
import AvailabilityListSlot from "@/components/admin/AvailabilityListSlot.vue";
import {DEFAULT_SLOT_DURATION} from "@/utils/global.constants";

@Component({
  components: {AvailabilityListSlot, IconPractitioner}
})
export default class AvailabilityListSlotsForDay extends Vue {
  @Prop({required: true}) dayOfWeek!: Date
  @Prop({required: true}) slotsForDay!: SlotPersisted[]

  @Emit() editSlot(slot: SlotPersisted) {
    return slot
  }

  @Emit() addAvailability(dates: { fromDate: string | null , toDate: string | null }) {
    return dates
  }

  readonly DateHelper = DateHelper
  readonly DateFormat = DateFormat

  get firstsCreationSlotsData(): Array<{ from: string, to: string, diff: number }> {
    return this.getCreationSlotsDataFor(
      this.dayOfWeek,
      null,
      this.slotsForDay.length ? this.slotsForDay[0].from : null
    )
  }

  get lastsCreationSlotsData(): Array<{ from: string, to: string, diff: number }> {
    return this.slotsForDay.length
      ? this.getCreationSlotsDataFor(this.dayOfWeek, this.slotsForDay[this.slotsForDay.length - 1].to, null)
      : []
  }

  onAddAvailabilityFromSlot(slot: SlotPersisted | null) {
    this.addAvailability({
      fromDate: slot?.from ?? this.getDefaultSlotDate(this.dayOfWeek),
      toDate: slot?.to ?? null,
    })
  }

  onAddAvailabilityFromSlotData(slotData: { from: string, to: string, diff: number }) {
    this.addAvailability({
      fromDate: slotData.from,
      toDate: slotData.to
    })
  }

  getCreationSlotsDataFor(
    base: Date | string,
    from: string | null,
    to: string | null
  ): Array<{ from: string, to: string, diff: number }> {
    const start: Date = from ? new Date(from) : new Date(base)
    const end = to ? new Date(to) : new Date(base)
    const creationSlotsData: Array<{
      from: string
      to: string
      diff: number
    }> = []

    if (!from) {
      start.setHours(8, 0, 0, 0)
    }
    if (!to) {
      end.setHours(23, 0, 0, 0)
    }

    if (!to) {
      for (let time = start.getTime(); time < end.getTime(); time += DEFAULT_SLOT_DURATION * 60 * 1000) {
        const creationFromTime = time
        const creationToTime = Math.min(
          time + DEFAULT_SLOT_DURATION * 60 * 1000,
          end.getTime()
        )
        creationSlotsData.push({
          from: new Date(creationFromTime).toISOString(),
          to: new Date(creationToTime).toISOString(),
          diff: Math.floor((creationToTime - creationFromTime) / (60 * 1000))
        })
      }
      return creationSlotsData
    }

    for (let time = end.getTime(); time > start.getTime(); time -= DEFAULT_SLOT_DURATION * 60 * 1000) {
      const creationToTime = time
      const creationFromTime = Math.max(
        time - DEFAULT_SLOT_DURATION * 60 * 1000,
        start.getTime()
      )
      creationSlotsData.push({
        from: new Date(creationFromTime).toISOString(),
        to: new Date(creationToTime).toISOString(),
        diff: Math.floor((creationToTime - creationFromTime) / (60 * 1000))
      })
    }
    return creationSlotsData
  }

  getDefaultSlotDate(dayOfWeek: Date): string {
    const date = new Date(dayOfWeek)
    date.setHours(14, 0, 0, 0)
    return date.toISOString()
  }

  getCssClassesForEmptyDay() {
    return `AvailabilityList-slot-top-0 AvailabilityList-slot-height-${24 * 60}`
  }
}
</script>
