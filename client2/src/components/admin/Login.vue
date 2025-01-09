<template>
  <form class="Login" @submit="onLogin($event)">
    <v-text-field
      v-model="username"
      name="username"
      autocomplete="username"
      placeholder="Identifiant"
      variant="outlined"
      density="compact"
      min-width="200"
      required
      hide-details
      rounded
    />
    <v-text-field
      v-model="password"
      name="password"
      autocomplete="current-password"
      placeholder="Mot de passe"
      variant="outlined"
      density="compact"
      min-width="200"
      required
      hide-details
      rounded
      :type="showPassword ? 'text' : 'password'"
      :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
      @click:append-inner="showPassword = !showPassword"
    />
    <Button
      label="Se connecter"
      type="submit"
      min-width="200"
      :active="true"
      :loading="isAuthenticatingAsPractitioner"
    />
  </form>
</template>

<script lang="ts">
import {Component, Emit, Vue} from "vue-facing-decorator";
import {Container} from "typedi";
import AuthenticationHttpService from "@/services/http/authentication.http-service";
import ToasterService from "@/services/snackbar/toaster.service";
import {Role} from "@shared/types/role.enum";
import Button from "@/components/_design-system/Button.vue";

@Component({
  components: {Button}
})
export default class Login extends Vue{
  @Emit() loggedIn() {}

  private readonly authenticationService = Container.get(AuthenticationHttpService)
  private readonly toastService = Container.get(ToasterService)

  showPassword = false
  username: string | null = null
  password: string | null = null
  isAuthenticatingAsPractitioner = false

  async onLogin(event: Event) {
    event.preventDefault()
    if (this.username && this.password) {
      this.isAuthenticatingAsPractitioner = true
      await this.authenticationService.authenticate(Role.PRACTITIONER, {
        username: this.username,
        password: this.password
      })
      this.isAuthenticatingAsPractitioner = false
      this.toastService.sendToast({
        type: "success",
        message: `Connecté en tant que ${this.username}`
      })
      this.isAuthenticatingAsPractitioner = false
      this.loggedIn()
    }
  }
}
</script>

<style lang="scss">
.Login {
  width: 600px;
  max-width: 100vw;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  @media (max-width: 1000px) {
    flex-direction: column;
  }
}
</style>
