<template>
  <div class="Admin">
    <Header class="Admin-header"/>
    <Login
      v-if="!isAuthenticatedAsPractitioner"
      class="Admin-login"
      @logged-in="onLoggedIn()"
    />
    <div v-if="isAuthenticatedAsPractitioner && practitioner" class="Admin-container">
      <Button
        @click="onSwitchScreenShown()"
        class="Admin-screen-switcher"
        icon="mdi-bookmark-multiple"
        color="secondary"
        :active="true"
        :label="isShowingAvailabilities ? 'Activité du site' : 'Gestion des créneaux'"
      />
      <AvailabilityList
        v-if="isShowingAvailabilities"
        class="Admin-screen-content"
        :practitioner="practitioner"
      />
      <SessionsList
        v-if="!isShowingAvailabilities"
        class="Admin-screen-content"
      />
      <PwaPrompt/>
      <Logout @logged-out="onLoggedOut"/>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-facing-decorator";
import DateHelper from "@shared/helpers/date.helper";
import DateFormat from "@shared/types/date-format.enum";
import type {Practitioner} from "@shared/types/practitioner.enum";
import {Container} from "typedi";
import {CacheService} from "@/services/cache.service";
import AuthenticationHttpService from "@/services/http/authentication.http-service";
import {Role} from "@shared/types/role.enum";
import Header from "@/components/_design-system/Header.vue";
import Login from "@/components/admin/Login.vue";
import AvailabilityList from "@/components/admin/AvailabilityList.vue";
import PwaPrompt from "@/components/admin/PwaPrompt.vue";
import Logout from "@/components/admin/Logout.vue";
import Button from "@/components/_design-system/Button.vue";
import SessionsList from "@/components/admin/SessionsList.vue";

@Component({
  components: {SessionsList, Button, Logout, PwaPrompt, AvailabilityList, Login, Header}
})
export default class Admin extends Vue {
  private readonly cacheService = Container.get(CacheService)
  private readonly authenticationService = Container.get(AuthenticationHttpService)

  readonly DateHelper = DateHelper
  readonly DateFormat = DateFormat

  isShowingAvailabilities = true
  username: string | null = null
  isAuthenticatedAsPractitioner = false

  get practitioner(): Practitioner | null {
    return this.username as Practitioner | null
  }

  mounted() {
    this.username = this.cacheService.cache.username
    this.isAuthenticatedAsPractitioner = this.authenticationService.isAuthenticated(Role.PRACTITIONER)
  }

  onLoggedIn() {
    this.username = this.cacheService.cache.username
    this.isAuthenticatedAsPractitioner = true
  }

  onLoggedOut() {
    this.username = this.cacheService.cache.username
    this.isAuthenticatedAsPractitioner = false
  }

  onSwitchScreenShown() {
    this.isShowingAvailabilities = !this.isShowingAvailabilities
  }
}
</script>

<style lang="scss">
.Admin {
  display: flex;
  flex-direction: column;
  height: 100vh;

  &-login {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 3rem;
  }

  &-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    overflow: auto;
    padding: 3rem;
    @media (max-width: 1100px) {
      padding: 1rem;
    }
  }

  &-screen {
    &-content {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    &-switcher {
      position: absolute;
      top: 1rem;
      right: 1rem;
      @media (max-width: 1100px) {
        display: none;
      }
    }
  }
}
</style>
