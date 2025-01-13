<template>
  <v-expand-transition>
    <v-card
      v-show="showToast"
      :color="toast.type"
      density="compact"
      class="Snackbar-toast"
    >
      <v-card-text class="d-flex align-start">
        <div>
          <span v-if="toast.message">{{ toast.message }}</span>
          <template v-if="toast.component">
            <component :is="toast.component"/>
          </template>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn
          :color="toast.type === 'warning' ? 'black' : 'white'"
          variant="tonal"
          icon="mdi-check"
          size="x-small"
          @click="delayDestructionOfToaster"
        />
      </v-card-actions>
    </v-card>
  </v-expand-transition>
</template>
<script lang="ts">
import {Component, Emit, Prop, Vue} from "vue-facing-decorator";
import Button from "@/components/_design-system/Button.vue";
import type {Toast} from "@/components/_design-system/types.ts";

@Component({
  components: {Button}
})
export default class SnackbarToast extends Vue {
  @Prop({ required: true }) toast!: Toast

  @Emit timedOut() {}

  showToast = true

  mounted() {
    if (this.toast.timeout) {
      window.setTimeout(() => this.delayDestructionOfToaster(), this.toast.timeout)
    }
  }

  delayDestructionOfToaster() {
    this.showToast = false
    window.setTimeout(() => this.timedOut(), 500)
  }
}
</script>

<style lang="scss">
.Snackbar-toast {
  border-radius: .7rem !important;
  width: 344px;
  max-width: calc(100vw - 2rem);
  margin: auto;
}
</style>
