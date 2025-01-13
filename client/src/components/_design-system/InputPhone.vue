<template>
  <v-text-field
    v-model="phone"
    variant="outlined"
    label="Téléphone *"
    inputmode="numeric"
    :autofocus="false"
    :rules="[(v) => isValid(v) || 'Exemple : 06 12 34 56 78']"
    rounded
    @keyup="onChange()"
    @change="onChange()"
  />
</template>

<script lang="ts">
import PhoneHelper from "@shared/helpers/phone.helper";
import {Component, Emit, Prop, Vue, Watch} from "vue-facing-decorator";

@Component
export default class InputPhone extends Vue {
  @Prop() initialValue?: string

  @Emit()
  update(value: string) {
    return value
  }

  phone = ""

  @Watch('initialValue', { immediate: true })
  onInitialValueChanged() {
    if (this.initialValue?.length) {
      this.phone = PhoneHelper.toReadableNumber(this.initialValue)
    }
  }

  onChange() {
    const sanitizedNumber = PhoneHelper.sanitizeNumber(this.phone)
    this.phone = PhoneHelper.toReadableNumber(sanitizedNumber)
    this.update(sanitizedNumber)
  }

  isValid(phone: string): boolean {
    const sanitizedNumber = PhoneHelper.sanitizeNumber(phone)
    return PhoneHelper.isValidNumber(sanitizedNumber)
  }
}
</script>

<style lang="scss">
:host {
  display: flex;
  align-items: center;
  justify-content: space-between;
  > * {
    flex-grow: 1;
    width: 100%;
    @media (min-width: 1100px) {
      max-width: 300px;
    }
  }
  @media (max-width: 1100px) {
    flex-direction: column;
    align-items: inherit;
    gap: .5rem;
  }
}
</style>
