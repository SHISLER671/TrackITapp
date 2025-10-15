import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware/auth"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

// Schema for keg update
const updateKegSchema = z.object({
  current_holder: z.string().uuid().optional(),
  last_scan: z.string().optional(),
  last_location: z.string().optional(),
  is_empty: z.boolean().optional(),
  pints_sold: z.number().int().min(0).optional(),
})

// GET /api/kegs/[id] - Get single keg
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user, userRole } = authResult

  try {
    const supabase = await createClient()
    const { id } = await params
    const { data: keg, error } = await supabase.from("kegs").select("*").eq("id", id).single()

    if (error) {
      throw error
    }

    if (!keg) {
      return NextResponse.json({ error: "Keg not found" }, { status: 404 })
    }

    // Check access permissions
    const hasAccess =
      (userRole.role === "BREWER" && keg.brewery_id === userRole.brewery_id) ||
      (userRole.role === "DRIVER" && keg.current_holder === userRole.id) ||
      (userRole.role === "RESTAURANT_MANAGER" && keg.current_holder === userRole.id)

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json({ keg })
  } catch (error) {
    console.error("Error fetching keg:", error)
    return NextResponse.json({ error: "Failed to fetch keg" }, { status: 500 })
  }
}

// PATCH /api/kegs/[id] - Update keg
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user, userRole } = authResult

  try {
    const body = await request.json()

    // Validate input
    const validatedData = updateKegSchema.parse(body)

    const supabase = await createClient()

    // Get existing keg
    const { id } = await params
    const { data: existingKeg, error: fetchError } = await supabase.from("kegs").select("*").eq("id", id).single()

    if (fetchError || !existingKeg) {
      return NextResponse.json({ error: "Keg not found" }, { status: 404 })
    }

    // Check access permissions
    const hasAccess =
      (userRole.role === "BREWER" && existingKeg.brewery_id === userRole.brewery_id) ||
      (userRole.role === "DRIVER" && existingKeg.current_holder === userRole.id) ||
      (userRole.role === "RESTAURANT_MANAGER" && existingKeg.current_holder === userRole.id)

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Update keg
    const { data: keg, error } = await supabase.from("kegs").update(validatedData).eq("id", id).select().single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: "Keg updated successfully",
      keg,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    console.error("Error updating keg:", error)
    return NextResponse.json({ error: "Failed to update keg" }, { status: 500 })
  }
}
