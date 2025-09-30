import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: apiKeys, error } = await supabase
      .from("api_keys")
      .select("vapi_private_key, vapi_public_key, gemini_api_key, created_at, updated_at")
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching API keys:", error)
      return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 })
    }

    const maskedKeys = {
      vapi_private_key: apiKeys?.vapi_private_key ? maskApiKey(apiKeys.vapi_private_key) : null,
      vapi_public_key: apiKeys?.vapi_public_key ? maskApiKey(apiKeys.vapi_public_key) : null,
      gemini_api_key: apiKeys?.gemini_api_key ? maskApiKey(apiKeys.gemini_api_key) : null,
      created_at: apiKeys?.created_at,
      updated_at: apiKeys?.updated_at,
    }

    return NextResponse.json({ apiKeys: maskedKeys })
  } catch (error) {
    console.error("Error in API keys GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { vapi_private_key, vapi_public_key, gemini_api_key } = body

    if (vapi_private_key && typeof vapi_private_key !== "string") {
      return NextResponse.json({ error: "Invalid Vapi private key" }, { status: 400 })
    }

    if (vapi_public_key && typeof vapi_public_key !== "string") {
      return NextResponse.json({ error: "Invalid Vapi public key" }, { status: 400 })
    }

    if (gemini_api_key && typeof gemini_api_key !== "string") {
      return NextResponse.json({ error: "Invalid Gemini API key format" }, { status: 400 })
    }

    const updateData: any = { user_id: user.id, updated_at: new Date().toISOString() }
    if (vapi_private_key) updateData.vapi_private_key = vapi_private_key
    if (vapi_public_key) updateData.vapi_public_key = vapi_public_key
    if (gemini_api_key) updateData.gemini_api_key = gemini_api_key

    const { data: apiKeys, error } = await supabase
      .from("api_keys")
      .upsert(updateData, { onConflict: "user_id" })
      .select()
      .single()

    if (error) {
      console.error("Error updating API keys:", error)
      return NextResponse.json({ error: "Failed to update API keys" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in API keys POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function maskApiKey(key: string): string {
  if (key.length <= 8) return key
  return key.substring(0, 4) + "•".repeat(key.length - 8) + key.substring(key.length - 4)
}
