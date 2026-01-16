/**
 * Safely parses a date value and returns a valid Date object or null
 * Handles strings, Date objects, timestamps, and invalid values
 */
export function safeParseDate(dateValue: any): Date | null {
  if (!dateValue) return null

  try {
    // If it's already a Date object
    if (dateValue instanceof Date) {
      // Check if it's valid
      if (isNaN(dateValue.getTime())) {
        return null
      }
      return dateValue
    }

    // Try to parse as a date
    const date = new Date(dateValue)

    // Check if the parsed date is valid
    if (isNaN(date.getTime())) {
      return null
    }

    return date
  } catch {
    return null
  }
}

/**
 * Safely formats a date for storage (ISO string)
 */
export function safeDateForStorage(date: Date | string | null | undefined): string | null {
  const parsed = safeParseDate(date)
  if (!parsed) return null

  try {
    return parsed.toISOString()
  } catch {
    return null
  }
}

/**
 * Validates if a date value is usable
 */
export function isValidDate(dateValue: any): boolean {
  return safeParseDate(dateValue) !== null
}

/**
 * Safely formats a date for display
 * Returns a formatted date string or null if invalid
 */
export function safeFormatDate(
  dateValue: any,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
): string | null {
  const parsed = safeParseDate(dateValue)
  if (!parsed) return null

  try {
    return parsed.toLocaleDateString("en-US", options)
  } catch {
    return null
  }
}
