<template>
  <v-card
    class="pa-6"
    max-width="100vw"
    width="550px"
  >
    <v-card-title>Ajouter des créneaux</v-card-title>

    <v-card-text>
      <form class="Availability-add-form">
        <InputDate
          v-model="newAvailability.date"
          label="Quand ?"
        />
        <template v-if="practitioner === Practitioner.ROSE">
          <v-select
            v-model="newAvailability.practitioner"
            variant="outlined"
            label="Pour"
            rounded
            :autofocus="false"
            :items="Object.values(Practitioner)"
          />
        </template>
        <v-text-field
          v-model="newAvailability.stepTime"
          variant="outlined"
          type="number"
          label="Créneaux de"
          inputmode="numeric"
          suffix="minutes"
        />
        <v-text-field
          v-model="newAvailability.howMany"
          label="Nombre de créneaux"
          variant="outlined"
          type="number"
          inputmode="numeric"
        />
      </form>
    </v-card-text>

    <v-card-actions>
      <Button
        label="Annuler"
        size="large"
        :active="true"
        @click="cancelAddingAvailability()"
      />
      <Button
        label="Ajouter"
        color="secondary"
        size="large"
        :active="true"
        :loading="isAddingAvailability"
        @click="onAddAvailability()"
      />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">

import {Component, Emit, Prop, Vue, Watch} from "vue-facing-decorator";
import {Practitioner} from "@shared/types/practitioner.enum";
import DateFormat from "@shared/types/date-format.enum";
import {DEFAULT_SLOT_DURATION} from "@/utils/global.constants";
import {Container} from "typedi";
import AvailabilityHttpService from "@/services/http/availability.http-service";
import ToasterService from "@/services/snackbar/toaster.service";
import {isDate} from "@shared/helpers/common-types.guards";
import DateHelper from "@shared/helpers/date.helper";
import InputDate from "@/components/_design-system/InputDate.vue";
import Button from "@/components/_design-system/Button.vue";

@Component({
  components: {Button, InputDate}
})
export default class AvailabilityAdd extends Vue {
  @Prop({ required: true }) practitioner!: Practitioner
  @Prop({ required: true }) baseDates!: [Date | null, Date | null]

  @Emit() availabilityAdded() {}

  @Emit() cancelAddingAvailability() {}

  private readonly availabilityService = Container.get(AvailabilityHttpService)
  private readonly toasterService = Container.get(ToasterService)

  readonly Practitioner = Practitioner
  readonly DateFormat = DateFormat
  readonly Object = Object

  isAddingAvailability = false
  newAvailability = {
    date: new Date(),
    practitioner: Practitioner.ROSE as Practitioner,
    stepTime: DEFAULT_SLOT_DURATION, // in minutes
    howMany: 5, // slots counter
  }

  @Watch('baseDates', { immediate: true })
  onBaseDatesChanged() {
    const from = this.baseDates[0]
    const to = this.baseDates[1]
    if (!isDate(from) && isDate(to)) {
      const toDate = new Date(to)
      toDate.setTime(to.getTime() - DEFAULT_SLOT_DURATION * 60 * 1000)
      this.newAvailability.howMany = 1
      this.newAvailability.date = toDate
    } else if (isDate(from) && !isDate(to)) {
      this.newAvailability.howMany = 5
      this.newAvailability.date = from
    } else if (isDate(from) && isDate(to)) {
      this.newAvailability.howMany = Math.floor((to.getTime() - from.getTime()) / (DEFAULT_SLOT_DURATION * 60 * 1000))
      if (this.newAvailability.howMany < 1) {
        this.newAvailability.howMany = 1
        this.newAvailability.stepTime = DateHelper.getDifferenceOfTimeInMinutes(from, to)
      }
      this.newAvailability.date = from
    } else if (!isDate(from) && !isDate(to)) {
      const date = new Date()
      date.setHours(date.getHours() + 1)
      date.setMinutes(0)
      this.newAvailability.howMany = 5
      this.newAvailability.date = date
    }
  }

  async onAddAvailability() {
    this.isAddingAvailability = true
    try {
      await this.availabilityService.create(
        this.newAvailability.practitioner,
        this.newAvailability.date,
        this.newAvailability.stepTime,
        this.newAvailability.howMany
      )
      this.toasterService.sendToast({
        type: "success",
        message: "Disponibilités ajoutées",
        timeout: 1000
      })
      this.availabilityAdded()
    } catch {
      this.toasterService.sendToast({
        type: "error",
        message: "Impossible de créer les créneaux",
        timeout: 2000
      })
    } finally {
      this.isAddingAvailability = false
    }
  }
}
</script>

<style lang="scss">
.Availability-add {
  &-form {
    &-input {
      display: flex;
      align-items: center;
      justify-content: space-between;
      @media (max-width: 1100px) {
        flex-direction: column;
        align-items: inherit;
        gap: .5rem;
      }
    }
  }
}
</style>
