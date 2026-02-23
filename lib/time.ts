// Función para obtener la fecha y hora en zona horaria de Colombia (America/Bogota, UTC-5)
export function toLocalDate(date: Date | string): Date | null {
  if (!date) return null
  const inputDate = typeof date === 'string' ? new Date(date) : date
  if (isNaN(inputDate.getTime())) return null
  // La base de datos guarda en UTC, restamos 5 horas para obtener hora de Colombia
  const colombiaOffset = 5 * 60 * 60 * 1000 // 5 horas en milisegundos
  return new Date(inputDate.getTime() - colombiaOffset)
}
