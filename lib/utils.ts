import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function parseDate(date: Date | string): Date | null {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return null
  return d
}

// Obtener fecha actual en formato YYYY-MM-DD para la zona horaria de Colombia
export function getColombiaToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())
}

export function formatTime(dateStr: string): string {
  const d = parseDate(dateStr)
  if (!d) return ''
  return new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: false }).format(d)
}

export function formatDate(dateStr: string): string {
  const d = parseDate(dateStr)
  if (!d) return ''
  const parts = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(d)
  const day = parts.find(p => p.type === 'day')?.value ?? ''
  const month = parts.find(p => p.type === 'month')?.value ?? ''
  const year = parts.find(p => p.type === 'year')?.value ?? ''
  return `${day}/${month}/${year}`
}

export function formatDateTime(dateStr: string): string {
  const d = parseDate(dateStr)
  if (!d) return ''
  const dateParts = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(d)
  const time = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: false }).format(d)
  const day = dateParts.find(p => p.type === 'day')?.value ?? ''
  const month = dateParts.find(p => p.type === 'month')?.value ?? ''
  const year = dateParts.find(p => p.type === 'year')?.value ?? ''
  return `${day}/${month}/${year} ${time}`
}

export function formatShortDate(dateStr: string): string {
  const d = parseDate(dateStr)
  if (!d) return ''
  return new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', weekday: 'short', day: '2-digit', month: 'short' }).format(d)
}
