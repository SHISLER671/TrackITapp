import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

// Schema for delivery rejection
const rejectDeliverySchema = z.object({
  reason: z.string().min(1).max(500),
});

// POST /api/deliveries/[id]/reject - Reject delivery (restaurant manager only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user, userRole } = authResult;
  
  // Only restaurant managers can reject deliveries
  if (userRole.role !== 'RESTAURANT_MANAGER') {
    return NextResponse.json(
      { error: 'Only restaurant managers can reject deliveries' },
      { status: 403 }
    );
  }
  
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = rejectDeliverySchema.parse(body);
    
    // Get delivery
    const { data: delivery, error: fetchError } = await supabase
      .from('deliveries')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (fetchError || !delivery) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      );
    }
    
    // Check if manager is the intended recipient
    if (delivery.restaurant_id !== userRole.id) {
      return NextResponse.json(
        { error: 'This delivery is not for your restaurant' },
        { status: 403 }
      );
    }
    
    // Check if delivery is still pending
    if (delivery.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Delivery is already ${delivery.status.toLowerCase()}` },
        { status: 400 }
      );
    }
    
    // Update delivery status
    const { data: updatedDelivery, error: updateError } = await supabase
      .from('deliveries')
      .update({
        status: 'REJECTED',
        notes: delivery.notes 
          ? `${delivery.notes}\n\nREJECTED: ${validatedData.reason}`
          : `REJECTED: ${validatedData.reason}`,
      })
      .eq('id', params.id)
      .select()
      .single();
    
    if (updateError) {
      throw updateError;
    }
    
    return NextResponse.json({
      message: 'Delivery rejected',
      delivery: updatedDelivery,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error rejecting delivery:', error);
    return NextResponse.json(
      { error: 'Failed to reject delivery' },
      { status: 500 }
    );
  }
}

