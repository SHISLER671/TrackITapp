import { type NextRequest, NextResponse } from "next/server"
import { requireRestaurantManager } from "@/lib/middleware/auth"
import { createClient } from "@/lib/supabase/server"
import { burnKeg } from "@/lib/thirdweb"
import { initPOSAdapter } from "@/lib/pos"
import { calculateVarianceStatus } from "@/lib/types"

// POST /api/kegs/[id]/retire - Retire (burn) a keg
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireRestaurantManager(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user, userRole } = authResult

  const supabase = await createClient()

  try {
    // Get keg
    const { id } = await params
    const { data: keg, error: fetchError } = await supabase.from("kegs").select("*").eq("id", id).single()

    if (fetchError || !keg) {
      return NextResponse.json({ error: "Keg not found" }, { status: 404 })
    }

    // Check if keg is already retired
    if (keg.is_empty) {
      return NextResponse.json({ error: "Keg is already retired" }, { status: 400 })
    }

    // Check if user has access
    if (keg.current_holder !== userRole.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get final pint count from POS
    const posAdapter = initPOSAdapter()
    const finalPintsSold = await posAdapter.getPintCount(id)

    // Calculate variance
    const variance = keg.expected_pints - finalPintsSold
    const varianceStatus = calculateVarianceStatus(variance)

    // Burn keg token (mock or real blockchain)
    await burnKeg(id)

    // Update keg as empty
    const { data: updatedKeg, error: updateError } = await supabase
      .from("kegs")
      .update({
        is_empty: true,
        pints_sold: finalPintsSold,
        variance,
        variance_status: varianceStatus,
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // If variance is WARNING or CRITICAL, trigger analysis
    if (varianceStatus === "WARNING" || varianceStatus === "CRITICAL") {
      // Trigger variance analysis (will be handled by analyze endpoint)
      await fetch(`${request.nextUrl.origin}/api/kegs/${id}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: request.headers.get("authorization") || "",
        },
        body: JSON.stringify({
          variance,
          varianceStatus,
        }),
      })
    }

    return NextResponse.json({
      message: "Keg retired successfully",
      keg: updatedKeg,
      variance,
      varianceStatus,
      analysisTriggered: varianceStatus !== "NORMAL",
    })
  } catch (error) {
    console.error("Error retiring keg:", error)
    return NextResponse.json({ error: "Failed to retire keg" }, { status: 500 })
  }
}
