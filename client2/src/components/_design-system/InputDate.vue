<template>
  <v-text-field
    v-model="datetimeText"
    :label="label"
    :disabled="disabled"
    variant="outlined"
    readonly
    rounded
    @focus="onFocus"
  />

  <v-dialog
    v-model="showPickers"
    :fullscreen="isMobile"
    :scrollable="isMobile"
  >
    <v-card position="absolute" :location="'center center'">
      <v-card-text>
        <v-date-picker
          v-model="dateValue"
          hide-header
          show-adjacent-months
          @input="showPickers = false"
        />
        <v-time-picker
          :model-value="timeValue"
          hide-header
          format="24hr"
          @update:hour="onUpdateHours($event)"
          @update:minute="onUpdateMinutes($event)"
        />
      </v-card-text>
      <v-card-actions>
        <Button
          label="Annuler"
          size="large"
          :active="true"
          @click="showPickers = false"
        />
        <Button
          label="Ok"
          color="secondary"
          size="large"
          :active="true"
          @click="onOk()"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {Component, Model, Prop, Vue, Watch} from "vue-facing-decorator";
import DateFormat from "@shared/types/date-format.enum";
import DateHelper from "@shared/helpers/date.helper";
import Button from "@/components/_design-system/Button.vue";

@Component({
  components: {Button}
})
export default class InputDate extends Vue {
  @Prop({ required: true }) label!: string
  @Prop({ default: new Date() }) initialDate!: Date
  @Prop({ default: false }) disabled!: boolean

  @Model() datetime = new Date()

  showPickers = false
  dateValue: Date | null | undefined = null
  hoursValue: number | null = null
  minutesValue: number | null = null

  get isMobile(): boolean {
    return document.body.clientWidth < 800
  }

  get datetimeText(): string {
    return DateHelper.format(this.datetime, DateFormat.DATE_TIME)
  }

  get timeValue(): string {
    if (!this.hoursValue || !this.minutesValue) {
      return `${this.datetime.getHours()}:${this.datetime.getMinutes()}`
    }
    return `${this.hoursValue}:${this.minutesValue}`
  }

  @Watch('datetime', { immediate: true })
  onDatetimeChanged() {
    this.dateValue = this.datetime
    this.hoursValue = this.datetime.getHours()
    this.minutesValue = this.datetime.getMinutes()
  }

  onFocus() {
    if (!this.disabled) {
      this.showPickers = true
    }
  }

  onUpdateHours(hours: number) {
    this.hoursValue = hours
  }

  onUpdateMinutes(minutes: number) {
    this.minutesValue = minutes
  }

  onOk() {
    this.updateDatetime()
    this.showPickers = false
  }

  updateDatetime() {
    const date = new Date(this.dateValue ?? this.datetime)
    const [hours, minutes] = this.timeValue.split(':')
    date.setHours(+hours, +minutes)
    this.datetime = date
  }
}
</script>
