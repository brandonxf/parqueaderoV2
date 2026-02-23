import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para obtener la fecha y hora actual en zona horaria de Colombia (America/Bogota, UTC-5)
function getColombiaDate(date: Date | string): Date {
  const inputDate = typeof date === 'string' ? new Date(date) : date
  // La base de datos guarda en UTC, restamos 5 horas para obtener hora de Colombia
  const colombiaOffset = 5 * 60 * 60 * 1000 // 5 horas en milisegundos
  return new Date(inputDate.getTime() - colombiaOffset)
}

// Obtener fecha actual en formato YYYY-MM-DD para la zona horaria de Colombia
export function getColombiaToday(): string {
  const now = new Date()
  const colombiaOffset = 5 * 60 * 60 * 1000
  const colombiaDate = new Date(now.getTime() - colombiaOffset)
  return colombiaDate.toISOString().split("T")[0]
}

export function formatTime(dateStr: string): string {
  const date = getColombiaDate(dateStr)
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

export function formatDate(dateStr: string): string {
  const date = getColombiaDate(dateStr)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  return `${day}/${month}/${year}`
}

export function formatDateTime(dateStr: string): string {
  const date = getColombiaDate(dateStr)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

export function formatShortDate(dateStr: string): string {
  const date = getColombiaDate(dateStr)
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const dayName = days[date.getDay()]
  const day = date.getDate().toString().padStart(2, "0")
  const monthName = months[date.getMonth()]
  return `${dayName}, ${day} ${monthName}`
}
