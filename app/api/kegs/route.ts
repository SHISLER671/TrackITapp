import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateKegFormData } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const brewery_id = searchParams.get('brewery_id')
    const current_holder = searchParams.get('current_holder')

    let query = supabase
      .from('kegs')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }
    if (brewery_id) {
      query = query.eq('brewery_id', brewery_id)
    }
    if (current_holder) {
      query = query.eq('current_holder', current_holder)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body: CreateKegFormData = await request.json()

    // Generate QR code (simple UUID for now)
    const qr_code = `keg-${crypto.randomUUID()}`

    const kegData = {
      ...body,
      qr_code,
      status: 'active' as const,
      current_holder: body.brewery_id, // Initially held by brewery
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('kegs')
      .insert(kegData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data, message: 'Keg created successfully' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
