<template>
  <div class="Header" :class="{ minimized: minimized }">
    <div class="Header-top">
      <div class="Header-top-title">
        <div class="Header-top-title-links">
          <h4>Cabinet d'ostéopathie de Roselyne Lean</h4>
          <Location/>
          <Phone/>
        </div>
        <div class="Header-top-title-hexagons" @click="minimized = !minimized">
          <Hexagon :width="35" image="images/rose.jpg"/>
          <Hexagon :width="35" image="images/anais.jpg"/>
        </div>
      </div>
      <div class="Header-top-menu">
        <Button
          v-for="(menuItem, index) of menuItems"
          class="Header-top-menu-item"
          color="white"
          :icon="menuItem.icon"
          :label="menuItem.label"
          :active="isMenuItemActive(index)"
          :outlined="!isMenuItemActive(index)"
          @click="onMenuItemClicked(menuItem)"
        />
      </div>
    </div>

    <div class="Header-top minimalistic">
      <div class="Header-top-title">
        <h4>Cabinet d'ostéopathie</h4>
        <h4>de Roselyne Lean</h4>
      </div>
      <template v-if="!isOnAdminPage">
        <div class="Header-top-links">
          <Phone :no-text="true"/>
          <Location :no-text="true"/>
          <RouterLink v-if="isPractitioner" class="dark" :to="adminMenuItem.url!">
            <v-icon icon="mdi-cog"/>
          </RouterLink>
        </div>
      </template>
      <template v-else>
        <div class="Header-top-links">
          <RouterLink class="dark" :to="adminMenuItems[0].url!">
            <v-icon icon="mdi-apps"/>
          </RouterLink>
        </div>
      </template>
    </div>

    <HeaderHexagons v-if="!minimized"/>
  </div>
</template>

<script lang="ts">
import RoutePath from "@shared/types/route.enum";
import AuthenticationHttpService from "../../services/http/authentication.http-service";
import {Role} from "@shared/types/role.enum";
import {Component, Emit, Vue} from "vue-facing-decorator";
import type {HeaderMenuItem} from "@/components/_design-system/types";
import Hexagon from "@/components/_design-system/Hexagon.vue";
import {Container} from "typedi";
import HeaderHexagons from "@/components/_design-system/HeaderHexagons.vue";
import Phone from "@/components/_design-system/Phone.vue";
import Location from "@/components/_design-system/Location.vue";
import Button from "@/components/_design-system/Button.vue";

@Component({
  components: {Button, Location, Phone, HeaderHexagons, Hexagon}
})
export default class Header extends Vue {
  private readonly authenticationHttpService = Container.get(AuthenticationHttpService)

  minimized = false
  appMenuItems: HeaderMenuItem[] = [
    { label: 'Prendre rendez-vous', icon: 'mdi-calendar', command: () => this.toggleMinimization() },
    { label: 'Infos pratiques', icon: 'mdi-map-marker', command: () => this.clickInfosMenuItem() },
    { label: 'L\'ostéopathie', icon: 'mdi-help', command: () => this.clickOsteopathyMenuItem() },
  ]
  adminMenuItems: HeaderMenuItem[] = [
    { label: 'App', icon: 'mdi-apps', url: RoutePath.APP },
    { label: 'Admin', icon: 'mdi-cog', url: RoutePath.ADMIN }
  ]
  adminMenuItem: HeaderMenuItem = { label: 'Admin', icon: 'mdi-cog', url: RoutePath.ADMIN }

  get path(): string {
    return this.$router.currentRoute.value.path
  }

  get isOnAdminPage(): boolean {
    return this.path === RoutePath.ADMIN
  }

  get isPractitioner(): boolean {
    return this.authenticationHttpService.isAuthenticated(Role.PRACTITIONER)
  }

  get menuItems(): HeaderMenuItem[] {
    if (this.isOnAdminPage) {
      this.minimized = true
      return this.adminMenuItems
    }
    if (!this.isPractitioner) {
      return this.appMenuItems
    }
    return [
      ...this.appMenuItems,
      this.adminMenuItem
    ]
  }

  @Emit()
  clickInfosMenuItem() {
  }

  @Emit()
  clickOsteopathyMenuItem() {
  }

  onMenuItemClicked(menuItem: HeaderMenuItem) {
    if (menuItem.command) {
      menuItem.command()
    }
    if (menuItem.url) {
      this.$router.push(menuItem.url)
    }
  }

  toggleMinimization() {
    this.minimized = !this.minimized
  }

  isMenuItemActive(index: number): boolean {
    if (this.path === RoutePath.ADMIN) {
      return index === 1
    }
    return index === 0
  }
}
</script>

<style lang="scss">
.Header {
  color: rgba(var(--v-theme-white));
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(var(--v-theme-primary));
  border-radius: 0 0 1rem 1rem;
  padding: 1rem;

  h4 {
    margin: 0;
  }

  &-top {
    width: 100%;
    flex-grow: 1;
    display: flex;
    justify-content: space-between;

    &.minimalistic {
      display: none;
    }

    &-title {
      display: flex;
      gap: .5rem;
      flex-direction: column;
      &-links {
        display: flex;
        gap: .3rem;
        flex-direction: column;
        &.minimized {
          display: none;
        }
      }
      &-hexagons {
        display: none;
      }
      .pi {
        margin-right: .5rem;
      }
      a {
        font-size: .8rem;
        color: var(--primary-50);
        font-weight: normal;
      }
    }

    &-menu {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      text-align: center;
      &-item .pi {
        margin-right: .5rem;
      }
    }
  }

  &-hexagons {
    transition: height .5s ease;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }
}

.Header.minimized {
  .Header {
    &-top {
      align-items: center;
      &-name {
        display: none;
      }
      &-title {
        flex-direction: row;
        align-items: center;
        &-links.minimized {
          display: block;
        }
        &-links:not(.minimized) {
          display: none;
        }
        &-hexagons {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          margin-right: 1rem;
        }
        .pi {
          font-size: 1.2rem;
          border: .5px solid;
          border-radius: 50%;
          padding: .5rem;
        }
      }
    }
  }
}

@media (max-width: 1100px) {
  .Header {
    &-top {
      &:not(.minimalistic) {
        display: none;
      }
      &.minimalistic {
        display: flex;
        align-items: center;
      }

      &-title {
        gap: 0;
        flex-direction: column !important;
        align-items: baseline !important;
      }

      &-links {
        display: flex;
        gap: 1rem;
        .pi {
          font-size: 1.2rem;
          border: .5px solid;
          border-radius: 50%;
          padding: .5rem;
        }
      }
    }

    &-hexagons {
      display: none;
    }
  }
}
</style>
