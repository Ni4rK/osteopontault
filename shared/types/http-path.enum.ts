enum HttpPath {
  AUTH_TOKEN = '/authentication/token',
  AVAILABILITY_GET = '/availability_slot',
  AVAILABILITY_INSERT = '/availability_slot',
  AVAILABILITY_UPDATE = '/availability_slot',
  AVAILABILITY_BOOK = '/availability_slot/book',
  AVAILABILITY_DELETE = '/availability_slot',
  MEMBER_PWA_SUBSCRIPTION = '/member/pwa_subscription',
  SCRIPT_DATABASE_MIGRATION = '/script/database_migration',

  // dev
  SCRIPT_INIT_DATABASE = '/script/init_database',
  SCRIPT_CREATE_USER = '/script/create_user'
}
export default HttpPath