import {Component, OnInit} from "@angular/core";
import {DialogModule} from "primeng/dialog";
import {Button} from "primeng/button";
import PwaService from "../../../services/pwa.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'op-pwa-prompt',
  standalone: true,
  imports: [
    DialogModule,
    Button,
    NgIf
  ],
  templateUrl: './pwa-prompt.component.html',
  styleUrl: './pwa-prompt.component.scss'
})
export class PwaPromptComponent implements OnInit {
  show = false
  isInstalling = false

  constructor(
    private readonly pwaService: PwaService
  ) {
  }

  async ngOnInit(): Promise<void> {
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
    console.log("here")
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
