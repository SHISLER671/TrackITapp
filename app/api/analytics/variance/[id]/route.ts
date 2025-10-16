import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get variance alert details
    const { data: variance, error } = await supabase
      .from('variance_alerts')
      .select(`
        *,
        keg:kegs!variance_alerts_keg_id_fkey (
          id,
          name,
          type,
          qr_code,
          status
        ),
        restaurant:restaurants!variance_alerts_restaurant_id_fkey (
          id,
          name,
          address
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching variance alert:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (!variance) {
      return NextResponse.json({ error: 'Variance alert not found' }, { status: 404 })
    }
    
    return NextResponse.json({ data: variance })
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
    
    // Validate that the variance alert exists
    const { data: existingVariance, error: fetchError } = await supabase
      .from('variance_alerts')
      .select('id, status')
      .eq('id', id)
      .single()
    
    if (fetchError || !existingVariance) {
      return NextResponse.json({ error: 'Variance alert not found' }, { status: 404 })
    }
    
    // Prepare update data
    const updateData: any = {}
    
    // Only allow certain fields to be updated
    const allowedFields = [
      'status',
      'notes',
      'resolution_notes',
      'assigned_to',
      'priority',
      'tags'
    ]
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })
    
    // Update timestamp
    updateData.updated_at = new Date().toISOString()
    
    // If status is being updated to resolved, set resolution date
    if (updateData.status === 'resolved') {
      updateData.resolved_at = new Date().toISOString()
    }
    
    // Update the variance alert
    const { data: variance, error: updateError } = await supabase
      .from('variance_alerts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating variance alert:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    
    // Log the status change
    await logVarianceAction(supabase, id, 'status_update', {
      oldStatus: existingVariance.status,
      newStatus: updateData.status,
      notes: updateData.notes
    })
    
    return NextResponse.json({ data: variance })
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
    
    // Check if variance alert exists
    const { data: existingVariance, error: fetchError } = await supabase
      .from('variance_alerts')
      .select('id, status')
      .eq('id', id)
      .single()
    
    if (fetchError || !existingVariance) {
      return NextResponse.json({ error: 'Variance alert not found' }, { status: 404 })
    }
    
    // Only allow deletion of false positive or resolved alerts
    if (!['false_positive', 'resolved'].includes(existingVariance.status)) {
      return NextResponse.json(
        { error: 'Only false positive or resolved alerts can be deleted' },
        { status: 400 }
      )
    }
    
    // Delete associated actions first
    const { error: actionsError } = await supabase
      .from('variance_actions')
      .delete()
      .eq('variance_id', id)
    
    if (actionsError) {
      console.error('Error deleting variance actions:', actionsError)
      return NextResponse.json({ error: actionsError.message }, { status: 500 })
    }
    
    // Delete the variance alert
    const { error: deleteError } = await supabase
      .from('variance_alerts')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.error('Error deleting variance alert:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }
    
    return NextResponse.json({ message: 'Variance alert deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function logVarianceAction(
  supabase: any, 
  varianceId: string, 
  action: string, 
  details: any
) {
  try {
    const { error } = await supabase
      .from('variance_actions')
      .insert({
        variance_id: varianceId,
        action_type: action,
        action_details: details,
        timestamp: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error logging variance action:', error)
    }
  } catch (error) {
    console.error('Unexpected error logging variance action:', error)
  }
}
