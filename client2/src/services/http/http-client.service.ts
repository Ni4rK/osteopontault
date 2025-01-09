import {CacheService} from "../cache.service";
import {TokenBearer, TokenHeader} from "@shared/types/token-header.type";
import ToasterService from "../snackbar/toaster.service";
import Environment from "@/utils/environment";
import {Axios, AxiosError} from "axios";
import Exception from "@/utils/exception";
import {Container, Service} from "typedi";

@Service()
export default class HttpClientService {
  private readonly cacheService = Container.get(CacheService)
  private readonly toastService = Container.get(ToasterService)
  private readonly axiosInstance: Axios = new Axios({
    baseURL: Environment.getApiUrl(),
  })

  public async get<T>(path: string): Promise<T> {
    try {
      const token = this.cacheService.cache.authenticationToken
      const response = await this.axiosInstance
        .get<T>(path, token ? {
          headers: {
            [TokenHeader]: `${TokenBearer} ${token}`
          }
        } : {});
      return JSON.parse(response.data as string);
    } catch (error) {
      this.handleError(error)
      throw new Exception(`Error on request GET ${path}`, error)
    }
  }

  public async post<T, B>(path: string, body: B): Promise<T> {
    try {
      const token = this.cacheService.cache.authenticationToken
      const response = await this.axiosInstance
        .post<T>(path, JSON.stringify(body), token ? {
          headers: {
            'Content-Type': 'application/json',
            [TokenHeader]: `${TokenBearer} ${token}`
          }
        } : {});
      return JSON.parse(response.data as string);
    } catch (error) {
      this.handleError(error)
      throw new Exception(`Error on request GET ${path}`, error)
    }
  }

  public async patch<T, B>(path: string, body: B): Promise<T> {
    try {
      const token = this.cacheService.cache.authenticationToken
      const response = await this.axiosInstance
        .patch<T>(path, JSON.stringify(body), token ? {
          headers: {
            'Content-Type': 'application/json',
            [TokenHeader]: `${TokenBearer} ${token}`
          }
        } : {});
      return JSON.parse(response.data as string);
    } catch (error) {
      this.handleError(error)
      throw new Exception(`Error on request GET ${path}`, error)
    }
  }

  public async delete(path: string): Promise<void> {
    try {
      const token = this.cacheService.cache.authenticationToken
      const response = await this.axiosInstance
        .delete(path, token ? {
          headers: {
            [TokenHeader]: `${TokenBearer} ${token}`
          }
        } : {});
      return JSON.parse(response.data as string);
    } catch (error) {
      this.handleError(error)
      throw new Exception(`Error on request DELETE ${path}`, error)
    }
  }

  private handleError(error: unknown) {
    if (error instanceof AxiosError) {
      if (error.status === 410) {
        this.toastService.sendToast({
          type: "info",
          message: "Votre session a expirée, la page va s'actualiser pour démarrer une nouvelle session",
        })
        this.cacheService.set({
          authenticationToken: null,
          role: null
        })
        window.setTimeout(() => window.location.reload(), 2000)
      }
      if (error.status === 401) {
        this.toastService.sendToast({
          type: "error",
          message: "Impossible de vous authentifier"
        })
      }
    }
  }
}
