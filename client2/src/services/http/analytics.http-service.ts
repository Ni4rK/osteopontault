import HttpClientService from "./http-client.service";
import HttpPath from "@shared/types/http-path.enum";
import {AnalyticsPutHttpBody} from "@shared/types/http-body.types";
import {AnalyticsActionsForSession} from "@shared/types/analytics.types";
import {Container, Service} from "typedi";
import Exception from "@/utils/exception";

@Service()
export default class AnalyticsHttpService {
  private readonly httpClientService = Container.get(HttpClientService)

  public async list(from: Date, to?: Date): Promise<AnalyticsActionsForSession[]> {
    const query: string[] = []
    query.push(`from=${from.toISOString()}`)
    if (to) {
      query.push(`to=${to.toISOString()}`)
    }
    try {
      return this.httpClientService.get<AnalyticsActionsForSession[]>(`${HttpPath.ANALYTICS_GET}?${query.join('&')}`)
    } catch (error) {
      console.error(error)
      throw new Exception(`Unable to get sessions from ${from} to ${to}`)
    }
  }

  public async put(actionsForSession: AnalyticsActionsForSession): Promise<void> {
    try {
      return this.httpClientService.post<void, AnalyticsPutHttpBody>(HttpPath.ANALYTICS_POST, actionsForSession)
    } catch (error) {
      console.error(error)
    }
  }
}
