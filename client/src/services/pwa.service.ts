import {isPwaBeforeInstallPromptEvent, PwaBeforeInstallPromptEvent, PwaHooks} from "@shared/types/pwa.types";
import {
  PWA_SERVICE_WORKER_SCOPE,
  PWA_SERVICE_WORKER_SCRIPT_PATH,
  PWA_VAPID_PUBLIC_KEY_DEV,
  PWA_VAPID_PUBLIC_KEY_PROD
} from "@shared/helpers/configuration";
import HttpClientService from "./http/http-client.service";
import {MemberPwaSubscriptionHttpBody} from "@shared/types/http-body.types";
import HttpPath from "@shared/types/http-path.enum";
import {isFunction} from "@shared/helpers/common-types.guards";
import Environment from "@/utils/environment";
import {Container, Service} from "typedi";

@Service()
export default class PwaService {
  private readonly httpClientService = Container.get(HttpClientService)

  private hooks: PwaHooks = {}
  private deferredInstallPrompt: PwaBeforeInstallPromptEvent | null = null
  private registration: Promise<ServiceWorkerRegistration | undefined> | null = null
  private subscription: Promise<PushSubscription | null> | null = null

  start(hooks: PwaHooks): void {
    const vanillaEvent = 'osteopontault_pwa_beforeinstallpromptevent' in window ? window['osteopontault_pwa_beforeinstallpromptevent'] : null
    if (!this.canIUseServiceWorkers()) {
      console.error("[PWA] Service workers are not supported by your browser")
      return
    }
    this.hooks = hooks
    if (isPwaBeforeInstallPromptEvent(vanillaEvent)) {
      this.handleBeforeInstallPrompt(vanillaEvent)
    } else {
      window.addEventListener('beforeinstallprompt', (event) => {
        if (isPwaBeforeInstallPromptEvent(event)) {
          this.handleBeforeInstallPrompt(event)
        } else {
          console.error('[PWA] Event is not of type PwaBeforeInstallPromptEvent', event)
        }
      })
      if (isFunction(this.hooks.appinstalled)) {
        window.addEventListener('appinstalled', this.hooks.appinstalled)
      }
    }
    navigator.serviceWorker
      .getRegistration()
      .then(registration => {
        if (!registration || !registration.active) {
          return this.register()
        }
        if (!registration.active.scriptURL.endsWith(PWA_SERVICE_WORKER_SCRIPT_PATH)) {
          return registration.unregister().then(() => this.register())
        }
        return registration
      })
      .then(registration => this.listen(registration))
  }

  install(): Promise<void> {
    if (this.deferredInstallPrompt) {
      this.deferredInstallPrompt.prompt()
      return this.deferredInstallPrompt.userChoice.then(() => {
        this.deferredInstallPrompt = null
      })
    }
    return Promise.reject(new Error('[PWA] Unable to install PWA: beforeinstallprompt event not fired'))
  }

  isNotificationEnabled(): Promise<boolean> {
    return this.getCurrentSubscription().then(subscription => {
      return subscription instanceof PushSubscription
    })
  }

  canIUsePushNotification(): boolean {
    return (
      window &&
      navigator &&
      ('Notification' in window) &&
      ('serviceWorker' in navigator)
    )
  }

  getNotificationPermission(): Promise<string> {
    return this.getCurrentRegistration().then(registration => {
      return (registration && Notification && Notification.permission) || 'denied'
    })
  }

  activateNotification(): Promise<void> {
    return this.getCurrentRegistration().then(registration => {
      if (!registration) {
        return Promise.reject(new Error('[PWA] Service worker is not installed'))
      }
      if (Notification.permission === 'denied') {
        return Promise.reject(new Error('[PWA] You have denied the Notifications! Please enable them on your browser'))
      }
      if (Notification.permission === 'granted') {
        return this.subscribe(registration)
      }
      return Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
          return Promise.reject(new Error('[PWA] Notification permission is not granted'))
        }
        return this.subscribe(registration)
      })
    })
  }

  private handleBeforeInstallPrompt(event: PwaBeforeInstallPromptEvent) {
    console.info('[SW]: beforeinstallprompt event fired')
    event.preventDefault()
    this.deferredInstallPrompt = event
    if (isFunction(this.hooks.beforeinstallprompt)) {
      this.hooks.beforeinstallprompt()
    }
  }

  private register(): Promise<ServiceWorkerRegistration> {
    const options = {
      scope: PWA_SERVICE_WORKER_SCOPE
    }
    return navigator.serviceWorker
      .register(PWA_SERVICE_WORKER_SCRIPT_PATH, options)
      .then(() => {
        return navigator.serviceWorker.ready.then(registration => {
          this.registration = Promise.resolve(registration)
          return registration
        })
      })
  }

  private listen(registration: ServiceWorkerRegistration): void {
    registration.onupdatefound = () => {
      if (registration.installing) {
        const newWorker = registration.installing
        newWorker.onstatechange = () => {
          if (newWorker.state === 'installed') {
            if (document && registration && registration.waiting) {
              registration.waiting.postMessage({type: 'SKIP_WAITING'})
            }
          }
        }
      }
    }
    if (isFunction(this.hooks.updated)) {
      navigator.serviceWorker.addEventListener('controllerchange', this.hooks.updated)
    }
  }

  private subscribe(registration: ServiceWorkerRegistration): Promise<void> {
    return this.getCurrentSubscription().then(subscription => {
      if (Notification.permission !== 'granted') {
        return Promise.reject(new Error('[PWA] Notifications are not granted'))
      }
      const options = {
        // visible par le user: cet argument est là à titre informatif (=deprecated et toujours = à true) pour expliquer qu'une notification push sera forcément visible par le user sur son mobile
        userVisibleOnly: true,
        applicationServerKey: Environment.isDevelopment() ? PWA_VAPID_PUBLIC_KEY_PROD : PWA_VAPID_PUBLIC_KEY_DEV
      }
      this.subscription = subscription ? Promise.resolve(subscription) : registration.pushManager.subscribe(options)
      return this.subscription.then(subscription => {
        if (subscription) {
          return this.saveSubscription(subscription)
        }
        return Promise.reject(new Error('[PWA] Subscription failed, unable to save it'))
      })
    })
  }

  private canIUseServiceWorkers(): boolean {
    return !!(
      navigator &&
      navigator.serviceWorker &&
      ServiceWorkerRegistration
    )
  }

  private getCurrentRegistration(): Promise<ServiceWorkerRegistration | undefined> {
    if (this.registration === null) {
      if (!this.canIUseServiceWorkers()) {
        return Promise.reject(new Error('[PWA] Unable to get current registration: service workers are not supported on your browser'))
      }
      return navigator.serviceWorker.getRegistration()
    }
    return this.registration
  }

  private getCurrentSubscription(): Promise<PushSubscription | null> {
    if (this.subscription === null) {
      this.subscription = this.getCurrentRegistration().then(registration => {
        if (registration) {
          return registration.pushManager.getSubscription()
        }
        return null
      })
    }
    return this.subscription
  }

  private saveSubscription(subscription: PushSubscription): Promise<void> {
    const subscriptionData: PushSubscriptionJSON = subscription.toJSON()

    if (subscriptionData && subscriptionData.keys && subscriptionData.endpoint) {
      return this.httpClientService
        .patch<void, MemberPwaSubscriptionHttpBody>(
          HttpPath.MEMBER_PWA_SUBSCRIPTION, {
            endpoint: subscriptionData.endpoint,
            expirationTime: subscriptionData.expirationTime ?? null,
            p256dh: subscriptionData.keys!['p256dh'],
            authToken: subscriptionData.keys!['auth']
          }
        )
    }

    console.info('[PWA] Push subscription not available')
    return Promise.resolve()
  }
}
