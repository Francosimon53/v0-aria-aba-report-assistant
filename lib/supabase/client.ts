export function createClient() {
  throw new Error(
    "Client-side Supabase access is disabled. Use server actions from app/actions/assessment-actions.ts instead.",
  )
}
