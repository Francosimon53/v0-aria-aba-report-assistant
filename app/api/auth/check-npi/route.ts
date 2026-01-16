import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { npi } = await request.json()

    if (!npi || npi.length !== 10) {
      return NextResponse.json({ exists: false, error: "Invalid NPI" })
    }

    const supabase = await createClient()

    const { data, error } = await supabase.from("profiles").select("id").eq("npi", npi).maybeSingle()

    if (error) {
      console.error("NPI check error:", error)
      return NextResponse.json({ exists: false })
    }

    return NextResponse.json({ exists: !!data })
  } catch (error) {
    console.error("NPI check error:", error)
    return NextResponse.json({ exists: false })
  }
}
