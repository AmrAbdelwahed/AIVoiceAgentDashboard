import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { title, content, priority, tags, is_pinned } = body

    const { data: note, error } = await supabase
      .from("notes")
      .update({
        title,
        content,
        priority,
        tags,
        is_pinned,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id) // Ensures user can only update their own notes
      .select(`
        *,
        customer:customers(*)
      `)
      .single()

    if (error) {
      console.error("Error updating note:", error)
      return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
    }

    return NextResponse.json({ note })
  } catch (error) {
    console.error("Error in notes PATCH API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error deleting note:", error)
      return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in notes DELETE API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}