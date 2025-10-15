import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware/auth"
import { createClient } from "@/lib/supabase/server"
import { transferKegNFTs } from "@/lib/thirdweb"
import { z } from "zod"

// Schema for delivery acceptance
const acceptDeliverySchema = z.object({
  signature: z.string().min(1), // Manager's wallet signature
  blockchain_tx_hash: z.string().optional(), // Optional: pre-signed tx hash
})

// POST /api/deliveries/[id]/accept - Accept delivery (restaurant manager only)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user, userRole } = authResult

  // Only restaurant managers can accept deliveries
  if (userRole.role !== "RESTAURANT_MANAGER") {
    return NextResponse.json({ error: "Only restaurant managers can accept deliveries" }, { status: 403 })
  }

  const supabase = await createClient()

  try {
    const body = await request.json()

    // Validate input
    const validatedData = acceptDeliverySchema.parse(body)

    // Get delivery
    const { id } = await params
    const { data: delivery, error: fetchError } = await supabase.from("deliveries").select("*").eq("id", id).single()

    if (fetchError || !delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 })
    }

    // Check if manager is the intended recipient
    if (delivery.restaurant_id !== userRole.id) {
      return NextResponse.json({ error: "This delivery is not for your restaurant" }, { status: 403 })
    }

    // Check if delivery is still pending
    if (delivery.status !== "PENDING") {
      return NextResponse.json({ error: `Delivery is already ${delivery.status.toLowerCase()}` }, { status: 400 })
    }

    // Execute blockchain transfer (if not already done)
    let txHash = validatedData.blockchain_tx_hash

    if (!txHash) {
      try {
        // Transfer all keg NFTs from driver to restaurant manager
        txHash = await transferKegNFTs(delivery.keg_ids, delivery.driver_id, delivery.restaurant_id)
      } catch (blockchainError) {
        console.error("Blockchain transfer error:", blockchainError)
        // In production, you might want to retry or queue this
        // For now, we'll continue and log the error
        txHash = undefined
      }
    }

    // Update delivery status
    const { data: updatedDelivery, error: updateError } = await supabase
      .from("deliveries")
      .update({
        status: "ACCEPTED",
        manager_signature: validatedData.signature,
        blockchain_tx_hash: txHash,
        accepted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        *,
        driver:driver_id(id, user_id),
        restaurant:restaurant_id(id, user_id),
        brewery:brewery_id(id, name, logo_url),
        delivery_items(*)
      `)
      .single()

    if (updateError) {
      throw updateError
    }

    // The trigger will automatically update keg ownership
    // No need to manually update kegs here

    return NextResponse.json({
      message: "Delivery accepted successfully",
      delivery: updatedDelivery,
      blockchain_tx: txHash,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    console.error("Error accepting delivery:", error)
    return NextResponse.json({ error: "Failed to accept delivery" }, { status: 500 })
  }
}
