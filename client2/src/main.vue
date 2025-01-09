<template>
  <main>
    <RouterView/>
    <v-snackbar
      v-for="toast of toasts"
      v-model="showSnackbar"
    >
      <div class="d-flex align-start">
        <span v-html="toast.message"/>
      </div>
    </v-snackbar>
  </main>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-facing-decorator'
import type {Toast} from "@shared/types/toast.type";
import ToasterService from "@/services/snackbar/toaster.service";
import {Container} from "typedi";
import type SnackbarComponentInterface from "@/services/snackbar/snackbar-component.interface";
import {ref} from "vue";

@Component({
  setup() {
    return {
      toasts: ref([])
    }
  }
})
export default class Main extends Vue implements SnackbarComponentInterface {
  private readonly toastService = Container.get(ToasterService)
  showSnackbar = true
  toasts!: Toast[]

  mounted() {
    this.toastService.setSnackbarComponent(this)
  }

}
</script>

<style lang="scss">
.v-sheet.v-snack__wrapper {
  border-left: 8px solid currentColor;
}

.v-snack--text .v-snack__wrapper:before {
  // To remove border radius effect on the right side of the left border
  left: -8px;
}
</style>
