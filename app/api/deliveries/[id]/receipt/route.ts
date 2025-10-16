import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get the delivery with all related data
    const { data: delivery, error } = await supabase
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
          address,
          phone
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
            qr_code,
            status
          )
        )
      `)
      .eq('id', id)
      .single()
    
    if (error || !delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
    }
    
    // Calculate totals
    const totalKegs = delivery.delivery_items?.length || 0
    const totalDeposit = delivery.delivery_items?.reduce((sum: number, item: any) => 
      sum + (item.deposit_value || 0), 0) || 0
    
    // Format receipt data
    const receiptData = {
      delivery: {
        id: delivery.id,
        status: delivery.status,
        delivery_date: delivery.delivery_date,
        actual_delivery_date: delivery.actual_delivery_date,
        priority: delivery.priority,
        notes: delivery.notes,
        special_instructions: delivery.special_instructions
      },
      driver: {
        id: delivery.driver?.id,
        name: 'Driver Name', // Would need to join with users table for actual name
        role: delivery.driver?.role
      },
      restaurant: {
        name: delivery.restaurant?.name,
        address: delivery.restaurant?.address,
        phone: delivery.restaurant?.phone
      },
      items: delivery.delivery_items?.map((item: any) => ({
        keg_name: item.keg_name,
        keg_type: item.keg_type,
        keg_size: item.keg_size,
        deposit_value: item.deposit_value,
        qr_code: item.keg?.qr_code
      })) || [],
      totals: {
        total_kegs: totalKegs,
        total_deposit: totalDeposit
      },
      metadata: {
        generated_at: new Date().toISOString(),
        delivery_id: delivery.id
      }
    }
    
    return NextResponse.json({ data: receiptData })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
