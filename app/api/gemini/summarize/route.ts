import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { GeminiClient } from "@/lib/gemini-client"

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

    // Get user's Gemini API key
    const { data: apiKeys, error: keyError } = await supabase
      .from("api_keys")
      .select("gemini_api_key")
      .eq("user_id", user.id)
      .single()

    if (keyError || !apiKeys?.gemini_api_key) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 400 })
    }

    const { conversationText } = await request.json()

    if (!conversationText) {
      return NextResponse.json({ error: "Conversation text is required" }, { status: 400 })
    }

    const geminiClient = new GeminiClient(apiKeys.gemini_api_key)
    const summary = await geminiClient.generateSummary(conversationText)

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Error generating summary:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
