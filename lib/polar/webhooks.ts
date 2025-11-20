import crypto from 'crypto'
import { getEnvVar } from '@/lib/utils'

/**
 * Verify Polar webhook signature
 * Polar signs webhooks with a secret to ensure they're authentic
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  try {
    const webhookSecret = getEnvVar('POLAR_WEBHOOK_SECRET')

    // Create HMAC hash of the payload
    const hmac = crypto.createHmac('sha256', webhookSecret)
    hmac.update(payload)
    const expectedSignature = hmac.digest('hex')

    // Compare signatures using timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

/**
 * Extract and validate webhook signature from headers
 */
export function extractWebhookSignature(
  headers: Headers
): string | null {
  // Polar typically sends signature in 'x-polar-signature' or 'webhook-signature' header
  const signature =
    headers.get('x-polar-signature') ||
    headers.get('webhook-signature')

  return signature
}

/**
 * Parse webhook event payload safely
 */
export function parseWebhookPayload<T>(payload: string): T | null {
  try {
    return JSON.parse(payload) as T
  } catch (error) {
    console.error('Error parsing webhook payload:', error)
    return null
  }
}
