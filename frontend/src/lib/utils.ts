// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export function getTrackingNumber(id: number): string {
    return `TN${id.toString().padStart(6, '0')}`
}

export function formatPhone(phone: string): string {
    // Format: +91 98765 43210
    if (phone.startsWith('+91')) {
        return phone
    }
    return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
}
