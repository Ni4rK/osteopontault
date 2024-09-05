import {Role} from "@shared/types/role.enum";
import HttpService from "./http.service";
import {map, Observable, of} from "rxjs";
import {Injectable} from "@angular/core";
import {AuthCredentials} from "@shared/types/auth-credentials.type";
import {AuthTokenHttpBody} from "@shared/types/http-body.types";
import HttpPath from "@shared/types/http-path.enum";
import {CacheService} from "./cache.service";
import ToasterService from "./toaster.service";

@Injectable({ providedIn: 'root' })
export default class AuthenticationService {
  constructor(
    private readonly http: HttpService,
    private readonly cacheService: CacheService,
    private readonly toastService: ToasterService
  ) {
  }

  public isAuthenticated(role: Role = Role.GUEST): boolean {
    if (role === Role.GUEST) {
      // null < GUEST < PRACTITIONER
      return this.cacheService.cache.role !== null
    }
    return this.cacheService.cache.role === role
  }

  public authenticate(role: Role, credentials?: AuthCredentials): Observable<boolean> {
    const payload: AuthTokenHttpBody = {
      role: role,
      credentials: credentials
    }
    if (this.isAuthenticated(role)) {
      // already authenticated
      return of(true)
    }
    try {
      return this.http
        .post<string, AuthTokenHttpBody>(HttpPath.AUTH_TOKEN, payload)
        .pipe(
          map((token) => {
            this.cacheService.set({
              username: credentials ? credentials.username : null,
              role: role,
              authenticationToken: token
            })
            return true
          })
        )
    } catch (error) {
      console.error(error)
      if (role !== Role.GUEST) {
        this.toastService.sendToast({
          severity: "error",
          summary: "Identifiant ou mot de passe incorrect",
        })
      }
      return of(false)
    }
  }
}
