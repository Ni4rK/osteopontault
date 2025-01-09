<template>
  <v-card
    class="pa-6"
    max-width="100vw"
    width="550px"
  >
    <v-card-title>Modifier un créneau</v-card-title>

    <v-card-text>
      <form class="Availability-edit-form">
        <InputDate
          v-model="form.from"
          label="De :"
        />
        <InputDate
          v-model="form.to"
          label="À :"
        />
        <template v-if="practitioner === Practitioner.ROSE">
          <v-select
            v-model="form.practitioner"
            variant="outlined"
            label="Pour"
            rounded
            :autofocus="false"
            :items="Object.values(Practitioner)"
          />
        </template>
        <div class="d-flex">
          <v-spacer/>
          <v-switch
            v-model="form.hasPatient"
            label="Patient"
            color="primary"
            @change="onHasPatientChanged()"
          />
        </div>
        <template v-if="form.hasPatient && form.patient">
          <template v-if="form.bookedAt">
            <InputDate
              v-model="form.bookedAt"
              label="Créneau pris le"
              disabled
            />
          </template>
          <v-text-field
            v-model="form.patient!.lastname"
            variant="outlined"
            label="Nom"
            rounded
          />
          <v-text-field
            v-model="form.patient!.firstname"
            variant="outlined"
            label="Prénom"
            rounded
          />
          <InputPhone
            :initial-value="slot.patient?.phone"
            @update="onPhoneChanged($event)"
          />
          <v-select
            v-model="form.patient!.type"
            variant="outlined"
            label="Type de séance"
            :autofocus="false"
            :items="Object.values(PatientType)"
            rounded
          />
        </template>
      </form>
    </v-card-text>

    <v-card-actions :class="{ 'justify-space-evenly': isMobile }">
      <Button
        size="large"
        :label="isMobile ? '' : 'Annuler'"
        :icon="isMobile ? 'mdi-undo' : null"
        :active="true"
        @click="cancelled()"
      />
      <Button
        size="large"
        color="danger"
        :label="isMobile ? '' : 'Supprimer'"
        :icon="isMobile ? 'mdi-trash-can' : null"
        :active="true"
        :loading="isEditingSlot"
        @click="onRemoveSlot()"
      />
      <Button
        size="large"
        color="success"
        :label="isMobile ? '' : 'Modifier'"
        :icon="isMobile ? 'mdi-check-bold' : null"
        :active="true"
        :loading="isEditingSlot"
        @click="onEditSlot()"
      />
    </v-card-actions>
  </v-card>

  <v-dialog v-model="isRemovingSlot" :fullscreen="isMobile">
    <v-card position="absolute" :location="'center center'">
      <v-card-title>
        Confirmer la suppression du créneau ?
      </v-card-title>
      <v-card-actions>
        <Button
          label="Annuler"
          size="large"
          :active="true"
          @click="onCancelRemoveSlot()"
        />
        <Button
          label="Supprimer"
          color="secondary"
          size="large"
          :active="true"
          :loading="isEditingSlot"
          @click="onConfirmRemoveSlot()"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue, Watch} from "vue-facing-decorator";
import {Practitioner} from "@shared/types/practitioner.enum";
import DateFormat from "@shared/types/date-format.enum";
import {PatientType} from "@shared/types/patient.interface";
import {Container} from "typedi";
import AvailabilityHttpService from "@/services/http/availability.http-service";
import ToasterService from "@/services/snackbar/toaster.service";
import type {SlotPersisted} from "@shared/types/slot.interface";
import {createSlotForm} from "@/forms/slot.form";
import InputPhone from "@/components/_design-system/InputPhone.vue";
import InputDate from "@/components/_design-system/InputDate.vue";
import Button from "@/components/_design-system/Button.vue";

@Component({
  components: {Button, InputDate, InputPhone}
})
export default class AvailabilityEdit extends Vue {
  @Prop({ required: true }) practitioner!: Practitioner
  @Prop({ required: true }) slot!: SlotPersisted

  @Emit() slotEdited() {
  }
  @Emit() slotRemoved() {
  }
  @Emit() cancelled() {
  }

  private readonly availabilityService = Container.get(AvailabilityHttpService)
  private readonly toasterService = Container.get(ToasterService)

  readonly Practitioner = Practitioner
  readonly DateFormat = DateFormat
  readonly Object = Object
  readonly PatientType = PatientType

  isEditingSlot = false
  isRemovingSlot = false
  form = createSlotForm()

  get isMobile(): boolean {
    return document.body.clientWidth < 800
  }

  @Watch('slot', { immediate: true })
  onSlotChanged() {
    if (!this.slot) {
      return
    }
    this.form = {
      from: new Date(this.slot.from),
      to: new Date(this.slot.to),
      practitioner: this.slot.practitioner,
      bookedAt: this.slot.bookedAt ? new Date(this.slot.bookedAt) : undefined,
      hasPatient: this.slot.hasPatient,
      patient: null
    }
    if (this.slot.patient) {
      this.form.patient = {
        ...this.slot.patient
      }
    }
  }

  onPhoneChanged(phone: string) {
    if (!this.form.patient) {
      return
    }
    if (this.form.patient?.phone) {
      this.form.patient.phone = phone
    }
  }

  onHasPatientChanged() {
    if (this.form.hasPatient) {
      this.form.patient = this.slot.patient
        ? {...this.slot.patient}
        : {
          firstname: "",
          lastname: "",
          phone: "0",
          type: PatientType.ADULT
        }
    }
  }

  onRemoveSlot() {
    if (this.slot.hasPatient) {
      this.isRemovingSlot = true
    } else {
      this.onConfirmRemoveSlot()
    }
  }

  async onEditSlot() {
    const newSlotFrom = new Date(this.slot.from)
    const newSlotTo = new Date(this.slot.to)
    const sendNotification = !this.slot.hasPatient && !!this.form.hasPatient
    newSlotFrom.setHours(this.form.from.getHours())
    newSlotFrom.setMinutes(this.form.from.getMinutes())
    newSlotTo.setHours(this.form.to.getHours())
    newSlotTo.setMinutes(this.form.to.getMinutes())

    try {
      await this.availabilityService.edit({
        uid: this.slot.uid,
        from: newSlotFrom.toISOString(),
        to: newSlotTo.toISOString(),
        practitioner: this.form.practitioner,
        bookedAt: this.form.bookedAt?.toISOString(),
        hasPatient: !!this.form.hasPatient,
        patient: !this.form.hasPatient || !this.form.patient ? null : {
          firstname: this.form.patient.firstname!,
          lastname: this.form.patient.lastname!,
          phone: this.form.patient.phone!,
          type: this.form.patient.type!
        }
      }, sendNotification)
      this.toasterService.sendToast({
        type: "success",
        message: "Créneau modifié"
      })
      this.slotEdited();
    } catch {
      this.toasterService.sendToast({
        type: "error",
        message: "Impossible de modifier le créneau",
      })
    } finally {
      this.isEditingSlot = false
    }
  }

  onCancelRemoveSlot() {
    this.isRemovingSlot = false
  }

  async onConfirmRemoveSlot() {
    this.isEditingSlot = true

    try {
      await this.availabilityService.remove(this.slot)
      this.toasterService.sendToast({
        type: "success",
        message: "Créneau supprimé"
      })
      this.slotRemoved();
    } catch {
      this.toasterService.sendToast({
        type: "error",
        message: "Impossible de supprimer le créneau",
      })
    } finally {
      this.isEditingSlot = false
    }
  }
}
</script>

<style lang="scss">
.Availability-edit {
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
