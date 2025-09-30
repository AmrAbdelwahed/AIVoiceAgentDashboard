import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { VAPIService } from "@/lib/vapi-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: apiKeys, error: keyError } = await supabase
      .from("api_keys")
      .select("vapi_private_key")
      .eq("user_id", user.id)
      .single()

    if (keyError || !apiKeys?.vapi_private_key) {
      return NextResponse.json({ error: "Vapi private API key not configured" }, { status: 400 })
    }

    const vapiService = new VAPIService(apiKeys.vapi_private_key)
    const response = await vapiService.getChat(params.id)

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching Vapi chat:", error)
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 })
  }
}
