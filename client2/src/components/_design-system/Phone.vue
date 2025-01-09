<template>
  <a v-if="!noText" :href="programmaticPhone">
    <v-icon
      v-if="withIcon"
      icon="mdi-phone"
      start
    />
    <span>{{ readablePhone }}</span>
  </a>
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
  @Prop({ default: true }) withIcon!: boolean
  @Prop({ default: false }) noText!: boolean

  get readablePhone(): string {
    return PhoneHelper.toReadableNumber(ROSE_PHONE)
  }

  get programmaticPhone(): string {
    return `tel://${PhoneHelper.toFrenchNumber(ROSE_PHONE)}`
  }
}
</script>
