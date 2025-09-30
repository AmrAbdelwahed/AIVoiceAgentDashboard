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

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customer_id")
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    let query = supabase
      .from("notes")
      .select(
        `
        *,
        customer:customers(*)
      `,
      )
      .eq("user_id", user.id)
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false })

    if (customerId) {
      query = query.eq("customer_id", customerId)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    query = query.limit(limit)

    const { data: notes, error } = await query

    if (error) {
      console.error("Error fetching notes:", error)
      return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
    }

    return NextResponse.json({ notes })
  } catch (error) {
    console.error("Error in notes API:", error)
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
    const { customer_id, call_id, title, content, priority, tags, is_pinned } = body

    if (!customer_id || !title || !content) {
      return NextResponse.json({ error: "Customer ID, title, and content are required" }, { status: 400 })
    }

    const { data: note, error } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        customer_id,
        call_id,
        title,
        content,
        priority: priority || "medium",
        tags,
        is_pinned: is_pinned || false,
      })
      .select(
        `
        *,
        customer:customers(*)
      `,
      )
      .single()

    if (error) {
      console.error("Error creating note:", error)
      return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
    }

    return NextResponse.json({ note })
  } catch (error) {
    console.error("Error in notes POST API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
