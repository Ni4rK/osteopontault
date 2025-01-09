import type {Toast} from "@shared/types/toast.type";

export default interface SnackbarComponentInterface {
  showSnackbar: boolean
  toasts: Toast[]
}
