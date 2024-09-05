import {Component} from "@angular/core";
import RoutePath from "@shared/types/route.enum";
import {Router} from "@angular/router";
import {CacheService} from "../../../services/cache.service";
import {Button} from "primeng/button";
import ToasterService from "../../../services/toaster.service";

@Component({
  selector: 'op-logout',
  standalone: true,
  imports: [
    Button,
    Button
  ],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutComponent {
  constructor(
    private readonly router: Router,
    private readonly cacheService: CacheService,
    private readonly toastService: ToasterService
  ) {
  }

  onLogout() {
    this.cacheService.set({
      authenticationToken: null,
      role: null
    })
    this.toastService.sendToast({
      severity: "success",
      summary: "Déconnecté"
    })
    this.router.navigate([RoutePath.APP])
  }
}
