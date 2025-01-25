<template>
  <v-card
    class="pa-6"
    max-width="100vw"
    width="550px"
  >
    <v-card-title class="">
      Créneau confirmé
    </v-card-title>

    <v-container>
      <v-card variant="tonal" class="pa-2 mb-4">
        <div class="font-weight-bold">
          Votre rendez-vous :
        </div>
        <v-list density="compact">
          <v-list-item>
            <v-icon icon="mdi-clock" size="small" start/>
            <span style="border-bottom: 2px solid red">Le {{ DateHelper.format(slot.from, DateFormat.DATE_TIME) }}</span>
          </v-list-item>
          <v-list-item>
            <v-icon icon="mdi-account" size="small" start/>
            <span class="position-relative">
            Avec {{ TextHelper.toPractitionerName(slot.practitioner) }}
            <IconPractitioner
              class="position-absolute top-0"
              style="right: calc(-20px - 1rem)"
              :practitioner="slot.practitioner"
              :width="20"
            />
          </span>
          </v-list-item>
        </v-list>
      </v-card>

      <v-card variant="tonal" class="pa-2">
        <div class="font-weight-bold">
          Infos pratiques :
        </div>
        <v-list density="compact">
          <v-list-item>
            <Location :shorten="true"/>
          </v-list-item>
          <v-list-item>
            <v-icon icon="mdi-phone" size="small" start/>
            Modification au <Phone color="primary" :no-icon="true"/>
          </v-list-item>
        </v-list>
      </v-card>
    </v-container>

    <v-spacer/>
    <transition name="bounce">
      <v-img
        v-show="check"
        class="mx-auto my-2"
        src="/images/check-bold.svg"
        width="130"
        height="130"
      />
    </transition>
    <v-spacer/>

    <v-card-actions>
      <v-spacer/>
      <Button
        label="Ok"
        color="secondary"
        size="large"
        :active="true"
        @click="close"
      />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue} from "vue-facing-decorator";
import IconPractitioner from "@/components/_design-system/IconPractitioner.vue";
import type {SlotPersisted} from "@shared/types/slot.interface.ts";
import type {Patient} from "@shared/types/patient.interface.ts";
import TextHelper from "@shared/helpers/text.helper";
import DateHelper from "@shared/helpers/date.helper";
import DateFormat from "@shared/types/date-format.enum";
import Phone from "@/components/_design-system/Phone.vue";
import Button from "@/components/_design-system/Button.vue";
import Location from "@/components/_design-system/Location.vue";

@Component({
  components: {Location, Button, Phone, IconPractitioner}
})
export default class BookingSuccessful extends Vue {
  @Prop({ required: true }) slot!: SlotPersisted
  @Prop({ required: true }) patient!: Patient

  @Emit() close() {}

  check = false

  TextHelper = TextHelper
  DateHelper = DateHelper
  DateFormat = DateFormat

  mounted() {
    this.check = true
  }
}
</script>

<style lang="scss">
.bounce-enter-active {
  animation-timing-function: ease-in;
  animation: bounce-in 1s;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  40% {
    transform: scale(2);
  }
  80% {
    transform: scale(0.75);
  }
  100% {
    transform: scale(1);
  }
}
</style>
