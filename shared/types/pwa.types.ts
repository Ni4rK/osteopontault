import {isFunction} from "../helpers/common-types.guards";

export interface PwaBeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: boolean }>;
}

export function isPwaBeforeInstallPromptEvent (value: unknown): value is PwaBeforeInstallPromptEvent {
  return (
    value instanceof Event &&
    'prompt' in value &&
    isFunction(value['prompt']) &&
    'userChoice' in value
    // && value['userChoice'] instanceof Promise // doesn't work
  )
}

export interface PwaHooks {
  beforeinstallprompt?: () => void;
  appinstalled?: () => void;
  updated?: () => void;
}
