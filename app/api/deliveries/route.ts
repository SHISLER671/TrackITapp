import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware/auth"
import { createClient } from "@/lib/supabase/server"
import { calculateKegDeposit } from "@/lib/types"
import { z } from "zod"

// Schema for delivery creation
const createDeliverySchema = z.object({
  restaurant_id: z.string().uuid(),
  keg_ids: z.array(z.string()).min(1),
  notes: z.string().optional(),
})

// GET /api/deliveries - List deliveries (filtered by role)
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user, userRole } = authResult

  const supabase = await createClient()

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") // Optional filter

    let query = supabase
      .from("deliveries")
      .select(`
        *,
        driver:driver_id(id, user_id),
        restaurant:restaurant_id(id, user_id),
        brewery:brewery_id(id, name, logo_url)
      `)
      .order("created_at", { ascending: false })

    // Filter based on role
    if (userRole.role === "DRIVER") {
      query = query.eq("driver_id", userRole.id)
    } else if (userRole.role === "RESTAURANT_MANAGER") {
      query = query.eq("restaurant_id", userRole.id)
    } else if (userRole.role === "BREWER") {
      query = query.eq("brewery_id", userRole.brewery_id)
    }

    // Optional status filter
    if (status) {
      query = query.eq("status", status.toUpperCase())
    }

    const { data: deliveries, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ deliveries })
  } catch (error) {
    console.error("Error fetching deliveries:", error)
    return NextResponse.json({ error: "Failed to fetch deliveries" }, { status: 500 })
  }
}

// POST /api/deliveries - Create new delivery (drivers only)
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user, userRole } = authResult

  // Only drivers can create deliveries
  if (userRole.role !== "DRIVER") {
    return NextResponse.json({ error: "Only drivers can create deliveries" }, { status: 403 })
  }

  const supabase = await createClient()

  try {
    const body = await request.json()

    // Validate input
    const validatedData = createDeliverySchema.parse(body)

    // Verify all kegs exist and belong to the driver
    const { data: kegs, error: kegsError } = await supabase
      .from("kegs")
      .select("id, name, type, keg_size, brewery_id, current_holder")
      .in("id", validatedData.keg_ids)

    if (kegsError) {
      throw kegsError
    }

    if (!kegs || kegs.length !== validatedData.keg_ids.length) {
      return NextResponse.json({ error: "One or more kegs not found" }, { status: 404 })
    }

    // Verify all kegs are currently held by the driver
    const invalidKegs = kegs.filter((keg: any) => keg.current_holder !== userRole.id)
    if (invalidKegs.length > 0) {
      return NextResponse.json({ error: "You can only deliver kegs currently in your possession" }, { status: 403 })
    }

    // All kegs should be from the same brewery
    const breweryIds = [...new Set(kegs.map((k: any) => k.brewery_id))]
    if (breweryIds.length > 1) {
      return NextResponse.json({ error: "All kegs must be from the same brewery" }, { status: 400 })
    }

    const brewery_id = breweryIds[0]

    // Create delivery
    const { data: delivery, error: deliveryError } = await supabase
      .from("deliveries")
      .insert({
        driver_id: userRole.id,
        restaurant_id: validatedData.restaurant_id,
        brewery_id,
        keg_ids: validatedData.keg_ids,
        status: "PENDING",
        notes: validatedData.notes,
      })
      .select()
      .single()

    if (deliveryError) {
      throw deliveryError
    }

    // Create delivery items
    const deliveryItems = kegs.map((keg: any) => ({
      delivery_id: delivery.id,
      keg_id: keg.id,
      keg_name: keg.name,
      keg_type: keg.type,
      keg_size: keg.keg_size,
      deposit_value: calculateKegDeposit(keg.keg_size),
    }))

    const { error: itemsError } = await supabase.from("delivery_items").insert(deliveryItems)

    if (itemsError) {
      throw itemsError
    }

    // Fetch complete delivery with items
    const { data: completeDelivery, error: fetchError } = await supabase
      .from("deliveries")
      .select(`
        *,
        driver:driver_id(id, user_id),
        restaurant:restaurant_id(id, user_id),
        brewery:brewery_id(id, name, logo_url),
        delivery_items(*)
      `)
      .eq("id", delivery.id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    return NextResponse.json({
      message: "Delivery created successfully",
      delivery: completeDelivery,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    console.error("Error creating delivery:", error)
    return NextResponse.json({ error: "Failed to create delivery" }, { status: 500 })
  }
}
