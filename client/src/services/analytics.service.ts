import HttpService from "./http.service";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import HttpPath from "@shared/types/http-path.enum";
import {AnalyticsPutHttpBody} from "@shared/types/http-body.types";
import {AnalyticsActionsForSession} from "@shared/types/analytics.types";

@Injectable({providedIn: 'root'})
export default class AnalyticsService {
  constructor(private readonly http: HttpService) {
  }

  public list(from: Date, to?: Date): Observable<AnalyticsActionsForSession[]> {
    const query: string[] = []
    const baseUrl = HttpPath.ANALYTICS_GET
    query.push(`from=${from.toISOString()}`)
    if (to) {
      query.push(`to=${to.toISOString()}`)
    }
    return this.http.get<AnalyticsActionsForSession[]>(`${baseUrl}?${query.join('&')}`)
  }

  public put(actionsForSession: AnalyticsActionsForSession): Observable<void> {
    return this.http.post<void, AnalyticsPutHttpBody>(HttpPath.ANALYTICS_POST, actionsForSession)
  }
}
