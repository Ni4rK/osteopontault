import {Role} from "./role.enum";

export type CacheType = {
  username: string | null
  authenticationToken: string | null
  role: Role | null
}
