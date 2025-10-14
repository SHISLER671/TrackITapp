import { NextRequest, NextResponse } from 'next/server';
import { requireBrewerOrManager } from '@/lib/middleware/auth';
import { supabase } from '@/lib/supabase';
import { analyzeVariance } from '@/lib/ai/variance-analysis';
import { z } from 'zod';

// Schema for analysis request
const analyzeSchema = z.object({
  variance: z.number(),
  varianceStatus: z.enum(['NORMAL', 'WARNING', 'CRITICAL']),
});

// POST /api/kegs/[id]/analyze - Trigger variance analysis
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireBrewerOrManager(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user, userRole } = authResult;
  
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = analyzeSchema.parse(body);
    
    // Get keg with scan history
    const { data: keg, error: kegError } = await supabase
      .from('kegs')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (kegError || !keg) {
      return NextResponse.json(
        { error: 'Keg not found' },
        { status: 404 }
      );
    }
    
    // Check access permissions
    const hasAccess =
      (userRole.role === 'BREWER' && keg.brewery_id === userRole.brewery_id) ||
      (userRole.role === 'RESTAURANT_MANAGER' && keg.current_holder === userRole.id);
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Get scan history
    const { data: scans, error: scansError } = await supabase
      .from('keg_scans')
      .select('timestamp, location, scanned_by')
      .eq('keg_id', params.id)
      .order('timestamp', { ascending: true });
    
    if (scansError) {
      throw scansError;
    }
    
    // Run AI analysis
    const analysis = await analyzeVariance(
      keg,
      validatedData.variance,
      scans || []
    );
    
    // Store analysis report
    const { data: report, error: reportError } = await supabase
      .from('variance_reports')
      .insert({
        keg_id: params.id,
        variance_amount: validatedData.variance,
        status: validatedData.varianceStatus,
        ai_analysis: analysis,
        resolved: false,
      })
      .select()
      .single();
    
    if (reportError) {
      throw reportError;
    }
    
    return NextResponse.json({
      message: 'Variance analysis completed',
      report,
      analysis,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error analyzing variance:', error);
    return NextResponse.json(
      { error: 'Failed to analyze variance' },
      { status: 500 }
    );
  }
}

