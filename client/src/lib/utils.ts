import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price in MAD currency
export function formatPrice(price: number): string {
  return `${price.toLocaleString()} MAD`
}

// Format date utility
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Activity utilities - these would normally fetch from a database
// For now, using basic implementations
export function getActivityNameById(id: number): string {
  const activities: Record<number, string> = {
    1: "3-Day Merzouga Desert Tour",
    2: "Day Trip to Essaouira",
    3: "Atlas Mountains Hiking",
    4: "Marrakech City Tour",
    5: "Ouzoud Waterfalls"
  }
  return activities[id] || `Activity ${id}`
}

export function getActivityPriceById(id: number): number {
  const prices: Record<number, number> = {
    1: 2500,
    2: 800,
    3: 600,
    4: 400,
    5: 500
  }
  return prices[id] || 0
}

export function getActivityIdByName(name: string): number {
  const nameToId: Record<string, number> = {
    "3-Day Merzouga Desert Tour": 1,
    "Day Trip to Essaouira": 2,
    "Atlas Mountains Hiking": 3,
    "Marrakech City Tour": 4,
    "Ouzoud Waterfalls": 5
  }
  return nameToId[name] || 1
}

// Contact information
export const whatsAppContacts = {
  default: "+212600623630",
  booking: "+212600623630"
}

export const contactInfo = {
  phone: "+212 600 623 630",
  address: "54 Riad Zitoun Lakdim, Marrakech 40000, Morocco"
}

export function constructWhatsAppUrl(phone: string, message: string) {
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${encoded}`
}
