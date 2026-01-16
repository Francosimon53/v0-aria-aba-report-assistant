"use client"

// Using explicit import and re-export pattern for better module resolution
import { ClientForm } from "./client-form"

export { ClientForm as ClientInformationForm }

// Also export the original name for flexibility
export { ClientForm }
