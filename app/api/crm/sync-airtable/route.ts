import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface AirtableRecord {
  id: string
  fields: {
    "Customer Name"?: string
    "Phone Number"?: string
    "Customer Email"?: string
  }
}

interface AirtableResponse {
  records: AirtableRecord[]
  offset?: string
}

interface SkippedRecord {
  airtableId: string
  name?: string
  phone?: string
  reason: string
}

// Convert various phone formats to E.164
function normalizePhoneNumber(phone: string): string | null {
  if (!phone) return null
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Must have at least 10 digits
  if (cleaned.length < 10) {
    return null
  }
  
  // Handle US numbers (10 digits) - add +1
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  }
  
  // Handle US/CA numbers with country code (11 digits starting with 1)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`
  }
  
  // Handle international numbers (already has country code)
  // Accept numbers between 11-15 digits (E.164 allows up to 15)
  if (cleaned.length >= 11 && cleaned.length <= 15) {
    return `+${cleaned}`
  }
  
  // Invalid format - too many digits
  return null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const airtableToken = process.env.AIRTABLE_API_TOKEN
    const baseId = "app0mrUpGpufPMRK2"
    const tableId = "tblUYCGfp7qQ7glt6"

    if (!airtableToken) {
      return NextResponse.json(
        { error: "Airtable API token not configured" },
        { status: 500 }
      )
    }

    // Fetch all records from Airtable (handle pagination if needed)
    let allRecords: AirtableRecord[] = []
    let offset: string | undefined

    do {
      const url = offset
        ? `https://api.airtable.com/v0/${baseId}/${tableId}?offset=${offset}`
        : `https://api.airtable.com/v0/${baseId}/${tableId}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${airtableToken}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Airtable API error:", errorText)
        return NextResponse.json(
          { error: "Failed to fetch from Airtable", details: errorText },
          { status: response.status }
        )
      }

      const data: AirtableResponse = await response.json()
      allRecords = allRecords.concat(data.records)
      offset = data.offset
    } while (offset)

    // Process and upsert customers
    let created = 0
    let updated = 0
    let skipped = 0
    const skippedRecords: SkippedRecord[] = []

    for (const record of allRecords) {
      const { fields } = record
      const rawPhone = fields["Phone Number"] || ""
      const phoneNumber = normalizePhoneNumber(rawPhone)

      // Skip records without valid phone numbers
      if (!phoneNumber) {
        skipped++
        skippedRecords.push({
          airtableId: record.id,
          name: fields["Customer Name"],
          phone: rawPhone,
          reason: rawPhone ? "Invalid phone format" : "Missing phone number"
        })
        continue
      }

      const customerData = {
        user_id: user.id,
        phone_number: phoneNumber,
        name: fields["Customer Name"] || null,
        email: fields["Customer Email"] || null,
        airtable_record_id: record.id,
        status: "active" as const,
      }

      // Check if customer exists (by airtable_record_id or phone_number)
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user.id)
        .or(`airtable_record_id.eq.${record.id},phone_number.eq.${phoneNumber}`)
        .single()

      if (existingCustomer) {
        // Update existing customer
        const { error } = await supabase
          .from("customers")
          .update({
            name: customerData.name,
            email: customerData.email,
            airtable_record_id: record.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingCustomer.id)

        if (!error) {
          updated++
        } else {
          console.error("Error updating customer:", error)
          skipped++
          skippedRecords.push({
            airtableId: record.id,
            name: fields["Customer Name"],
            phone: rawPhone,
            reason: `Database error: ${error.message}`
          })
        }
      } else {
        // Create new customer
        const { error } = await supabase
          .from("customers")
          .insert(customerData)

        if (!error) {
          created++
        } else {
          console.error("Error creating customer:", error)
          skipped++
          skippedRecords.push({
            airtableId: record.id,
            name: fields["Customer Name"],
            phone: rawPhone,
            reason: `Database error: ${error.message}`
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: allRecords.length,
        created,
        updated,
        skipped,
      },
      skippedRecords: skippedRecords.length > 0 ? skippedRecords : undefined,
    })
  } catch (error) {
    console.error("Error syncing Airtable:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}