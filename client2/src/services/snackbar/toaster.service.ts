import {Service} from "typedi";
import type SnackbarComponentInterface from "@/services/snackbar/snackbar-component.interface";
import type {Toast} from "@/components/_design-system/types.ts";

@Service()
export default class ToasterService {
  lastId = 0
  pendingToasts: Toast[] = []
  snackbar: SnackbarComponentInterface | null = null

  public setSnackbarComponent(snackbar: SnackbarComponentInterface) {
    this.snackbar = snackbar
    if (this.pendingToasts.length) {
      this.snackbar.toasts.push(...this.pendingToasts)
    }
  }

  public sendToast(toastWithoutId: Omit<Toast, "id">) {
    const toast: Toast = {
      id: ++this.lastId,
      ...toastWithoutId
    }
    if (!this.snackbar) {
      this.pendingToasts.push(toast)
    } else {
      this.snackbar.toasts.push(toast)
    }
  }
}
