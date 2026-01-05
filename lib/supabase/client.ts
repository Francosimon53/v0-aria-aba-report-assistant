import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

let clientInstance: ReturnType<typeof createSupabaseBrowserClient> | null = null

export function createClient() {
  if (clientInstance) return clientInstance

  clientInstance = createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  return clientInstance
}

export function createBrowserClient() {
  return createClient()
}
