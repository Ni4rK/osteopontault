import {Component, OnInit} from "@angular/core";
import {ToastModule} from "primeng/toast";
import {Message, MessageService} from "primeng/api";
import ToasterService from "../../../services/toaster.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'op-toaster',
  standalone: true,
  imports: [
    ToastModule,
    NgIf
  ],
  templateUrl: './toaster.component.html',
  styleUrl: './toaster.component.scss',
})
export class ToasterComponent implements OnInit {
  constructor(
    private readonly messageService: MessageService,
    private readonly toasterService: ToasterService,
  ) {
  }

  ngOnInit() {
    this.toasterService.setToastCallback(this.sendToast)
    if (this.toasterService.pendingMessages.length) {
      window.setTimeout(() => {
        this.toasterService.pendingMessages.forEach(message => {
          this.sendToast(message)
        })
        this.toasterService.pendingMessages = []
      }, 1500)
    }
  }

  sendToast(message: Message) {
    this.messageService.add(message)
  }
}
