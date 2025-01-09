<template>
  <!-- //////////////////////////////////////////////////////////////////////////////////////////////////// -->
  <!-- ///////////////////////// TEMPLATE for a specific created-slot or creation-slot //////////////////// -->
  <!-- //////////////////////////////////////////////////////////////////////////////////////////////////// -->
  <Button
    class="AvailabilityList-slot"
    @click="onClick"
    v-ripple
    :active="slot?.hasPatient"
    :color="colorForSlot"
    :class="getCssClassesForSlot(from, to)"
  >
    <div class="AvailabilityList-slot-container">
      <!-- Creation-slot -->
      <template v-if="!slot">
        <span class="ml-6">{{ DateHelper.parseMinutes(diff) }}</span>
      </template>

      <!-- Created-slot -->
      <template v-if="slot">
        <div
          class="AvailabilityList-slot-details"
          :class="{ 'condensed': diff < DEFAULT_SLOT_DURATION }"
        >
          <div v-if="diff >= DEFAULT_SLOT_DURATION || !slot.patient">
            <v-icon icon="mdi-clock" size="x-small" start class="align-self-center"/>
            <span class="ml-1">{{ DateHelper.format(slot.from, DateFormat.TIME) }} • {{ DateHelper.parseMinutes(DateHelper.getDifferenceOfTimeInMinutes(slot.from, slot.to)) }}</span>
          </div>
          <div v-if="slot.patient" class="AvailabilityList-slot-details-patient">
            <v-icon icon="mdi-account" size="small" start/>
            <span class="ml-1">{{ slot.patient.lastname }}</span>
            <span v-if="diff < DEFAULT_SLOT_DURATION">&nbsp;• {{ DateHelper.parseMinutes(DateHelper.getDifferenceOfTimeInMinutes(slot.from, slot.to)) }}</span>
          </div>
        </div>
        <div v-if="diff >= DEFAULT_SLOT_DURATION" class="AvailabilityList-slot-practitioner">
          <IconPractitioner :practitioner="slot.practitioner"/>
        </div>
      </template>
    </div>
  </Button>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue} from "vue-facing-decorator";
import type {SlotPersisted} from "@shared/types/slot.interface";
import {DEFAULT_SLOT_DURATION} from "@/utils/global.constants";
import DateHelper from "@shared/helpers/date.helper";
import IconPractitioner from "@/components/_design-system/IconPractitioner.vue";
import {Practitioner} from "@shared/types/practitioner.enum";
import DateFormat from "@shared/types/date-format.enum";
import Button from "@/components/_design-system/Button.vue";

@Component({
  components: {Button, IconPractitioner}
})
export default class AvailabilityListSlot extends Vue {
  @Prop({ required: true }) slot!: SlotPersisted
  @Prop({ required: true }) from!: string
  @Prop({ required: true }) to!: string
  @Prop({ required: true }) diff!: number
  @Prop({ required: true }) visible!: boolean

  @Emit() editSlot() {}
  @Emit() addAvailability() {}

  readonly DEFAULT_SLOT_DURATION = DEFAULT_SLOT_DURATION
  readonly DateHelper = DateHelper
  readonly DateFormat = DateFormat
  readonly Practitioner = Practitioner

  get colorForSlot(): string {
    if (!this.slot) {
      return 'primary'
    }
    return this.slot.practitioner === Practitioner.ROSE ? 'rose' : 'anais'
  }

  getCssClassesForSlot(from: string, to: string): object {
    const startInMinutes = DateHelper.getTimeInMinutes(from)
    const durationInMinutes = DateHelper.getDifferenceOfTimeInMinutes(from, to)
    return {
      [`AvailabilityList-slot-top-${startInMinutes} AvailabilityList-slot-height-${durationInMinutes}`]: true,
      'creation': !this.slot,
      'visible': this.visible,
      'outlined': !this.slot?.hasPatient
    }
  }

  onClick() {
    this.slot ? this.editSlot() : this.addAvailability()
  }
}
</script>
