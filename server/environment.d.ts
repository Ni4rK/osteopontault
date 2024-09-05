declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MODE: 'prod' | 'dev'
      DB_ENDPOINT: string | undefined
      DB_AUTHENTICATION_MEMBER_TABLE_NAME: string | undefined
      DB_AVAILABILITY_SLOT_TABLE_NAME: string | undefined
      VAPID_PRIVATE_KEY: string
      AUTH_KEY: string
      AUTH_EXP_GUEST: string
      AUTH_EXP_PRACTITIONER: string
    }
  }
}

export {}