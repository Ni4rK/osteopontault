<template>
  <a
    v-if="!noText"
    href="https://maps.app.goo.gl/E6vYw1tQbJ8j22Ye6"
    target="_blank"
  >
    <v-icon
      v-if="withIcon"
      icon="mdi-map-marker"
      start
    />
    <span>Village anglais rue Georges Ohnet, 77340 Pontault-Combault</span>
  </a>
  <v-btn
    v-else
    size="small"
    icon="mdi-map-marker"
    href="https://maps.app.goo.gl/E6vYw1tQbJ8j22Ye6"
    target="_blank"
  />
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-facing-decorator";

@Component
export default class Location extends Vue {
  @Prop({ default: true }) withIcon!: boolean
  @Prop({ default: false }) noText!: boolean
}
</script>
