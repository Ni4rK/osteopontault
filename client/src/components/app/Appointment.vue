<template>
  <v-card
    class="pa-6"
    max-width="100vw"
    width="550px"
  >
    <v-card-title class="d-flex">
      <div class="p-dialog-title">
        Créneau du {{ slotDate }}
      </div>
      <v-spacer/>
      <IconPractitioner
        :practitioner="slot.practitioner"
        :width="50"
      />
    </v-card-title>
    <v-alert
      v-if="isSlotForChildrenOnly"
      color="warning"
      icon="mdi-alert"
    >
      <template v-slot:text>
        Les créneaux du mercredi sont réservés aux bébés et enfants.
        Pour toute demande urgente, n'hésitez pas à appeler le <Phone :with-icon="false"/>.
      </template>
    </v-alert>
    <form class="Appointment-form">
      <v-text-field
        v-model="form.lastname"
        variant="outlined"
        label="Nom *"
        :autofocus="false"
        :rules="[(v) => !!v || 'Champ obligatoire']"
        rounded
        @focusout="onFocusOutLastname()"
      />
      <v-text-field
        v-model="form.firstname"
        variant="outlined"
        label="Prénom *"
        :autofocus="false"
        :rules="[(v) => !!v || 'Champ obligatoire']"
        rounded
        @focusout="onFocusOutFirstname()"
      />
      <InputPhone
        @update="onPhoneChanged($event)"
        @focusout="onFocusOutPhone()"
      />
      <v-select
        v-model="form.type"
        variant="outlined"
        label="Type de séance"
        :autofocus="false"
        :items="patientTypeOptions"
        rounded
        @change="onChangedPatientType()"
      />
    </form>
    <v-card-actions>
      <Button
        label="Annuler"
        size="large"
        :active="true"
        @click="cancelAppointment()"
      />
      <Button
        label="Réserver le créneau"
        color="secondary"
        size="large"
        :active="true"
        :disabled="!canBook"
        :loading="isBookingAppointment"
        @click="onBookAppointment()"
      />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue} from "vue-facing-decorator";
import IconPractitioner from "@/components/_design-system/IconPractitioner.vue";
import type {SlotPersisted} from "@shared/types/slot.interface";
import type {Patient} from "@shared/types/patient.interface";
import {isPatientType, PatientType} from "@shared/types/patient.interface";
import AvailabilityHttpService from "@/services/http/availability.http-service";
import ToasterService from "@/services/snackbar/toaster.service";
import AnalyticsPulsarService from "@/services/analytics-pulsar.service";
import {Practitioner} from "@shared/types/practitioner.enum";
import DateHelper from "@shared/helpers/date.helper";
import {isString} from "@shared/helpers/common-types.guards";
import PhoneHelper from "@shared/helpers/phone.helper";
import type {AnalyticsActionDataTypes} from "@shared/types/analytics.types";
import {AnalyticsAction} from "@shared/types/analytics.types";
import InputPhone from "@/components/_design-system/InputPhone.vue";
import {createPatientForm} from "@/forms/patient.form";
import {Container} from "typedi";
import DateFormat from "../../../../shared/types/date-format.enum";
import Button from "@/components/_design-system/Button.vue";
import Phone from "@/components/_design-system/Phone.vue";
import Disclaimer from "@/components/_design-system/Disclaimer.vue";

@Component({
  components: {Disclaimer, Phone, Button, InputPhone, IconPractitioner}
})
export default class Appointment extends Vue {
  @Prop({ required: true }) slot!: SlotPersisted

  @Emit cancelAppointment() {}

  @Emit appointmentBooked(slot: SlotPersisted, patient: Patient) {
    return {
      slot,
      patient
    }
  }

  private readonly availabilityService = Container.get(AvailabilityHttpService)
  private readonly toasterService = Container.get(ToasterService)
  private readonly analyticsPulsar = Container.get(AnalyticsPulsarService)

  readonly DateFormat = DateFormat
  readonly DateHelper = DateHelper

  isBookingAppointment = false
  form = createPatientForm()

  get slotDate(): string {
    return DateHelper.format(this.slot.from, DateFormat.DATE_TIME)
  }

  get isSlotForChildrenOnly(): boolean {
    return (
      this.slot.practitioner === Practitioner.ROSE &&
      DateHelper.isWednesday(this.slot.from)
    )
  }

  get patientTypeOptions(): PatientType[] {
    if (this.isSlotForChildrenOnly) {
      return [
        PatientType.BABY,
        PatientType.CHILD
      ];
    }
    return Object.values(PatientType) as PatientType[]
  }

  get canBook(): boolean {
    return (
      !this.isBookingAppointment &&
      isString(this.form.firstname) &&
      this.form.firstname.length > 0 &&
      isString(this.form.lastname) &&
      this.form.lastname.length > 0 &&
      PhoneHelper.isValidNumber(this.form.phone) &&
      isPatientType(this.form.type)
    )
  }

  mounted() {
    if (this.isSlotForChildrenOnly) {
      this.form.type = this.patientTypeOptions[0]
    }
  }

  onFocusOutLastname() {
    if (!this.form.lastname?.length) {
      return
    }
    const analyticsData: AnalyticsActionDataTypes[AnalyticsAction.APPOINTMENT_LASTNAME_FILLED] = {
      lastname: this.form.lastname
    }
    this.analyticsPulsar.action(AnalyticsAction.APPOINTMENT_LASTNAME_FILLED, analyticsData)
  }

  onFocusOutFirstname() {
    if (!this.form.firstname?.length) {
      return
    }
    const analyticsData: AnalyticsActionDataTypes[AnalyticsAction.APPOINTMENT_FIRSTNAME_FILLED] = {
      firstname: this.form.firstname
    }
    this.analyticsPulsar.action(AnalyticsAction.APPOINTMENT_FIRSTNAME_FILLED, analyticsData)
  }

  onFocusOutPhone() {
    if (!this.form.phone?.length) {
      return
    }
    const analyticsData: AnalyticsActionDataTypes[AnalyticsAction.APPOINTMENT_PHONE_FILLED] = {
      phone: this.form.phone
    }
    this.analyticsPulsar.action(AnalyticsAction.APPOINTMENT_PHONE_FILLED, analyticsData)
  }

  onPhoneChanged(phone: string) {
    this.form.phone = phone
  }

  onChangedPatientType() {
    const analyticsData: AnalyticsActionDataTypes[AnalyticsAction.APPOINTMENT_PATIENT_TYPE_CHANGED] = {
      patientType: this.form.type
    }
    this.analyticsPulsar.action(AnalyticsAction.APPOINTMENT_PATIENT_TYPE_CHANGED, analyticsData)
  }

  async onBookAppointment() {
    if (this.canBook) {
      const patient: Patient = {
        firstname: this.form.firstname!,
        lastname: this.form.lastname!,
        phone: this.form.phone!,
        type: this.form.type
      }
      this.isBookingAppointment = true
      try {
        await this.availabilityService.book(this.slot.uid, patient)
        this.toasterService.sendToast({
          type: "success",
          message: `Créneau du ${this.slotDate} réservé !`
        })
        this.appointmentBooked(this.slot, patient)
      } catch (error) {
        this.toasterService.sendToast({
          type: "error",
          message: "Impossible de réserver le créneau"
        })
        const analyticsData: AnalyticsActionDataTypes[AnalyticsAction.APPOINTMENT_BOOKED] = {
          date: this.slot.from,
          patient: `${patient.firstname} ${patient.lastname} (${patient.phone})`,
          success: false
        }
        this.analyticsPulsar.action(AnalyticsAction.APPOINTMENT_BOOKED, analyticsData)
      } finally {
        this.isBookingAppointment = false
      }
    }
  }
}
</script>

<style lang="scss">
.Appointment {
  &-header {
    display: flex;
    align-items: inherit;
    justify-content: space-between;
    padding-left: 0;
    padding-right: 0;
  }

  &-form {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &-phone-digit {
    max-width: 10px;
  }
}
</style>
