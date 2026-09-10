import type { APIRoute } from 'astro'
import { handleEbayChallenge, handleEbayNotification } from '../../../lib/ebay-account-deletion'

export const GET: APIRoute = ({ request }) => handleEbayChallenge(request)
export const POST: APIRoute = ({ request }) => handleEbayNotification(request)
