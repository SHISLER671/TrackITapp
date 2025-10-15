import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { supabase } from '@/lib/supabase';
import { updateKegMetadata } from '@/lib/thirdweb';
import { z } from 'zod';

// Schema for scan
const scanSchema = z.object({
  location: z.string().min(1),
  timestamp: z.string(),
});

// POST /api/kegs/[id]/scan - Record keg scan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user, userRole } = authResult;
  
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = scanSchema.parse(body);
    
    // Get keg
    const { id } = await params;
    const { data: keg, error: fetchError } = await supabase
      .from('kegs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !keg) {
      return NextResponse.json(
        { error: 'Keg not found' },
        { status: 404 }
      );
    }
    
    // Record scan in keg_scans table
    const { data: scan, error: scanError } = await supabase
      .from('keg_scans')
      .insert({
        keg_id: id,
        scanned_by: userRole.id,
        location: validatedData.location,
        timestamp: validatedData.timestamp,
      })
      .select()
      .single();
    
    if (scanError) {
      throw scanError;
    }
    
    // Update keg's last scan info
    const { data: updatedKeg, error: updateError } = await supabase
      .from('kegs')
      .update({
        last_scan: validatedData.timestamp,
        last_location: validatedData.location,
        current_holder: userRole.id,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      throw updateError;
    }
    
    // Update blockchain metadata (mock or real)
    await updateKegMetadata(id, {
      name: keg.name,
      type: keg.type,
      abv: keg.abv,
      ibu: keg.ibu,
      brew_date: keg.brew_date,
      keg_size: keg.keg_size,
      brewery_id: keg.brewery_id,
    });
    
    return NextResponse.json({
      message: 'Keg scanned successfully',
      scan,
      keg: updatedKeg,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error scanning keg:', error);
    return NextResponse.json(
      { error: 'Failed to scan keg' },
      { status: 500 }
    );
  }
}
