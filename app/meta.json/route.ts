import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    name: "ARIA ABA Assessment",
    description: "Meta info for ARIA app.",
    ok: true,
  })
}
