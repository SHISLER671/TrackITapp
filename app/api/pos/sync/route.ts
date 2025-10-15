import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { initPOSAdapter } from '@/lib/pos';
import { supabase } from '@/lib/supabase';

// POST /api/pos/sync - Manual POS sync
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user, userRole } = authResult;
  
  try {
    // Initialize POS adapter
    const posAdapter = initPOSAdapter();
    
    // Sync sales from POS
    await posAdapter.syncSales();
    
    // Get all active kegs
    const { data: activeKegs, error: kegsError } = await supabase
      .from('kegs')
      .select('id')
      .eq('is_empty', false);
    
    if (kegsError) {
      throw kegsError;
    }
    
    // Update pint counts for all active kegs
    let updatedCount = 0;
    const errors = [];
    
    for (const keg of activeKegs || []) {
      try {
        const pintCount = await posAdapter.getPintCount(keg.id);
        
        // Upsert pos_sales record
        await supabase
          .from('pos_sales')
          .upsert({
            keg_id: keg.id,
            pints_sold: pintCount,
            last_sync: new Date().toISOString(),
          }, {
            onConflict: 'keg_id',
          });
        
        updatedCount++;
      } catch (error) {
        console.error(`Error syncing keg ${keg.id}:`, error);
        errors.push({ kegId: keg.id, error: String(error) });
      }
    }
    
    return NextResponse.json({
      message: 'POS sync completed',
      synced: updatedCount,
      total: activeKegs?.length || 0,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error syncing POS:', error);
    return NextResponse.json(
      { error: 'Failed to sync POS data' },
      { status: 500 }
    );
  }
}
