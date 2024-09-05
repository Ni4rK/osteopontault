import {Component, EventEmitter, Output} from '@angular/core';
import {HexagonComponent} from "../hexagon/hexagon.component";
import {Button} from "primeng/button";
import {TabMenuModule} from "primeng/tabmenu";
import {MenuItem} from "primeng/api";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {DividerModule} from "primeng/divider";
import RoutePath from "@shared/types/route.enum";
import {Router} from "@angular/router";
import AuthenticationService from "../../../services/authentication.service";
import {Role} from "@shared/types/role.enum";

@Component({
  selector: 'op-header',
  standalone: true,
  imports: [
    HexagonComponent,
    Button,
    TabMenuModule,
    NgForOf,
    DividerModule,
    NgIf,
    NgClass
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Output() clickInfosMenuItem = new EventEmitter<void>()
  @Output() clickOsteopathyMenuItem = new EventEmitter<void>()
  @Output() clickAdminMenuItem = new EventEmitter<void>()

  minimized = false

  appMenuItems: MenuItem[] = [
    { label: 'Prendre rendez-vous', icon: 'pi pi-fw pi-calendar', command: () => this.minimized = !this.minimized },
    { label: 'Infos pratiques', icon: 'pi pi-fw pi-map-marker', command: () => this.clickInfosMenuItem.emit() },
    { label: 'L\'ostéopathie', icon: 'pi pi-fw pi-question', command: () => this.clickOsteopathyMenuItem.emit() },
  ];
  adminMenuItems: MenuItem[] = [
    { label: 'App', icon: 'pi pi-fw pi-th-large', url: `/${RoutePath.APP}` },
    { label: 'Admin', icon: 'pi pi-fw pi-cog', url: `/${RoutePath.ADMIN}` }
  ];
  adminMenuItem: MenuItem = { label: 'Admin', icon: 'pi pi-fw pi-cog', url: `/${RoutePath.ADMIN}` }

  get path(): string {
    return this.router.url.substring(1)
  }

  get isOnAdminPage(): boolean {
    return this.path === RoutePath.ADMIN
  }

  get isPractitioner(): boolean {
    return this.authenticationService.isAuthenticated(Role.PRACTITIONER)
  }

  get menuItems(): MenuItem[] {
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

  constructor(
    private readonly router: Router,
    private readonly authenticationService: AuthenticationService
  ) {
  }

  isMenuItemActive(index: number): boolean {
    if (this.path === RoutePath.ADMIN) {
      return index === 1
    }
    return index === 0
  }
}
