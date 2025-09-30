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

    // Get user's Vapi private API key
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
    const createdAtGt = searchParams.get("createdAtGt") || undefined
    const createdAtLt = searchParams.get("createdAtLt") || undefined

    const vapiService = new VAPIService(apiKeys.vapi_private_key)
    const response = await vapiService.getAssistants({
      limit,
      createdAtGt,
      createdAtLt,
    })

    const assistants = response.assistants || response || []
    const filteredAssistants = assistants.map((assistant: any) => ({
      id: assistant.id,
      name: assistant.name,
      description: assistant.description || "",
      createdAt: assistant.createdAt,
      updatedAt: assistant.updatedAt,
    }))

    return NextResponse.json({
      assistants: filteredAssistants,
      pagination: response.pagination,
    })
  } catch (error) {
    console.error("Error fetching Vapi assistants:", error)
    return NextResponse.json({ error: "Failed to fetch assistants" }, { status: 500 })
  }
}
