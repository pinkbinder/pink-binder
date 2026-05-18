import { EBAY_ENV } from '../config/env'

export const EBAY_NOTIFICATION_TOPIC = 'MARKETPLACE_ACCOUNT_DELETION' as const

export const EBAY_ACCOUNT_DELETION_ENV_KEYS = [
  EBAY_ENV.accountDeletionEndpoint,
  EBAY_ENV.notificationEndpoint,
] as const
