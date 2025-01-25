<template>
  <template v-if="!noText">
    <span>
      <v-icon
        v-if="!iconInlined && !noIcon"
        icon="mdi-phone"
        start
      />
    <a :class="colorClass" :href="programmaticPhone">
      <span v-if="iconInlined && !noIcon" class="mdi mdi-phone unclickable"/>
      <span>{{ readablePhone }}</span>
    </a>
    </span>
  </template>
  <v-btn
    v-else
    size="small"
    icon="mdi-phone"
    :href="programmaticPhone"
  />
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-facing-decorator";
import PhoneHelper from "@shared/helpers/phone.helper";
import {ROSE_PHONE} from "@/utils/global.constants";
import Button from "@/components/_design-system/Button.vue";

@Component({
  components: {Button}
})
export default class Phone extends Vue {
  @Prop({ default: true }) iconInlined!: boolean
  @Prop({ default: false }) noText!: boolean
  @Prop({ default: false }) noIcon!: boolean
  @Prop({ default: "inherit" }) color!: "white" | "primary" | "inherit"

  get colorClass(): string {
    return `color-${this.color}`
  }

  get readablePhone(): string {
    return PhoneHelper.toReadableNumber(ROSE_PHONE)
  }

  get programmaticPhone(): string {
    return `tel://${PhoneHelper.toFrenchNumber(ROSE_PHONE)}`
  }
}
</script>
