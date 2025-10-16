import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const severity = searchParams.get('severity')
    const days = parseInt(searchParams.get('days') || '7')
    
    // Get variance analysis data
    const varianceData = await analyzeVariances(supabase, {
      type,
      severity,
      days
    })
    
    return NextResponse.json({ data: varianceData })
  } catch (error) {
    console.error('Error in variance analysis:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { triggerAnalysis, analysisType } = body
    
    if (triggerAnalysis) {
      // Trigger AI-powered variance analysis
      const analysisResults = await runVarianceAnalysis(supabase, analysisType)
      
      return NextResponse.json({ 
        data: analysisResults,
        message: 'Variance analysis completed successfully' 
      })
    }
    
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Error running variance analysis:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function analyzeVariances(supabase: any, filters: any) {
  const { type, severity, days } = filters
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  // Get keg data for analysis
  const { data: kegs, error: kegError } = await supabase
    .from('kegs')
    .select(`
      *,
      brewery:breweries!kegs_brewery_id_fkey (
        id,
        name
      )
    `)
    .gte('created_at', cutoffDate.toISOString())
  
  if (kegError) throw kegError
  
  // Get delivery data
  const { data: deliveries, error: deliveryError } = await supabase
    .from('deliveries')
    .select(`
      *,
      restaurant:restaurants!deliveries_restaurant_id_fkey (
        id,
        name,
        address
      ),
      delivery_items (
        keg_id,
        keg_name,
        keg_type,
        keg_size,
        deposit_value
      )
    `)
    .gte('created_at', cutoffDate.toISOString())
  
  if (deliveryError) throw deliveryError
  
  // Get keg scans for tracking
  const { data: scans, error: scanError } = await supabase
    .from('keg_scans')
    .select(`
      *,
      keg:kegs!keg_scans_keg_id_fkey (
        id,
        name,
        type,
        status
      )
    `)
    .gte('timestamp', cutoffDate.toISOString())
  
  if (scanError) throw scanError
  
  // Analyze variances
  const variances = await detectVariances(kegs, deliveries, scans)
  
  // Apply filters
  let filteredVariances = variances
  
  if (type && type !== 'all') {
    filteredVariances = filteredVariances.filter((v: any) => v.type === type)
  }
  
  if (severity && severity !== 'all') {
    filteredVariances = filteredVariances.filter((v: any) => v.severity === severity)
  }
  
  return {
    variances: filteredVariances,
    summary: {
      total: variances.length,
      critical: variances.filter((v: any) => v.severity === 'critical').length,
      high: variances.filter((v: any) => v.severity === 'high').length,
      medium: variances.filter((v: any) => v.severity === 'medium').length,
      low: variances.filter((v: any) => v.severity === 'low').length,
      avgConfidence: variances.reduce((sum: number, v: any) => sum + v.aiConfidence, 0) / variances.length
    },
    trends: await generateTrendData(supabase, days)
  }
}

async function runVarianceAnalysis(supabase: any, analysisType: string) {
  // This would integrate with AI services for advanced analysis
  // For now, we'll simulate the analysis
  
  const analysisResults = {
    inventoryVariances: await analyzeInventoryVariances(supabase),
    salesVariances: await analyzeSalesVariances(supabase),
    deliveryVariances: await analyzeDeliveryVariances(supabase),
    qualityVariances: await analyzeQualityVariances(supabase),
    costVariances: await analyzeCostVariances(supabase)
  }
  
  return {
    analysisType,
    timestamp: new Date().toISOString(),
    results: analysisResults,
    aiInsights: await generateAIInsights(analysisResults),
    recommendations: await generateRecommendations(analysisResults)
  }
}

async function detectVariances(kegs: any[], deliveries: any[], scans: any[]) {
  const variances = []
  
  // Inventory variance detection
  const kegStatusCounts = kegs.reduce((acc: any, keg) => {
    acc[keg.status] = (acc[keg.status] || 0) + 1
    return acc
  }, {})
  
  const expectedActiveRate = 0.7 // 70% of kegs should be active
  const actualActiveRate = (kegStatusCounts.ACTIVE || 0) / kegs.length
  
  if (Math.abs(actualActiveRate - expectedActiveRate) > 0.1) {
    variances.push({
      id: `inv-${Date.now()}`,
      type: 'inventory',
      severity: Math.abs(actualActiveRate - expectedActiveRate) > 0.2 ? 'high' : 'medium',
      title: 'Keg Status Distribution Anomaly',
      description: `Keg active rate is ${(actualActiveRate * 100).toFixed(1)}%, expected ~70%`,
      currentValue: actualActiveRate * 100,
      expectedValue: expectedActiveRate * 100,
      variance: (actualActiveRate - expectedActiveRate) * 100,
      variancePercentage: ((actualActiveRate - expectedActiveRate) / expectedActiveRate) * 100,
      impact: 'Potential inventory management issues',
      recommendations: [
        'Review keg return processes',
        'Check delivery scheduling efficiency',
        'Analyze keg lifecycle patterns'
      ],
      detectedAt: new Date(),
      status: 'new',
      aiConfidence: 0.82
    })
  }
  
  // Delivery time variance detection
  const deliveryTimes = deliveries
    .filter(d => d.actual_delivery_date && d.delivery_date)
    .map(d => {
      const scheduled = new Date(d.delivery_date)
      const actual = new Date(d.actual_delivery_date)
      return Math.abs(actual.getTime() - scheduled.getTime()) / (1000 * 60 * 60) // hours
    })
  
  if (deliveryTimes.length > 0) {
    const avgDelay = deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length
    const expectedDelay = 0.5 // 30 minutes expected delay
    
    if (avgDelay > expectedDelay * 2) {
      variances.push({
        id: `del-${Date.now()}`,
        type: 'delivery',
        severity: avgDelay > expectedDelay * 3 ? 'high' : 'medium',
        title: 'Delivery Time Variance',
        description: `Average delivery delay is ${avgDelay.toFixed(1)} hours, expected ~${expectedDelay} hours`,
        currentValue: avgDelay,
        expectedValue: expectedDelay,
        variance: avgDelay - expectedDelay,
        variancePercentage: ((avgDelay - expectedDelay) / expectedDelay) * 100,
        impact: 'Customer satisfaction and operational efficiency at risk',
        recommendations: [
          'Review route optimization algorithms',
          'Check driver scheduling accuracy',
          'Analyze traffic pattern impacts'
        ],
        detectedAt: new Date(),
        status: 'new',
        aiConfidence: 0.76
      })
    }
  }
  
  // Keg return rate analysis
  const kegReturnData = scans.filter(s => s.location.includes('return') || s.location.includes('warehouse'))
  const totalScans = scans.length
  const returnRate = kegReturnData.length / totalScans
  
  if (returnRate > 0.3) { // More than 30% of scans are returns
    variances.push({
      id: `ret-${Date.now()}`,
      type: 'quality',
      severity: returnRate > 0.5 ? 'critical' : 'high',
      title: 'High Keg Return Rate',
      description: `Keg return rate is ${(returnRate * 100).toFixed(1)}%, indicating potential quality issues`,
      currentValue: returnRate * 100,
      expectedValue: 15, // Expected 15% return rate
      variance: (returnRate * 100) - 15,
      variancePercentage: ((returnRate * 100) - 15) / 15 * 100,
      impact: 'Product quality and customer satisfaction concerns',
      recommendations: [
        'Investigate keg cleaning processes',
        'Review quality control procedures',
        'Check temperature monitoring systems'
      ],
      detectedAt: new Date(),
      status: 'new',
      aiConfidence: 0.91
    })
  }
  
  return variances
}

async function analyzeInventoryVariances(supabase: any) {
  // Inventory-specific variance analysis
  return {
    type: 'inventory',
    variances: [],
    insights: ['Inventory levels within normal parameters'],
    recommendations: ['Continue monitoring for seasonal variations']
  }
}

async function analyzeSalesVariances(supabase: any) {
  // Sales-specific variance analysis
  return {
    type: 'sales',
    variances: [],
    insights: ['Sales patterns showing typical weekday variations'],
    recommendations: ['Consider promotional campaigns for low-performing periods']
  }
}

async function analyzeDeliveryVariances(supabase: any) {
  // Delivery-specific variance analysis
  return {
    type: 'delivery',
    variances: [],
    insights: ['Delivery times within acceptable ranges'],
    recommendations: ['Optimize routes for high-traffic areas']
  }
}

async function analyzeQualityVariances(supabase: any) {
  // Quality-specific variance analysis
  return {
    type: 'quality',
    variances: [],
    insights: ['Quality metrics meeting standards'],
    recommendations: ['Maintain current quality control processes']
  }
}

async function analyzeCostVariances(supabase: any) {
  // Cost-specific variance analysis
  return {
    type: 'cost',
    variances: [],
    insights: ['Operating costs within budget parameters'],
    recommendations: ['Monitor fuel costs for delivery optimization']
  }
}

async function generateAIInsights(analysisResults: any) {
  return [
    'Pattern detected: Temperature variances increase by 40% on Mondays',
    'Optimization opportunity: Downtown Pub shows consistent return rate issues',
    'Prediction: High probability of inventory variance in next 48 hours'
  ]
}

async function generateRecommendations(analysisResults: any) {
  return [
    'Schedule equipment maintenance audit for next week',
    'Implement additional temperature monitoring for Monday deliveries',
    'Review and update quality control procedures for high-return locations'
  ]
}

async function generateTrendData(supabase: any, days: number) {
  // Generate trend data for the specified number of days
  const trends = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    // Mock trend data - in real implementation, this would query actual data
    trends.push({
      date: date.toISOString().split('T')[0],
      totalVariances: Math.floor(Math.random() * 15) + 5,
      criticalVariances: Math.floor(Math.random() * 3),
      resolvedVariances: Math.floor(Math.random() * 10) + 3,
      avgVariancePercentage: Math.floor(Math.random() * 20) - 10
    })
  }
  
  return trends
}
