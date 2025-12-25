import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // Simplemente retorna la request sin modificar
  // Esto evita que el error de Supabase bloquee toda la app
  return NextResponse.next({ request })
}
