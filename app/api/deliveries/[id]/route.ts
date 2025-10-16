import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: delivery, error } = await supabase
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
            qr_code,
            status
          )
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching delivery:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
    }
    
    return NextResponse.json({ data: delivery })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()
    
    // Validate that the delivery exists
    const { data: existingDelivery, error: fetchError } = await supabase
      .from('deliveries')
      .select('id, status')
      .eq('id', id)
      .single()
    
    if (fetchError || !existingDelivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
    }
    
    // Prepare update data
    const updateData: any = {}
    
    // Only allow certain fields to be updated
    const allowedFields = [
      'restaurant_id',
      'driver_id',
      'delivery_date',
      'priority',
      'notes',
      'special_instructions',
      'status'
    ]
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })
    
    // Convert delivery_date to ISO string if provided
    if (updateData.delivery_date) {
      updateData.delivery_date = new Date(updateData.delivery_date).toISOString()
    }
    
    // Update the delivery
    const { data: delivery, error: updateError } = await supabase
      .from('deliveries')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating delivery:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    
    // If status is being updated to completed, update keg statuses
    if (updateData.status === 'DELIVERED') {
      const { data: deliveryItems } = await supabase
        .from('delivery_items')
        .select('keg_id')
        .eq('delivery_id', id)
      
      if (deliveryItems && deliveryItems.length > 0) {
        const kegIds = deliveryItems.map(item => item.keg_id)
        
        await supabase
          .from('kegs')
          .update({ 
            status: 'DELIVERED',
            updated_at: new Date().toISOString()
          })
          .in('id', kegIds)
      }
    }
    
    return NextResponse.json({ data: delivery })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check if delivery exists
    const { data: existingDelivery, error: fetchError } = await supabase
      .from('deliveries')
      .select('id, status')
      .eq('id', id)
      .single()
    
    if (fetchError || !existingDelivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
    }
    
    // Only allow deletion of pending deliveries
    if (existingDelivery.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending deliveries can be deleted' },
        { status: 400 }
      )
    }
    
    // Delete delivery items first (due to foreign key constraints)
    const { error: itemsError } = await supabase
      .from('delivery_items')
      .delete()
      .eq('delivery_id', id)
    
    if (itemsError) {
      console.error('Error deleting delivery items:', itemsError)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }
    
    // Delete the delivery
    const { error: deleteError } = await supabase
      .from('deliveries')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.error('Error deleting delivery:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }
    
    return NextResponse.json({ message: 'Delivery deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
