// Sharing the session cookie across *.averotechnology.com lets the owner log in on the
// inventario subdomain and still reach /admin on the main domain. Unset locally.
const domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN

export const cookieOptions = domain ? { domain } : undefined
