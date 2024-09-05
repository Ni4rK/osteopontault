import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {provideRouter, withHashLocation} from '@angular/router';
import { routes } from './main.routes';
import {provideAnimations} from "@angular/platform-browser/animations";
import {provideHttpClient} from "@angular/common/http";
import AuthenticationService from "../services/authentication.service";
import {CacheService} from "../services/cache.service";
import HttpService from "../services/http.service";
import {MessageService} from "primeng/api";

export const mainConfig: ApplicationConfig = {
  providers: [
    { provide: MessageService, useClass: MessageService },
    { provide: HttpService, useClass: HttpService },
    { provide: AuthenticationService, useClass: AuthenticationService },
    { provide: CacheService, useClass: CacheService },
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideAnimations(),
  ]
};
