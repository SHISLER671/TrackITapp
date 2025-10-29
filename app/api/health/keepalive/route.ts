import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Keep-alive endpoint for Supabase free tier
 * This endpoint performs a lightweight database query to prevent project pausing
 * Should be called periodically via cron job (every hour recommended)
 */
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Perform a lightweight query - just count rows from a table
    // This is enough to keep the database active
    const { count, error } = await supabase
      .from('kegs')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Keep-alive query error:', error)
      // Even if there's an error, return success to not break cron
      // The connection attempt itself is enough activity
      return NextResponse.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        warning: 'Query had error but connection was active'
      })
    }

    return NextResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      count: count || 0
    })
  } catch (error) {
    // Even on error, attempting the connection counts as activity
    console.error('Keep-alive error:', error)
    return NextResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      note: 'Connection attempt registered'
    }, { status: 200 })
  }
}

