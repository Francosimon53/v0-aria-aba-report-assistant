"use client"

// Using explicit import and re-export pattern for better module resolution
import { BackgroundHistory } from "./background-history"

export { BackgroundHistory as BackgroundHistoryForm }

// Also export the original name for flexibility
export { BackgroundHistory }
