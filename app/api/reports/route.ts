import { NextRequest, NextResponse } from 'next/server';
import { requireBrewerOrManager } from '@/lib/middleware/auth';
import { supabase } from '@/lib/supabase';

// GET /api/reports - List variance reports
export async function GET(request: NextRequest) {
  const authResult = await requireBrewerOrManager(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user, userRole } = authResult;
  
  try {
    // Build query based on role
    let query = supabase
      .from('variance_reports')
      .select('*, kegs(*)')
      .order('created_at', { ascending: false });
    
    // Filter by brewery for brewers
    if (userRole.role === 'BREWER') {
      // Join with kegs table to filter by brewery
      query = query.eq('kegs.brewery_id', userRole.brewery_id);
    } else if (userRole.role === 'RESTAURANT_MANAGER') {
      // Filter by current holder
      query = query.eq('kegs.current_holder', userRole.id);
    }
    
    const { data: reports, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
