<template>
  <v-btn
    class="text-none"
    rounded
    :color="color"
    :variant="variant"
    :size="size"
    :type="type"
    :loading="loading"
    :min-width="minWidth"
  >
    <slot>
      <v-icon v-if="icon" :start="!!label" :icon="icon"/>
      <span v-if="label" :class="{
        'font-weight-bold': size === 'large' || size === 'x-large',
        'px-4': !icon
      }">{{ label }}</span>
    </slot>
  </v-btn>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-facing-decorator";

@Component
export default class Button extends Vue {
  @Prop({ default: undefined }) label!: string | undefined
  @Prop({ default: "primary" }) color!: string
  @Prop({ default: null }) icon!: string | null
  @Prop({ default: false }) active!: boolean
  @Prop({ default: false }) outlined!: boolean
  @Prop({ default: undefined }) size!: "x-small" | "small" | "large" | "x-large" | undefined
  @Prop({ default: "text" }) type!: string
  @Prop({ default: undefined }) minWidth!: string | undefined
  @Prop({ default: false }) loading!: boolean

  get variant(): "flat" | "text" | "elevated" | "tonal" | "outlined" | "plain" {
    if (this.outlined) {
      return "outlined"
    }
    return this.active ? "elevated" : "text"
  }
}
</script>
