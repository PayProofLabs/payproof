import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatStellarAmount(amount: string, assetCode?: string): string {
  const numAmount = parseFloat(amount)
  if (isNaN(numAmount)) return "0"
  
  return `${numAmount.toLocaleString('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 7 
  })} ${assetCode || 'XLM'}`
}

export function stroopsToXLM(stroops: string | number): string {
  const stroopAmount = typeof stroops === 'string' ? parseInt(stroops, 10) : stroops
  if (isNaN(stroopAmount)) return "0.0000000"
  
  return (stroopAmount / 10000000).toFixed(7)
}

export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  })
}

export function truncateHash(hash: string, length = 8): string {
  if (!hash) return ""
  return `${hash.slice(0, length)}...${hash.slice(-length)}`
}