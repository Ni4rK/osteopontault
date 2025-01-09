import type {Toast} from "@shared/types/toast.type";
import {Service} from "typedi";
import type SnackbarComponentInterface from "@/services/snackbar/snackbar-component.interface";

@Service()
export default class ToasterService {
  pendingToasts: Toast[] = []
  snackbar: SnackbarComponentInterface | null = null

  public setSnackbarComponent(snackbar: SnackbarComponentInterface) {
    this.snackbar = snackbar
    if (this.pendingToasts.length) {
      this.snackbar.toasts.push(...this.pendingToasts)
    }
  }

  public sendToast(toast: Toast) {
    if (!this.snackbar) {
      this.pendingToasts.push(toast)
    } else {
      this.snackbar.toasts.push(toast)
      this.snackbar.showSnackbar = true
    }
  }
}
