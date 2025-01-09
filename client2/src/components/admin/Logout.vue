<template>
  <div class="Logout">
    <v-btn
      color="primary"
      icon="mdi-logout"
      @click="onLogout()"
    />
  </div>
</template>

<script lang="ts">
import {Component, Emit, Vue} from "vue-facing-decorator";
import {Container} from "typedi";
import {CacheService} from "@/services/cache.service";
import ToasterService from "@/services/snackbar/toaster.service";

@Component
export default class Logout extends Vue {
  @Emit() loggedOut() {}

  private readonly cacheService = Container.get(CacheService)
  private readonly toastService = Container.get(ToasterService)

  onLogout() {
    this.cacheService.set({
      authenticationToken: null,
      role: null
    })
    this.toastService.sendToast({
      type: "success",
      message: "Déconnecté"
    })
    this.loggedOut()
  }
}
</script>

<style lang="scss">
.Logout {
  z-index: 1;
  position: fixed;
  bottom: 1rem;
  right: 2rem;
  @media (max-width: 1100px) {
    bottom: 5px;
    right: 5px;
  }
}
</style>
