import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, requireBrewer } from "@/lib/middleware/auth"
import { createClient } from "@/lib/supabase/server"
import { mintKeg } from "@/lib/thirdweb"
import { calculateExpectedPints, parseABV } from "@/lib/types"
import { z } from "zod"

// Schema for keg creation
const createKegSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.string().min(1).max(50),
  abv: z.number().min(0).max(20),
  ibu: z.number().int().min(1).max(120),
  brew_date: z.string(),
  keg_size: z.enum(["1/6BBL", "1/4BBL", "1/2BBL", "Pony", "Cornelius"]),
  brewery_id: z.string().uuid(),
})

// GET /api/kegs - List kegs (filtered by role)
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user, userRole } = authResult

  try {
    const supabase = await createClient()
    let query = supabase.from("kegs").select("*")

    // Filter based on role
    if (userRole.role === "BREWER") {
      query = query.eq("brewery_id", userRole.brewery_id)
    } else if (userRole.role === "DRIVER" || userRole.role === "RESTAURANT_MANAGER") {
      query = query.eq("current_holder", userRole.id)
    }

    const { data: kegs, error } = await query.order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ kegs })
  } catch (error) {
    console.error("Error fetching kegs:", error)
    return NextResponse.json({ error: "Failed to fetch kegs" }, { status: 500 })
  }
}

// POST /api/kegs - Create new keg (brewers only)
export async function POST(request: NextRequest) {
  const authResult = await requireBrewer(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user, userRole } = authResult

  try {
    const body = await request.json()

    // Validate input
    const validatedData = createKegSchema.parse(body)

    // Verify brewery ownership
    if (validatedData.brewery_id !== userRole.brewery_id) {
      return NextResponse.json({ error: "Cannot create keg for another brewery" }, { status: 403 })
    }

    // Calculate expected pints based on keg size
    const expectedPints = calculateExpectedPints(validatedData.keg_size)

    // Mint keg token (mock or real blockchain)
    const tokenId = await mintKeg({
      name: validatedData.name,
      type: validatedData.type,
      abv: parseABV(validatedData.abv),
      ibu: validatedData.ibu,
      brew_date: validatedData.brew_date,
      keg_size: validatedData.keg_size,
      brewery_id: validatedData.brewery_id,
    })

    const supabase = await createClient()

    // Store keg in database
    const { data: keg, error } = await supabase
      .from("kegs")
      .insert({
        id: tokenId,
        brewery_id: validatedData.brewery_id,
        name: validatedData.name,
        type: validatedData.type,
        abv: parseABV(validatedData.abv),
        ibu: validatedData.ibu,
        brew_date: validatedData.brew_date,
        keg_size: validatedData.keg_size,
        expected_pints: expectedPints,
        current_holder: userRole.id,
        is_empty: false,
        pints_sold: 0,
        variance: 0,
        variance_status: "NORMAL",
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(
      {
        message: "Keg created successfully",
        keg,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    console.error("Error creating keg:", error)
    return NextResponse.json({ error: "Failed to create keg" }, { status: 500 })
  }
}
