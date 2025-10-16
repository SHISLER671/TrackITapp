import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const body = await request.json()
    const { reason, notes } = body
    
    // Validate required fields
    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }
    
    // Get the delivery
    const { data: delivery, error: fetchError } = await supabase
      .from('deliveries')
      .select(`
        *,
        delivery_items (
          keg_id,
          keg:kegs!delivery_items_keg_id_fkey (
            id,
            status
          )
        )
      `)
      .eq('id', id)
      .single()
    
    if (fetchError || !delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
    }
    
    // Check if delivery is in a state that can be rejected
    if (!['IN_TRANSIT', 'PENDING'].includes(delivery.status)) {
      return NextResponse.json(
        { error: 'Delivery cannot be rejected in current status' },
        { status: 400 }
      )
    }
    
    // Update delivery status to rejected
    const { data: updatedDelivery, error: updateError } = await supabase
      .from('deliveries')
      .update({
        status: 'REJECTED',
        notes: notes || delivery.notes,
        rejection_reason: reason,
        rejection_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating delivery:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    
    // Return kegs to available status if they were marked as in transit
    if (delivery.delivery_items && delivery.delivery_items.length > 0) {
      const kegIds = delivery.delivery_items.map((item: any) => item.keg_id)
      
      const { error: kegUpdateError } = await supabase
        .from('kegs')
        .update({
          status: 'ACTIVE',
          updated_at: new Date().toISOString()
        })
        .in('id', kegIds)
      
      if (kegUpdateError) {
        console.error('Error updating keg statuses:', kegUpdateError)
        // Don't fail the request, but log the error
      }
      
      // Create keg scans for rejected kegs (returned to warehouse)
      const scanRecords = kegIds.map((kegId: string) => ({
        keg_id: kegId,
        location: 'Warehouse (Returned)',
        scanned_by: delivery.driver_id,
        timestamp: new Date().toISOString(),
        notes: `Delivery rejected: ${reason}`
      }))
      
      const { error: scanError } = await supabase
        .from('keg_scans')
        .insert(scanRecords)
      
      if (scanError) {
        console.error('Error creating keg scans:', scanError)
        // Don't fail the request, but log the error
      }
    }
    
    // Return the updated delivery with complete data
    const { data: completeDelivery, error: completeError } = await supabase
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
    
    if (completeError) {
      console.error('Error fetching complete delivery:', completeError)
      return NextResponse.json({ error: completeError.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      data: completeDelivery,
      message: 'Delivery rejected successfully' 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
