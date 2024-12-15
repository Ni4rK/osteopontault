import {Component, OnInit} from '@angular/core';
import {Button} from "primeng/button";
import {HeaderComponent} from "../_design-system/header/header.component";
import {NextAppointmentComponent} from "../app/next-appointment/next-appointment.component";
import AuthenticationService from "../../services/authentication.service";
import {Role} from "@shared/types/role.enum";
import {NgForOf, NgIf, NgStyle} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {Practitioner} from "@shared/types/practitioner.enum";
import {CalendarModule} from "primeng/calendar";
import {DividerModule} from "primeng/divider";
import {CacheService} from "../../services/cache.service";
import {LoginComponent} from "./login/login.component";
import {LogoutComponent} from "./logout/logout.component";
import {AvailabilityListComponent} from "./availability-list/availability-list.component";
import {ToasterComponent} from "../_design-system/toaster/toaster.component";
import {PwaPromptComponent} from "./pwa-prompt/pwa-prompt.component";
import DateHelper from "@shared/helpers/date.helper";
import DateFormat from "@shared/types/date-format.enum";
import {SessionsListComponent} from "./sessions-list/sessions-list.component";

@Component({
  selector: 'op-admin',
  standalone: true,
  imports: [
    Button,
    HeaderComponent,
    NextAppointmentComponent,
    NgIf,
    FormsModule,
    InputTextModule,
    NgForOf,
    NgStyle,
    CalendarModule,
    DividerModule,
    LoginComponent,
    LogoutComponent,
    AvailabilityListComponent,
    ToasterComponent,
    PwaPromptComponent,
    SessionsListComponent
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  protected readonly DateHelper = DateHelper;
  protected readonly DateFormat = DateFormat;

  isShowingAvailabilities = true
  username: string | null = null
  isAuthenticatedAsPractitioner = false

  get practitioner(): Practitioner | null {
    return this.username as Practitioner | null
  }

  constructor(
    private readonly cacheService: CacheService,
    private readonly authenticationService: AuthenticationService,
  ) {
  }

  ngOnInit() {
    this.username = this.cacheService.cache.username
    this.isAuthenticatedAsPractitioner = this.authenticationService.isAuthenticated(Role.PRACTITIONER)
  }

  onLoggedIn() {
    this.username = this.cacheService.cache.username
    this.isAuthenticatedAsPractitioner = true
  }

  onSwitchScreenShown() {
    this.isShowingAvailabilities = !this.isShowingAvailabilities
  }
}
