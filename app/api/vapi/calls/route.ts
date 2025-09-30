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
    const response = await vapiService.getCalls({
      limit,
      assistantId,
      createdAtGt,
      createdAtLt,
    })

    const calls = response.calls || response || []
    const totalCalls = calls.length
    const completedCalls = calls.filter((call: any) => call.status === "completed")
    const successRate = totalCalls > 0 ? (completedCalls.length / totalCalls) * 100 : 0
    const avgDuration =
      completedCalls.length > 0
        ? completedCalls.reduce((sum: number, call: any) => {
            const duration =
              call.endedAt && call.startedAt
                ? (new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000
                : 0
            return sum + duration
          }, 0) / completedCalls.length
        : 0
    const totalCost = calls.reduce((sum: number, call: any) => sum + (call.cost || 0), 0)

    return NextResponse.json({
      calls,
      analytics: {
        totalCalls,
        successRate: Math.round(successRate * 100) / 100,
        avgDuration: Math.round(avgDuration * 100) / 100,
        cost: Math.round(totalCost * 100) / 100,
      },
    })
  } catch (error) {
    console.error("Error fetching Vapi calls:", error)
    return NextResponse.json({ error: "Failed to fetch calls" }, { status: 500 })
  }
}
