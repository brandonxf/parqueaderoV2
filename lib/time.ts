// Devuelve el `Date` correspondiente al valor recibido sin ajustar manualmente la zona.
// Para formatear en la zona horaria de Colombia, usar `formatInColombia` o
// pasar la opción `timeZone: 'America/Bogota'` a los formateadores Intl.
export function toLocalDate(date: Date | string): Date | null {
  if (!date) return null
  const inputDate = typeof date === 'string' ? new Date(date) : date
  if (isNaN(inputDate.getTime())) return null
  return inputDate
}

export function formatInColombia(date: Date | string, options?: Intl.DateTimeFormatOptions): string | null {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', ...options }).format(d)
}
