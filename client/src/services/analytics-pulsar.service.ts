import {AnalyticsAction, type AnalyticsActionData, type AnalyticsActionsForSession} from "@shared/types/analytics.types";
import AnalyticsHttpService from "./http/analytics.http-service";
import {CacheService} from "./cache.service";
import {Container, Service} from "typedi";

@Service()
export default class AnalyticsPulsarService {
  private readonly analyticsHttpService = Container.get(AnalyticsHttpService)
  private readonly cacheService = Container.get(CacheService)

  PULSE_TIMEOUT = 4       // pulse (send actions through http requests) will occur every `PULSE_TIMEOUT` seconds
  INACTIVITY_DELAY = 15   // delay (seconds) before pausing the pulse (last action will be INACTIVE)
  EXITED_DELAY = 45       // delay (seconds) before considering the session stopped (removing the sessionId)

  // important actions need to be pulsed right away (and don't wait the end of timeout)
  IMPORTANT_ACTIONS = [
    AnalyticsAction.__SESSION_INIT, // first connection, initiate the regular pulse
    AnalyticsAction.APPOINTMENT_CANCELED, // the user may leave the app, record the action now!
    AnalyticsAction.APPOINTMENT_BOOKED, // the user may leave the app, record the action now!
  ]

  // ignored actions avoid inactivity but won't be pushed to analytics
  IGNORED_ACTIONS = [
    AnalyticsAction.SLOTS_LIST_SCROLLED_A_BIT,
  ]

  started = false
  paused = false
  timeoutId: number | null = null
  actions: AnalyticsActionData[] = []
  lastActionExceptReadingDate = new Date()

  public start() {
    this.started = true
    this.actions = []
    this.init(true)
    this.action(AnalyticsAction.__SESSION_INIT)
  }

  public stop() {
    this.started = false
    this.cacheService.set({
      sessionId: null
    })
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId)
    }
  }

  public action<T extends object>(action: AnalyticsAction, data: T | null = null) {
    const now = new Date()
    let shouldPulse = this.IMPORTANT_ACTIONS.includes(action)

    if (!this.started || this.paused) {
      // user went back after inactivity:
      //  - if just a pause, let's resume (keep the session) + force the regular pule to start again
      //  - if not, let's start a new session + force the regular pulse to start again
      this.init(!this.started) // force new session only if pulsar was stopped
      this.started = true
      this.paused = false
      shouldPulse = true
      this.actions.push({
        action: this.paused ? AnalyticsAction.__SESSION_RESUMED : AnalyticsAction.__SESSION_INIT,
        date: now.toISOString(),
        data: null
      })
    }

    this.actions.push({
      action: action,
      date: now.toISOString(),
      data: data ? JSON.stringify(data) : null
    })

    if (action !== AnalyticsAction.READING) {
      this.lastActionExceptReadingDate = now
    }

    if (shouldPulse) {
      this.pulse()
    }
  }

  private init(forceNewSession: boolean) {
    if (!this.cacheService.cache.userId) {
      const newUserId = `${Date.now()}-${Math.round(1000 * Math.random())}`
      this.cacheService.set({
        userId: newUserId
      })
    }
    if (!this.cacheService.cache.sessionId || forceNewSession) {
      const newSessionId = `${Date.now()}-${Math.round(1000 * Math.random())}`
      this.cacheService.set({
        sessionId: newSessionId
      })
    }
  }

  private pulse() {
    this.init(false) // in case userId and sessionId aren't set in cache

    const isInactiveSession = this.isSessionInactive()
    const actionsForSessionToSend: AnalyticsActionsForSession = {
      userId: this.cacheService.cache.userId!,
      sessionId: this.cacheService.cache.sessionId!,
      sessionStartDate: new Date().toISOString(),
      sessionEndDate: new Date().toISOString(),
      actions: []
    }

    if (this.actions.length) {
      // there is actions already done by user (and recorded)
      const nonIgnoredActions = this.actions
        .filter((actionData) => !this.IGNORED_ACTIONS.includes(actionData.action))
      actionsForSessionToSend.actions.push(...nonIgnoredActions)
      actionsForSessionToSend.sessionStartDate = actionsForSessionToSend.actions[0].date
      actionsForSessionToSend.sessionEndDate = nonIgnoredActions[nonIgnoredActions.length - 1].date
      this.actions = []
    } else {
      // no action recorded => let's consider the user is reading
      actionsForSessionToSend.actions.push({
        action: isInactiveSession ? AnalyticsAction.__SESSION_INACTIVE : AnalyticsAction.READING,
        date: new Date().toISOString(),
        data: null
      })
    }

    // send the actions recorded
    if (actionsForSessionToSend.actions.length > 0) {
      this.analyticsHttpService.put(actionsForSessionToSend)
    }

    // handle inactivity + next pulse
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId)
    }
    if (isInactiveSession) {
      this.paused = true
      this.timeoutId = window.setTimeout(() => this.stop(), this.EXITED_DELAY * 1000)
    } else {
      this.timeoutId = window.setTimeout(() => this.pulse(), this.PULSE_TIMEOUT * 1000)
    }
  }

  private isSessionInactive(): boolean {
    const now = new Date()
    const secondsFromLastActionExceptReading = now.getTime() - this.lastActionExceptReadingDate.getTime()
    return secondsFromLastActionExceptReading > this.INACTIVITY_DELAY * 1000
  }
}
