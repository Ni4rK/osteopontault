<template>
  <v-dialog style="max-width: 500px">
    <v-card-title>
      Notifications
    </v-card-title>
    <div>
      <p>
        Afin de recevoir une alerte directement sur cet appareil lorsqu'un patient réserve un créneau,
        vous devez activer les notifications.
      </p>
    </div>
    <v-card-actions>
      <v-btn @click="onDecline()">Refuser</v-btn>
      <v-btn @click="onAccept()" severity="warning" :loading="isInstalling">Accepter</v-btn>
    </v-card-actions>
  </v-dialog>
</template>

<script lang="ts">
import {Component, Vue} from "vue-facing-decorator";
import {Container} from "typedi";
import PwaService from "@/services/pwa.service";

@Component
export default class PwaPrompt extends Vue{
  private readonly pwaService = Container.get(PwaService)

  show = false
  isInstalling = false

  async mounted(): Promise<void> {
    if (this.pwaService.canIUsePushNotification()) {
      this.pwaService.start({
        beforeinstallprompt: () => this.onBeforeInstallPrompt(),
        appinstalled: () => this.onInstalled()
      })
    }
    this.pwaService.isNotificationEnabled().then(isEnabled => this.show = !isEnabled)
  }

  onBeforeInstallPrompt () {
    // this.show = true
  }

  onInstalled () {
    this.show = false
  }

  onDecline (): void {
    this.show = false
  }

  onAccept (): void {
    this.isInstalling = true
    this.pwaService.activateNotification().then(() => {
      this.isInstalling = false
      this.show = false
    })
    // this.pwaService.install().then(() => {
    //   this.isInstalling = false
    //   this.show = false
    // })
  }
}
</script>

<style lang="scss">
</style>
