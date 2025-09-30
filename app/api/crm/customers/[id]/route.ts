import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// E.164 phone number validation regex
const E164_REGEX = /^\+[1-9]\d{1,14}$/

// Valid status values
const VALID_STATUSES = ["active", "inactive", "blocked"] as const
type CustomerStatus = (typeof VALID_STATUSES)[number]

interface CustomerUpdateData {
  phone_number?: string
  name?: string
  email?: string
  company?: string
  tags?: string[]
  status?: CustomerStatus
}

function validatePhoneNumber(phone: string): boolean {
  return E164_REGEX.test(phone)
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validateCustomerUpdateData(data: CustomerUpdateData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate phone number (optional for updates)
  if (data.phone_number && !validatePhoneNumber(data.phone_number)) {
    errors.push("Phone number must be in E.164 format (e.g., +1234567890)")
  }

  // Validate email (optional)
  if (data.email && !validateEmail(data.email)) {
    errors.push("Invalid email format")
  }

  // Validate status (optional)
  if (data.status && !VALID_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(", ")}`)
  }

  // Validate tags (optional)
  if (data.tags && !Array.isArray(data.tags)) {
    errors.push("Tags must be an array of strings")
  }

  return { isValid: errors.length === 0, errors }
}

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

    const { data: customer, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 })
      }
      console.error("Error fetching customer:", error)
      return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error("Error in customer GET API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const updateData: CustomerUpdateData = {
      phone_number: body.phone_number,
      name: body.name,
      email: body.email,
      company: body.company,
      tags: body.tags,
      status: body.status,
    }

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof CustomerUpdateData] === undefined) {
        delete updateData[key as keyof CustomerUpdateData]
      }
    })

    // Validate update data
    const validation = validateCustomerUpdateData(updateData)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 },
      )
    }

    // Check if customer exists and belongs to user
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (!existingCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Check for duplicate phone number if phone is being updated
    if (updateData.phone_number) {
      const { data: duplicateCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user.id)
        .eq("phone_number", updateData.phone_number)
        .neq("id", params.id)
        .single()

      if (duplicateCustomer) {
        return NextResponse.json(
          {
            error: "A customer with this phone number already exists",
          },
          { status: 409 },
        )
      }
    }

    const { data: customer, error } = await supabase
      .from("customers")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating customer:", error)
      return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error("Error in customer PUT API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if customer exists and belongs to user
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (!existingCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const { error } = await supabase.from("customers").delete().eq("id", params.id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting customer:", error)
      return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
    }

    return NextResponse.json({ message: "Customer deleted successfully" })
  } catch (error) {
    console.error("Error in customer DELETE API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
