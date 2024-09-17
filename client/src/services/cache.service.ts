import {CacheType} from "@shared/types/cache.type";
import {Injectable} from "@angular/core";
import {isString} from "@shared/helpers/common-types.guards";

@Injectable({ providedIn: 'root' })
export class CacheService {
  LOCAL_STORAGE_CACHE_KEY = 'osteopontault-cache'

  private defaultCache: CacheType = {
    username: null,
    authenticationToken: null,
    role: null
  }

  public cache: CacheType = { ...this.defaultCache }

  constructor() {
    const oldCache = localStorage.getItem(this.LOCAL_STORAGE_CACHE_KEY)
    if (isString(oldCache)) {
      this.cache = JSON.parse(oldCache)
    }
  }

  reset() {
    this.cache = this.defaultCache
  }

  set(newCache: Partial<CacheType>) {
    this.cache = Object.assign({}, this.cache, newCache)
    localStorage.setItem(this.LOCAL_STORAGE_CACHE_KEY, JSON.stringify(this.cache))
  }
}
