type DbError = { message?: string; code?: string } | null | undefined

export const READ_ONLY_MESSAGE =
  "Tu cuenta está en modo solo lectura porque la suscripción venció. Renuévala para seguir creando y editando; tus datos están intactos."

// 42501 is raised by the restrictive read-only policies from DATABASE_SYSTEMS_UPDATE.sql.
export function friendlyError(error: DbError): string {
  if (!error) return "Ocurrió un error inesperado"
  if (error.code === "42501" || /row-level security/i.test(error.message ?? "")) return READ_ONLY_MESSAGE
  return error.message || "Ocurrió un error inesperado"
}
