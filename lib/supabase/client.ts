"use client"

import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

let supabaseInstance: ReturnType<typeof createSupabaseBrowserClient> | null = null

export function createClient() {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_ARIA_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_ARIA_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      throw new Error(
        "@supabase/ssr: Your project's URL and API key are required to create a Supabase client! " +
          "Set NEXT_PUBLIC_ARIA_SUPABASE_URL and NEXT_PUBLIC_ARIA_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) environment variables.",
      )
    }

    supabaseInstance = createSupabaseBrowserClient(url, key)
  }
  return supabaseInstance
}
