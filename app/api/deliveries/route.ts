import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateDeliveryFormData } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const driver_id = searchParams.get('driver_id')

    let query = supabase
      .from('deliveries')
      .select(`
        *,
        delivery_items (
          id,
          keg_id,
          keg_name,
          keg_type,
          keg_size,
          deposit_value
        )
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }
    if (driver_id) {
      query = query.eq('driver_id', driver_id)
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
    const body: CreateDeliveryFormData = await request.json()

    // Create delivery
    const deliveryData = {
      from_location: body.from_location,
      to_location: body.to_location,
      scheduled_date: body.scheduled_date,
      notes: body.notes,
      status: 'pending' as const,
      driver_id: 'temp-driver-id', // TODO: Get from auth
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .insert(deliveryData)
      .select()
      .single()

    if (deliveryError) {
      return NextResponse.json({ error: deliveryError.message }, { status: 400 })
    }

    // Create delivery items
    const deliveryItems = body.keg_ids.map((keg_id: string) => ({
      delivery_id: delivery.id,
      keg_id,
      keg_name: 'Temporary Name', // TODO: Get from keg data
      keg_type: 'IPA' as const, // TODO: Get from keg data
      keg_size: 'half' as const, // TODO: Get from keg data
      deposit_value: 50, // TODO: Calculate based on size
      created_at: new Date().toISOString(),
    }))

    const { error: itemsError } = await supabase
      .from('delivery_items')
      .insert(deliveryItems)

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 400 })
    }

    return NextResponse.json({ data: delivery, message: 'Delivery created successfully' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
