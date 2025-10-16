import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const driverId = searchParams.get('driver_id')
    const restaurantId = searchParams.get('restaurant_id')
    
    let query = supabase
      .from('deliveries')
      .select(`
        *,
        driver:user_roles!deliveries_driver_id_fkey (
          id,
          user_id,
          role,
          brewery_id
        ),
        restaurant:restaurants!deliveries_restaurant_id_fkey (
          id,
          name,
          address
        ),
        delivery_items (
          id,
          keg_id,
          keg_name,
          keg_type,
          keg_size,
          deposit_value,
          keg:kegs!delivery_items_keg_id_fkey (
            id,
            name,
            type,
            keg_size,
            abv,
            qr_code
          )
        )
      `)
    
    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (driverId) {
      query = query.eq('driver_id', driverId)
    }
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId)
    }
    
    const { data: deliveries, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching deliveries:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ data: deliveries })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const {
      restaurant_id,
      driver_id,
      delivery_date,
      priority = 'medium',
      notes,
      special_instructions,
      kegs = []
    } = body
    
    // Validate required fields
    if (!restaurant_id || !driver_id || !delivery_date) {
      return NextResponse.json(
        { error: 'Missing required fields: restaurant_id, driver_id, delivery_date' },
        { status: 400 }
      )
    }
    
    // Start a transaction-like operation
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .insert({
        restaurant_id,
        driver_id,
        delivery_date: new Date(delivery_date).toISOString(),
        priority,
        notes,
        special_instructions,
        status: 'PENDING'
      })
      .select()
      .single()
    
    if (deliveryError) {
      console.error('Error creating delivery:', deliveryError)
      return NextResponse.json({ error: deliveryError.message }, { status: 500 })
    }
    
    // Add delivery items if kegs are provided
    if (kegs.length > 0) {
      const deliveryItems = kegs.map((keg: any) => ({
        delivery_id: delivery.id,
        keg_id: keg.kegId || keg.id,
        keg_name: keg.name,
        keg_type: keg.type,
        keg_size: keg.size || keg.keg_size,
        deposit_value: calculateKegDeposit(keg.size || keg.keg_size)
      }))
      
      const { error: itemsError } = await supabase
        .from('delivery_items')
        .insert(deliveryItems)
      
      if (itemsError) {
        console.error('Error creating delivery items:', itemsError)
        // Clean up the delivery if items creation fails
        await supabase.from('deliveries').delete().eq('id', delivery.id)
        return NextResponse.json({ error: itemsError.message }, { status: 500 })
      }
    }
    
    // Return the complete delivery with items
    const { data: completeDelivery, error: fetchError } = await supabase
      .from('deliveries')
      .select(`
        *,
        driver:user_roles!deliveries_driver_id_fkey (
          id,
          user_id,
          role
        ),
        restaurant:restaurants!deliveries_restaurant_id_fkey (
          id,
          name,
          address
        ),
        delivery_items (
          id,
          keg_id,
          keg_name,
          keg_type,
          keg_size,
          deposit_value
        )
      `)
      .eq('id', delivery.id)
      .single()
    
    if (fetchError) {
      console.error('Error fetching complete delivery:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }
    
    return NextResponse.json({ data: completeDelivery }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to calculate keg deposit based on size
function calculateKegDeposit(size: string): number {
  const depositRates: { [key: string]: number } = {
    'Corny': 50,
    'SixthBarrel': 75,
    'QuarterBarrel': 100,
    'SlimQuarter': 100,
    'HalfBarrel': 150
  }
  
  return depositRates[size] || 100 // Default deposit
}