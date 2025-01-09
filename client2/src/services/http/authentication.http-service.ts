import {Role} from "@shared/types/role.enum";
import HttpClientService from "./http-client.service";
import {AuthCredentials} from "@shared/types/auth-credentials.type";
import {AuthTokenHttpBody} from "@shared/types/http-body.types";
import HttpPath from "@shared/types/http-path.enum";
import {CacheService} from "../cache.service";
import ToasterService from "../snackbar/toaster.service";
import {Container, Service} from "typedi";

@Service()
export default class AuthenticationHttpService {
  private readonly httpClientService = Container.get(HttpClientService)
  private readonly cacheService = Container.get(CacheService)
  private readonly toasterService = Container.get(ToasterService)

  public isAuthenticated(role: Role = Role.GUEST): boolean {
    if (role === Role.GUEST) {
      // null < GUEST < PRACTITIONER
      return this.cacheService.cache.role !== null
    }
    return this.cacheService.cache.role === role
  }

  public async authenticate(role: Role, credentials?: AuthCredentials): Promise<boolean> {
    const payload: AuthTokenHttpBody = {
      role: role,
      credentials: credentials
    }
    if (this.isAuthenticated(role)) {
      // already authenticated
      return true
    }
    try {
      const token = await this.httpClientService.post<string, AuthTokenHttpBody>(HttpPath.AUTH_TOKEN, payload)
      this.cacheService.set({
        username: credentials ? credentials.username : null,
        role: role,
        authenticationToken: token
      })
      return true
    } catch (error) {
      console.error(error)
      if (role !== Role.GUEST) {
        this.toasterService.sendToast({
          type: "error",
          message: "Identifiant ou mot de passe incorrect",
        })
      }
      return false
    }
  }
}
