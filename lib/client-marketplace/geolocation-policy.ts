/**
 * Patient marketplace location policy.
 *
 * Browser Permissions-Policy sets `geolocation=()` (see next.config.mjs /
 * response-headers). Until an explicit, consented location source ships,
 * never surface "En yakın" / distance ranking as an available product claim.
 */
export const CLIENT_GEOLOCATION_ENABLED = false
