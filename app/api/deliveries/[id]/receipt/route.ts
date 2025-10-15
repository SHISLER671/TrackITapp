import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware/auth"
import { createClient } from "@/lib/supabase/server"
import { generateReceiptData, generateTextReceipt, generateHTMLReceipt } from "@/lib/receipt-generator"

// GET /api/deliveries/[id]/receipt - Generate receipt
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user, userRole } = authResult

  const supabase = await createClient()

  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "json" // json, text, html

    // Get delivery with all details
    const { id } = await params
    const { data: delivery, error } = await supabase
      .from("deliveries")
      .select(`
        *,
        driver:driver_id(id, user_id),
        restaurant:restaurant_id(id, user_id),
        brewery:brewery_id(id, name, logo_url),
        delivery_items(*)
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

    // Only accepted deliveries can generate receipts
    if (delivery.status !== "ACCEPTED") {
      return NextResponse.json({ error: "Can only generate receipts for accepted deliveries" }, { status: 400 })
    }

    // Generate receipt data
    const receiptData = generateReceiptData(delivery)

    // Return in requested format
    if (format === "text") {
      const textReceipt = generateTextReceipt(receiptData)
      return new NextResponse(textReceipt, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="receipt-${receiptData.receipt_number}.txt"`,
        },
      })
    } else if (format === "html") {
      const htmlReceipt = generateHTMLReceipt(receiptData)
      return new NextResponse(htmlReceipt, {
        headers: {
          "Content-Type": "text/html",
        },
      })
    } else {
      // JSON format
      return NextResponse.json({ receipt: receiptData })
    }
  } catch (error) {
    console.error("Error generating receipt:", error)
    return NextResponse.json({ error: "Failed to generate receipt" }, { status: 500 })
  }
}
