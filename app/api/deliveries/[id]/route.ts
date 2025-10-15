import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware/auth"
import { createClient } from "@/lib/supabase/server"

// GET /api/deliveries/[id] - Get single delivery
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user, userRole } = authResult

  const supabase = await createClient()

  try {
    const { id } = await params
    const { data: delivery, error } = await supabase
      .from("deliveries")
      .select(`
        *,
        driver:driver_id(id, user_id),
        restaurant:restaurant_id(id, user_id),
        brewery:brewery_id(id, name, logo_url),
        delivery_items(
          *,
          keg:keg_id(*)
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      throw error
    }

    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 })
    }

    // Check access permissions
    const hasAccess =
      (userRole.role === "DRIVER" && delivery.driver_id === userRole.id) ||
      (userRole.role === "RESTAURANT_MANAGER" && delivery.restaurant_id === userRole.id) ||
      (userRole.role === "BREWER" && delivery.brewery_id === userRole.brewery_id)

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json({ delivery })
  } catch (error) {
    console.error("Error fetching delivery:", error)
    return NextResponse.json({ error: "Failed to fetch delivery" }, { status: 500 })
  }
}

// DELETE /api/deliveries/[id] - Cancel delivery (driver only, if still pending)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user, userRole } = authResult

  if (userRole.role !== "DRIVER") {
    return NextResponse.json({ error: "Only drivers can cancel deliveries" }, { status: 403 })
  }

  const supabase = await createClient()

  try {
    // Get existing delivery
    const { id } = await params
    const { data: existingDelivery, error: fetchError } = await supabase
      .from("deliveries")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !existingDelivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 })
    }

    // Check if driver owns this delivery
    if (existingDelivery.driver_id !== userRole.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Can only cancel pending deliveries
    if (existingDelivery.status !== "PENDING") {
      return NextResponse.json({ error: "Can only cancel pending deliveries" }, { status: 400 })
    }

    // Update status to cancelled
    const { error } = await supabase.from("deliveries").update({ status: "CANCELLED" }).eq("id", id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: "Delivery cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling delivery:", error)
    return NextResponse.json({ error: "Failed to cancel delivery" }, { status: 500 })
  }
}
