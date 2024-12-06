import {Injectable} from "@angular/core";
import {Message, MessageService} from "primeng/api";

@Injectable({ providedIn: 'root' })
export default class ToasterService {
  callback: ((message: Message) => void) | null = null
  pendingMessages: Message[] = []

  public setToastCallback(callback: (message: Message) => void) {
    this.callback = callback
  }

  public sendToast(message: Message) {
    if (this.callback) {
      this.callback(message)
    } else {
      this.pendingMessages.push(message)
    }
  }
}
