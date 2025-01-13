<template>
  <Button
    color="secondary"
    :active="true"
    size="large"
    style="padding: 1rem; display: flex; align-items: center;"
    @click="onSlotClicked()"
  >
    <div class="NextAppointment">
      <div class="NextAppointment-prefix">
        <v-icon start icon="mdi-lightning-bolt"></v-icon>
        <span class="full">Prochain rendez-vous :&nbsp;</span>
        <span class="shortcut">Prochain RdV :&nbsp;</span>
      </div>
      <div class="NextAppointment-date">
        <b>{{ DateHelper.format(firstSlot.from, DateFormat.MEDIUM_DATE) }}</b>
        à
        <b>{{ DateHelper.format(firstSlot.from, DateFormat.TIME) }}</b>
        <span class="ml-6 pi pi-arrow-right"></span>
      </div>
    </div>
  </Button>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue} from "vue-facing-decorator";
import type {SlotPersisted} from "@shared/types/slot.interface";
import DateHelper from "@shared/helpers/date.helper";
import DateFormat from "@shared/types/date-format.enum";
import Button from "@/components/_design-system/Button.vue";

@Component({
  components: {Button}
})
export default class NextAppointment extends Vue {
  @Prop({ required: true }) firstSlot!: SlotPersisted
  readonly DateFormat = DateFormat
  readonly DateHelper = DateHelper

  onSlotClicked() {
    if (this.firstSlot) {
      this.slotClicked(this.firstSlot)
    }
  }

  @Emit()
  slotClicked(slot: SlotPersisted) {
    return slot
  }
}
</script>

<style lang="scss">
.NextAppointment {
  display: flex;
  align-items: center;

  &-prefix {
    display: flex;
    align-items: center;
    .pi {
      font-size: 1.1rem;
    }
    .shortcut {
      display: none;
    }
    @media (max-width: 1100px) {
      .full, .pi {
        display: none;
      }
      .shortcut {
        display: block;
      }
    }
  }

  &-date {
    b {
      font-size: 1.1rem;
    }
    @media (max-width: 1100px) {
      .pi {
        display: none;
      }
    }
  }
}
</style>
