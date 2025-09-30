import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// E.164 phone number validation regex
const E164_REGEX = /^\+[1-9]\d{1,14}$/

// Valid status values
const VALID_STATUSES = ["active", "inactive", "blocked"] as const
type CustomerStatus = (typeof VALID_STATUSES)[number]

interface CustomerData {
  phone_number: string
  name?: string
  email?: string
  tags?: string[]
  status?: CustomerStatus
  airtable_record_id?: string
  external_data?: Record<string, any>
}

function validatePhoneNumber(phone: string): boolean {
  return E164_REGEX.test(phone)
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validateCustomerData(data: CustomerData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate phone number (required)
  if (!data.phone_number) {
    errors.push("Phone number is required")
  } else if (!validatePhoneNumber(data.phone_number)) {
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
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("customers")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone_number.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (status && VALID_STATUSES.includes(status as CustomerStatus)) {
      query = query.eq("status", status)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: customers, error, count } = await query

    if (error) {
      console.error("Error fetching customers:", error)
      return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
    }

    return NextResponse.json({
      customers: customers || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error("Error in customers API:", error)
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
    const customerData: CustomerData = {
      phone_number: body.phone_number,
      name: body.name,
      email: body.email,
      tags: body.tags,
      status: body.status || "active",
      airtable_record_id: body.airtable_record_id,
      external_data: body.external_data || {},
    }

    // Validate customer data
    const validation = validateCustomerData(customerData)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 },
      )
    }

    // Check for duplicate phone number
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .eq("phone_number", customerData.phone_number)
      .single()

    if (existingCustomer) {
      return NextResponse.json(
        {
          error: "A customer with this phone number already exists",
        },
        { status: 409 },
      )
    }

    const { data: customer, error } = await supabase
      .from("customers")
      .insert({
        user_id: user.id,
        ...customerData,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating customer:", error)
      return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
    }

    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    console.error("Error in customers POST API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
