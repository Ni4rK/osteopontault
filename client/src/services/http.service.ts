import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, map, Observable, of, throwError} from "rxjs";
import {Injectable} from "@angular/core";
import {environment} from "../environments/environment";
import {CacheService} from "./cache.service";
import {TokenBearer, TokenHeader} from "@shared/types/token-header.type";
import ToasterService from "./toaster.service";

@Injectable({ providedIn: 'root' })
export default class HttpService {
  private readonly apiUrl: string

  constructor(
    private readonly client: HttpClient,
    private readonly cacheService: CacheService,
    private readonly toastService: ToasterService
  ) {
    this.apiUrl = environment.apiUrl
  }

  public get<T>(path: string): Observable<T> {
    const token = this.cacheService.cache.authenticationToken
    return this.client.get<T>(`${this.apiUrl}${path}`, token ? {
      headers: {
        [TokenHeader]: `${TokenBearer} ${token}`
      }
    } : {}).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.toastService.sendToast({
            severity: "info",
            summary: "Votre session a expirée, la page va s'actualiser pour démarrer une nouvelle session"
          })
          this.cacheService.set({
            authenticationToken: null,
            role: null
          })
          window.setTimeout(() => window.location.reload(), 2000)
          return of()
        }
        return throwError(error)
      })
    )
  }

  public post<T, B>(path: string, body: B): Observable<T> {
    const token = this.cacheService.cache.authenticationToken
    return this.client.post<T>(`${this.apiUrl}${path}`, body, token ? {
      headers: {
        [TokenHeader]: `${TokenBearer} ${token}`
      }
    } : {}).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.toastService.sendToast({
            severity: "info",
            summary: "Votre session a expirée, la page va s'actualiser pour démarrer une nouvelle session"
          })
          this.cacheService.set({
            authenticationToken: null,
            role: null
          })
          window.setTimeout(() => window.location.reload(), 2000)
          return of()
        }
        return throwError(error)
      })
    )
  }

  public patch<T, B>(path: string, body: B): Observable<T> {
    const token = this.cacheService.cache.authenticationToken
    return this.client.patch<T>(`${this.apiUrl}${path}`, body, token ? {
      headers: {
        [TokenHeader]: `${TokenBearer} ${token}`
      }
    } : {}).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.toastService.sendToast({
            severity: "info",
            summary: "Votre session a expirée, la page va s'actualiser pour démarrer une nouvelle session"
          })
          this.cacheService.set({
            authenticationToken: null,
            role: null
          })
          window.setTimeout(() => window.location.reload(), 2000)
          return of()
        }
        return throwError(error)
      })
    )
  }

  public delete<T>(path: string): Observable<T> {
    const token = this.cacheService.cache.authenticationToken
    return this.client.delete<T>(`${this.apiUrl}${path}`, token ? {
      headers: {
        [TokenHeader]: `${TokenBearer} ${token}`
      }
    } : {}).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.toastService.sendToast({
            severity: "info",
            summary: "Votre session a expirée, la page va s'actualiser pour démarrer une nouvelle session"
          })
          this.cacheService.set({
            authenticationToken: null,
            role: null
          })
          window.setTimeout(() => window.location.reload(), 2000)
          return of()
        }
        return throwError(error)
      })
    )
  }
}
