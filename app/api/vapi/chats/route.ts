import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { VAPIService } from "@/lib/vapi-service"

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

    const { data: apiKeys, error: keyError } = await supabase
      .from("api_keys")
      .select("vapi_private_key")
      .eq("user_id", user.id)
      .single()

    if (keyError || !apiKeys?.vapi_private_key) {
      return NextResponse.json({ error: "Vapi private API key not configured" }, { status: 400 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 50
    const assistantId = searchParams.get("assistantId") || undefined
    const createdAtGt = searchParams.get("createdAtGt") || undefined
    const createdAtLt = searchParams.get("createdAtLt") || undefined

    const vapiService = new VAPIService(apiKeys.vapi_private_key)
    const response = await vapiService.getChats({
      limit,
      assistantId,
      createdAtGt,
      createdAtLt,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching Vapi chats:", error)
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 })
  }
}
