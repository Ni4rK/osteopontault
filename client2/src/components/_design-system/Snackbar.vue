<template>
  <div class="Snackbar-wrapper">
    <SnackbarToast
      v-for="toast of toasts"
      :key="toast.id"
      :toast="toast"
      @timed-out="onToastTimedOut(toast)"
    />
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-facing-decorator";
import {Container} from "typedi";
import ToasterService from "@/services/snackbar/toaster.service";
import type SnackbarComponentInterface from "@/services/snackbar/snackbar-component.interface.ts";
import SnackbarToast from "@/components/_design-system/SnackbarToast.vue";
import type {Toast} from "@/components/_design-system/types.ts";

@Component({
  components: {SnackbarToast},
})
export default class Snackbar extends Vue implements SnackbarComponentInterface {
  private readonly toastService = Container.get(ToasterService)

  toasts: Toast[] = []

  mounted() {
    this.toastService.setSnackbarComponent(this)
  }

  onToastTimedOut(toast: Toast) {
    const index = this.toasts.findIndex(t => t.id === toast.id)
    if (index > -1) {
      this.toasts.splice(index, 1)
    }
  }
}
</script>

<style lang="scss">
.Snackbar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  max-width: calc(100vw - 2rem);
  max-height: calc(50vh - 1rem);
  z-index: 9999;
}
</style>
