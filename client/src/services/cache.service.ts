import {type CacheType} from "@shared/types/cache.type";
import {isString} from "@shared/helpers/common-types.guards";
import {Service} from "typedi";

@Service()
export class CacheService {
  LOCAL_STORAGE_CACHE_KEY = 'osteopontault-cache'

  private defaultCache: CacheType = {
    username: null,
    authenticationToken: null,
    role: null,
    userId: null,
    sessionId: null
  }

  public cache: CacheType = { ...this.defaultCache }

  constructor() {
    const oldCache = localStorage.getItem(this.LOCAL_STORAGE_CACHE_KEY)
    if (isString(oldCache)) {
      this.cache = JSON.parse(oldCache)
    }
  }

  resetForAuthentication() {
    this.set({
      username: null,
      authenticationToken: null,
      role: null
    })
  }

  set(newCache: Partial<CacheType>) {
    this.cache = Object.assign({}, this.cache, newCache)
    localStorage.setItem(this.LOCAL_STORAGE_CACHE_KEY, JSON.stringify(this.cache))
  }
}
