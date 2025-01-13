<template>
  <v-timeline
    align="start"
    side="end"
    truncate-line="both"
    class="Timeline"
    :value="isLoading ? loaders : availabilities"
  >
    <v-timeline-item
      v-for="availability of isLoading ? loaders : availabilities"
      dot-color="primary"
      size="small"
    >
      <!-- Date -->
      <template v-slot:opposite>
        <v-skeleton-loader
          v-if="isLoading || availability === null"
          style="width: 141px; height: 42px; display: flex; justify-content: end; border-radius: 1rem;"
        />
        <Button
          v-else
          class="unclickable"
          size="large"
          :outlined="true"
          :label="DateHelper.format(availability.date, formatForOppositeSlot)"
        />
      </template>

      <!-- Slots list -->
      <template v-slot:default>
        <div class="Timeline-slots">
          <v-skeleton-loader
            v-if="isLoading || availability === null"
            v-for="_ of loadingSlots"
            style="width: 104px; height: 46px; display: flex; justify-content: end; border-radius: 1rem;"
          />
          <template v-else>
            <Button
              v-for="slot of availability.slots"
              size="large"
              :active="true"
              :color="slot.practitioner !== Practitioner.ROSE ? 'anais' : 'rose'"
              :label="DateHelper.format(availability.date, DateFormat.TIME)"
              @click="slotClicked(slot)"
            >
              <div class="Timeline-slots-slot font-weight-bold">
                <span class="mr-2">{{ DateHelper.format(slot.from, DateFormat.TIME) }}</span>
                <IconPractitioner :practitioner="slot.practitioner"/>
              </div>
            </Button>
          </template>
        </div>
      </template>
    </v-timeline-item>
  </v-timeline>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue} from "vue-facing-decorator";
import IconPractitioner from "@/components/_design-system/IconPractitioner.vue";
import Hexagon from "@/components/_design-system/Hexagon.vue";
import type {SlotPersisted} from "@shared/types/slot.interface";
import type {Availability} from "@shared/types/availability.interface";
import DateHelper from "../../../../shared/helpers/date.helper";
import DateFormat from "../../../../shared/types/date-format.enum";
import {Practitioner} from "@shared/types/practitioner.enum";
import Button from "@/components/_design-system/Button.vue";

@Component({
  components: {Button, Hexagon, IconPractitioner}
})
export default class Timeline extends Vue {
  readonly Practitioner = Practitioner
  readonly DateFormat = DateFormat
  readonly DateHelper = DateHelper

  @Prop({ required: true }) isLoading!: boolean
  @Prop() availabilities!: Availability[]

  @Emit()
  slotClicked(slot: SlotPersisted) {
    return slot
  }

  loaders = new Array<null>(5).fill(null)
  loadingSlots = new Array<null>(5).fill(null)

  get isMobile(): boolean {
    return document.body.clientWidth < 800
  }

  get formatForOppositeSlot(): DateFormat {
    return this.isMobile ? DateFormat.MEDIUM_DATE : DateFormat.FULL_DATE
  }
}
</script>

<style lang="scss">
.Timeline {
  &-slots {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    &-slot {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
  &-separator {
    position: relative;
    transform: translateY(25%);
  }
}

:host ::ng-deep {
  p-timeline {
    .p-timeline-event {
      margin-top: 1rem;
      margin-bottom: 1rem;
    }
    .p-timeline-event-connector {
      transform: translateY(1.25rem);
    }
    .p-timeline-event-opposite {
      *:first-letter {
        text-transform: uppercase;
      }
    }
  }
}
</style>
