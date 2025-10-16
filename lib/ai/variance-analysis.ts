import { createClient } from '@/lib/supabase/client'

export interface VarianceDetectionConfig {
  sensitivity: 'low' | 'medium' | 'high'
  types: ('inventory' | 'sales' | 'delivery' | 'quality' | 'cost')[]
  timeWindow: number // hours
  minConfidence: number // 0-1
}

export interface VarianceResult {
  id: string
  type: 'inventory' | 'sales' | 'delivery' | 'quality' | 'cost'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  currentValue: number
  expectedValue: number
  variance: number
  variancePercentage: number
  impact: string
  recommendations: string[]
  detectedAt: Date
  confidence: number
  dataPoints: number
  kegId?: string
  restaurantId?: string
}

export class VarianceAnalyzer {
  private supabase: any
  private config: VarianceDetectionConfig

  constructor(config: Partial<VarianceDetectionConfig> = {}) {
    this.supabase = createClient()
    this.config = {
      sensitivity: 'medium',
      types: ['inventory', 'sales', 'delivery', 'quality', 'cost'],
      timeWindow: 24,
      minConfidence: 0.7,
      ...config
    }
  }

  async analyzeVariances(): Promise<VarianceResult[]> {
    const results: VarianceResult[] = []
    
    try {
      // Run all configured variance analyses
      for (const type of this.config.types) {
        const typeResults = await this.analyzeByType(type)
        results.push(...typeResults)
      }
      
      // Filter by confidence threshold
      return results.filter(result => result.confidence >= this.config.minConfidence)
    } catch (error) {
      console.error('Error in variance analysis:', error)
      return []
    }
  }

  private async analyzeByType(type: string): Promise<VarianceResult[]> {
    switch (type) {
      case 'inventory':
        return this.analyzeInventoryVariances()
      case 'sales':
        return this.analyzeSalesVariances()
      case 'delivery':
        return this.analyzeDeliveryVariances()
      case 'quality':
        return this.analyzeQualityVariances()
      case 'cost':
        return this.analyzeCostVariances()
      default:
        return []
    }
  }

  private async analyzeInventoryVariances(): Promise<VarianceResult[]> {
    const results: VarianceResult[] = []
    
    try {
      // Get keg inventory data
      const { data: kegs, error } = await this.supabase
        .from('kegs')
        .select(`
          *,
          brewery:breweries!kegs_brewery_id_fkey (id, name),
          scans:keg_scans (id, timestamp, location, scanned_by)
        `)
        .gte('created_at', this.getTimeWindowStart().toISOString())
      
      if (error) throw error
      
      // Analyze keg status distribution
      const statusAnalysis = this.analyzeKegStatusDistribution(kegs)
      if (statusAnalysis) results.push(statusAnalysis)
      
      // Analyze keg lifecycle patterns
      const lifecycleAnalysis = this.analyzeKegLifecycle(kegs)
      if (lifecycleAnalysis) results.push(lifecycleAnalysis)
      
      // Analyze inventory turnover
      const turnoverAnalysis = this.analyzeInventoryTurnover(kegs)
      if (turnoverAnalysis) results.push(turnoverAnalysis)
      
    } catch (error) {
      console.error('Error analyzing inventory variances:', error)
    }
    
    return results
  }

  private async analyzeSalesVariances(): Promise<VarianceResult[]> {
    const results: VarianceResult[] = []
    
    try {
      // This would integrate with POS data for sales analysis
      // For now, we'll use delivery data as a proxy
      const { data: deliveries, error } = await this.supabase
        .from('deliveries')
        .select(`
          *,
          restaurant:restaurants!deliveries_restaurant_id_fkey (id, name),
          delivery_items (keg_id, keg_name, keg_type, keg_size, deposit_value)
        `)
        .gte('created_at', this.getTimeWindowStart().toISOString())
      
      if (error) throw error
      
      // Analyze delivery volume patterns
      const volumeAnalysis = this.analyzeDeliveryVolumePatterns(deliveries)
      if (volumeAnalysis) results.push(volumeAnalysis)
      
      // Analyze product mix variations
      const mixAnalysis = this.analyzeProductMixVariations(deliveries)
      if (mixAnalysis) results.push(mixAnalysis)
      
    } catch (error) {
      console.error('Error analyzing sales variances:', error)
    }
    
    return results
  }

  private async analyzeDeliveryVariances(): Promise<VarianceResult[]> {
    const results: VarianceResult[] = []
    
    try {
      const { data: deliveries, error } = await this.supabase
        .from('deliveries')
        .select(`
          *,
          driver:user_roles!deliveries_driver_id_fkey (id, role),
          restaurant:restaurants!deliveries_restaurant_id_fkey (id, name, address)
        `)
        .gte('created_at', this.getTimeWindowStart().toISOString())
      
      if (error) throw error
      
      // Analyze delivery timing variances
      const timingAnalysis = this.analyzeDeliveryTiming(deliveries)
      if (timingAnalysis) results.push(timingAnalysis)
      
      // Analyze delivery efficiency
      const efficiencyAnalysis = this.analyzeDeliveryEfficiency(deliveries)
      if (efficiencyAnalysis) results.push(efficiencyAnalysis)
      
    } catch (error) {
      console.error('Error analyzing delivery variances:', error)
    }
    
    return results
  }

  private async analyzeQualityVariances(): Promise<VarianceResult[]> {
    const results: VarianceResult[] = []
    
    try {
      const { data: scans, error } = await this.supabase
        .from('keg_scans')
        .select(`
          *,
          keg:kegs!keg_scans_keg_id_fkey (id, name, type, status)
        `)
        .gte('timestamp', this.getTimeWindowStart().toISOString())
      
      if (error) throw error
      
      // Analyze return rate patterns
      const returnRateAnalysis = this.analyzeReturnRates(scans)
      if (returnRateAnalysis) results.push(returnRateAnalysis)
      
      // Analyze quality control patterns
      const qualityAnalysis = this.analyzeQualityControlPatterns(scans)
      if (qualityAnalysis) results.push(qualityAnalysis)
      
    } catch (error) {
      console.error('Error analyzing quality variances:', error)
    }
    
    return results
  }

  private async analyzeCostVariances(): Promise<VarianceResult[]> {
    const results: VarianceResult[] = []
    
    try {
      // Analyze operational cost patterns
      const costAnalysis = this.analyzeOperationalCosts()
      if (costAnalysis) results.push(costAnalysis)
      
    } catch (error) {
      console.error('Error analyzing cost variances:', error)
    }
    
    return results
  }

  private analyzeKegStatusDistribution(kegs: any[]): VarianceResult | null {
    const statusCounts = kegs.reduce((acc, keg) => {
      acc[keg.status] = (acc[keg.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const totalKegs = kegs.length
    const activeRate = (statusCounts.ACTIVE || 0) / totalKegs
    const expectedActiveRate = 0.7 // 70% expected
    
    const variance = activeRate - expectedActiveRate
    const variancePercentage = (variance / expectedActiveRate) * 100
    
    if (Math.abs(variancePercentage) > this.getSensitivityThreshold()) {
      return {
        id: `inv-status-${Date.now()}`,
        type: 'inventory',
        severity: this.getSeverity(variancePercentage),
        title: 'Keg Status Distribution Anomaly',
        description: `Keg active rate is ${(activeRate * 100).toFixed(1)}%, expected ~${(expectedActiveRate * 100)}%`,
        currentValue: activeRate * 100,
        expectedValue: expectedActiveRate * 100,
        variance: variance * 100,
        variancePercentage,
        impact: this.getImpact('inventory', variancePercentage),
        recommendations: this.getRecommendations('inventory', variancePercentage),
        detectedAt: new Date(),
        confidence: this.calculateConfidence(Math.abs(variancePercentage), totalKegs),
        dataPoints: totalKegs
      }
    }
    
    return null
  }

  private analyzeKegLifecycle(kegs: any[]): VarianceResult | null {
    // Analyze keg lifecycle patterns
    const lifecycleData = kegs.map(keg => {
      const scans = keg.scans || []
      const lifecycle = this.calculateKegLifecycle(keg, scans)
      return lifecycle
    })
    
    const avgLifecycle = lifecycleData.reduce((sum, life) => sum + life, 0) / lifecycleData.length
    const expectedLifecycle = 14 // days
    
    const variance = avgLifecycle - expectedLifecycle
    const variancePercentage = (variance / expectedLifecycle) * 100
    
    if (Math.abs(variancePercentage) > this.getSensitivityThreshold()) {
      return {
        id: `inv-lifecycle-${Date.now()}`,
        type: 'inventory',
        severity: this.getSeverity(variancePercentage),
        title: 'Keg Lifecycle Variance',
        description: `Average keg lifecycle is ${avgLifecycle.toFixed(1)} days, expected ~${expectedLifecycle} days`,
        currentValue: avgLifecycle,
        expectedValue: expectedLifecycle,
        variance,
        variancePercentage,
        impact: this.getImpact('inventory', variancePercentage),
        recommendations: this.getRecommendations('inventory', variancePercentage),
        detectedAt: new Date(),
        confidence: this.calculateConfidence(Math.abs(variancePercentage), lifecycleData.length),
        dataPoints: lifecycleData.length
      }
    }
    
    return null
  }

  private analyzeInventoryTurnover(kegs: any[]): VarianceResult | null {
    // Calculate inventory turnover rate
    const turnoverRate = this.calculateInventoryTurnover(kegs)
    const expectedTurnover = 0.8 // 80% monthly turnover
    
    const variance = turnoverRate - expectedTurnover
    const variancePercentage = (variance / expectedTurnover) * 100
    
    if (Math.abs(variancePercentage) > this.getSensitivityThreshold()) {
      return {
        id: `inv-turnover-${Date.now()}`,
        type: 'inventory',
        severity: this.getSeverity(variancePercentage),
        title: 'Inventory Turnover Variance',
        description: `Inventory turnover rate is ${(turnoverRate * 100).toFixed(1)}%, expected ~${(expectedTurnover * 100)}%`,
        currentValue: turnoverRate * 100,
        expectedValue: expectedTurnover * 100,
        variance: variance * 100,
        variancePercentage,
        impact: this.getImpact('inventory', variancePercentage),
        recommendations: this.getRecommendations('inventory', variancePercentage),
        detectedAt: new Date(),
        confidence: this.calculateConfidence(Math.abs(variancePercentage), kegs.length),
        dataPoints: kegs.length
      }
    }
    
    return null
  }

  private analyzeDeliveryVolumePatterns(deliveries: any[]): VarianceResult | null {
    // Analyze delivery volume patterns
    const dailyVolumes = this.calculateDailyVolumes(deliveries)
    const avgVolume = dailyVolumes.reduce((sum, vol) => sum + vol, 0) / dailyVolumes.length
    const expectedVolume = this.getExpectedDeliveryVolume()
    
    const variance = avgVolume - expectedVolume
    const variancePercentage = (variance / expectedVolume) * 100
    
    if (Math.abs(variancePercentage) > this.getSensitivityThreshold()) {
      return {
        id: `sales-volume-${Date.now()}`,
        type: 'sales',
        severity: this.getSeverity(variancePercentage),
        title: 'Delivery Volume Variance',
        description: `Average daily delivery volume is ${avgVolume.toFixed(1)}, expected ~${expectedVolume}`,
        currentValue: avgVolume,
        expectedValue: expectedVolume,
        variance,
        variancePercentage,
        impact: this.getImpact('sales', variancePercentage),
        recommendations: this.getRecommendations('sales', variancePercentage),
        detectedAt: new Date(),
        confidence: this.calculateConfidence(Math.abs(variancePercentage), dailyVolumes.length),
        dataPoints: dailyVolumes.length
      }
    }
    
    return null
  }

  private analyzeProductMixVariations(deliveries: any[]): VarianceResult | null {
    // Analyze product mix variations
    const productMix = this.calculateProductMix(deliveries)
    const expectedMix = this.getExpectedProductMix()
    
    // Compare mix percentages
    const mixVariance = this.calculateMixVariance(productMix, expectedMix)
    
    if (mixVariance > this.getSensitivityThreshold()) {
      return {
        id: `sales-mix-${Date.now()}`,
        type: 'sales',
        severity: this.getSeverity(mixVariance),
        title: 'Product Mix Variance',
        description: `Product mix has shifted significantly from expected distribution`,
        currentValue: mixVariance,
        expectedValue: 0,
        variance: mixVariance,
        variancePercentage: mixVariance,
        impact: this.getImpact('sales', mixVariance),
        recommendations: this.getRecommendations('sales', mixVariance),
        detectedAt: new Date(),
        confidence: this.calculateConfidence(mixVariance, deliveries.length),
        dataPoints: deliveries.length
      }
    }
    
    return null
  }

  private analyzeDeliveryTiming(deliveries: any[]): VarianceResult | null {
    // Analyze delivery timing variances
    const timingData = deliveries
      .filter(d => d.actual_delivery_date && d.delivery_date)
      .map(d => {
        const scheduled = new Date(d.delivery_date)
        const actual = new Date(d.actual_delivery_date)
        return Math.abs(actual.getTime() - scheduled.getTime()) / (1000 * 60 * 60) // hours
      })
    
    if (timingData.length === 0) return null
    
    const avgDelay = timingData.reduce((sum, time) => sum + time, 0) / timingData.length
    const expectedDelay = 0.5 // 30 minutes
    
    const variance = avgDelay - expectedDelay
    const variancePercentage = (variance / expectedDelay) * 100
    
    if (Math.abs(variancePercentage) > this.getSensitivityThreshold()) {
      return {
        id: `del-timing-${Date.now()}`,
        type: 'delivery',
        severity: this.getSeverity(variancePercentage),
        title: 'Delivery Timing Variance',
        description: `Average delivery delay is ${avgDelay.toFixed(1)} hours, expected ~${expectedDelay} hours`,
        currentValue: avgDelay,
        expectedValue: expectedDelay,
        variance,
        variancePercentage,
        impact: this.getImpact('delivery', variancePercentage),
        recommendations: this.getRecommendations('delivery', variancePercentage),
        detectedAt: new Date(),
        confidence: this.calculateConfidence(Math.abs(variancePercentage), timingData.length),
        dataPoints: timingData.length
      }
    }
    
    return null
  }

  private analyzeDeliveryEfficiency(deliveries: any[]): VarianceResult | null {
    // Analyze delivery efficiency metrics
    const efficiency = this.calculateDeliveryEfficiency(deliveries)
    const expectedEfficiency = 0.85 // 85% efficiency
    
    const variance = efficiency - expectedEfficiency
    const variancePercentage = (variance / expectedEfficiency) * 100
    
    if (Math.abs(variancePercentage) > this.getSensitivityThreshold()) {
      return {
        id: `del-efficiency-${Date.now()}`,
        type: 'delivery',
        severity: this.getSeverity(variancePercentage),
        title: 'Delivery Efficiency Variance',
        description: `Delivery efficiency is ${(efficiency * 100).toFixed(1)}%, expected ~${(expectedEfficiency * 100)}%`,
        currentValue: efficiency * 100,
        expectedValue: expectedEfficiency * 100,
        variance: variance * 100,
        variancePercentage,
        impact: this.getImpact('delivery', variancePercentage),
        recommendations: this.getRecommendations('delivery', variancePercentage),
        detectedAt: new Date(),
        confidence: this.calculateConfidence(Math.abs(variancePercentage), deliveries.length),
        dataPoints: deliveries.length
      }
    }
    
    return null
  }

  private analyzeReturnRates(scans: any[]): VarianceResult | null {
    // Analyze return rate patterns
    const returnScans = scans.filter(s => s.location.includes('return') || s.location.includes('warehouse'))
    const returnRate = returnScans.length / scans.length
    const expectedReturnRate = 0.15 // 15% expected return rate
    
    const variance = returnRate - expectedReturnRate
    const variancePercentage = (variance / expectedReturnRate) * 100
    
    if (Math.abs(variancePercentage) > this.getSensitivityThreshold()) {
      return {
        id: `qual-return-${Date.now()}`,
        type: 'quality',
        severity: this.getSeverity(variancePercentage),
        title: 'Keg Return Rate Variance',
        description: `Keg return rate is ${(returnRate * 100).toFixed(1)}%, expected ~${(expectedReturnRate * 100)}%`,
        currentValue: returnRate * 100,
        expectedValue: expectedReturnRate * 100,
        variance: variance * 100,
        variancePercentage,
        impact: this.getImpact('quality', variancePercentage),
        recommendations: this.getRecommendations('quality', variancePercentage),
        detectedAt: new Date(),
        confidence: this.calculateConfidence(Math.abs(variancePercentage), scans.length),
        dataPoints: scans.length
      }
    }
    
    return null
  }

  private analyzeQualityControlPatterns(scans: any[]): VarianceResult | null {
    // Analyze quality control patterns
    const qualityIssues = scans.filter(s => s.location.includes('quality') || s.location.includes('issue'))
    const qualityRate = qualityIssues.length / scans.length
    const expectedQualityRate = 0.05 // 5% expected quality issues
    
    const variance = qualityRate - expectedQualityRate
    const variancePercentage = (variance / expectedQualityRate) * 100
    
    if (Math.abs(variancePercentage) > this.getSensitivityThreshold()) {
      return {
        id: `qual-control-${Date.now()}`,
        type: 'quality',
        severity: this.getSeverity(variancePercentage),
        title: 'Quality Control Variance',
        description: `Quality issue rate is ${(qualityRate * 100).toFixed(1)}%, expected ~${(expectedQualityRate * 100)}%`,
        currentValue: qualityRate * 100,
        expectedValue: expectedQualityRate * 100,
        variance: variance * 100,
        variancePercentage,
        impact: this.getImpact('quality', variancePercentage),
        recommendations: this.getRecommendations('quality', variancePercentage),
        detectedAt: new Date(),
        confidence: this.calculateConfidence(Math.abs(variancePercentage), scans.length),
        dataPoints: scans.length
      }
    }
    
    return null
  }

  private analyzeOperationalCosts(): VarianceResult | null {
    // Analyze operational cost patterns
    // This would integrate with cost tracking systems
    return null
  }

  // Helper methods
  private getTimeWindowStart(): Date {
    const now = new Date()
    now.setHours(now.getHours() - this.config.timeWindow)
    return now
  }

  private getSensitivityThreshold(): number {
    switch (this.config.sensitivity) {
      case 'low': return 25
      case 'medium': return 15
      case 'high': return 10
      default: return 15
    }
  }

  private getSeverity(variancePercentage: number): 'low' | 'medium' | 'high' | 'critical' {
    const absVariance = Math.abs(variancePercentage)
    if (absVariance >= 50) return 'critical'
    if (absVariance >= 25) return 'high'
    if (absVariance >= 10) return 'medium'
    return 'low'
  }

  private calculateConfidence(variancePercentage: number, dataPoints: number): number {
    // Calculate confidence based on variance magnitude and data points
    const varianceConfidence = Math.min(variancePercentage / 50, 1) // Higher variance = higher confidence
    const dataConfidence = Math.min(dataPoints / 100, 1) // More data = higher confidence
    return (varianceConfidence + dataConfidence) / 2
  }

  private getImpact(type: string, variancePercentage: number): string {
    const impacts = {
      inventory: variancePercentage > 0 
        ? 'Potential overstocking and cash flow impact'
        : 'Potential stockouts and lost sales',
      sales: variancePercentage > 0
        ? 'Higher than expected demand - consider capacity planning'
        : 'Lower than expected demand - potential revenue loss',
      delivery: variancePercentage > 0
        ? 'Delivery delays affecting customer satisfaction'
        : 'Delivery efficiency improvements detected',
      quality: variancePercentage > 0
        ? 'Quality issues affecting customer satisfaction and brand reputation'
        : 'Quality improvements detected',
      cost: variancePercentage > 0
        ? 'Increased operational costs affecting profitability'
        : 'Cost savings opportunities detected'
    }
    
    return impacts[type as keyof typeof impacts] || 'Operational impact detected'
  }

  private getRecommendations(type: string, variancePercentage: number): string[] {
    const recommendations = {
      inventory: variancePercentage > 0 
        ? [
            'Review inventory levels and ordering patterns',
            'Consider promotional campaigns to move excess stock',
            'Analyze demand forecasting accuracy'
          ]
        : [
            'Increase inventory levels to prevent stockouts',
            'Review supplier lead times',
            'Optimize reorder points'
          ],
      sales: variancePercentage > 0
        ? [
            'Increase production capacity',
            'Review marketing campaigns effectiveness',
            'Consider expanding to new markets'
          ]
        : [
            'Analyze market trends and competition',
            'Review pricing strategy',
            'Implement targeted promotional campaigns'
          ],
      delivery: variancePercentage > 0
        ? [
            'Review route optimization algorithms',
            'Check driver scheduling and capacity',
            'Analyze traffic pattern impacts'
          ]
        : [
            'Document successful delivery practices',
            'Share best practices with other drivers',
            'Consider expanding efficient routes'
          ],
      quality: variancePercentage > 0
        ? [
            'Investigate root causes of quality issues',
            'Review quality control procedures',
            'Implement additional quality checks'
          ]
        : [
            'Document successful quality practices',
            'Share quality improvement strategies',
            'Maintain current quality standards'
          ],
      cost: variancePercentage > 0
        ? [
            'Review operational processes for cost optimization',
            'Analyze supplier contracts and pricing',
            'Implement cost reduction initiatives'
          ]
        : [
            'Document cost-saving practices',
            'Share efficiency improvements',
            'Maintain cost control measures'
          ]
    }
    
    return recommendations[type as keyof typeof recommendations] || [
      'Review operational processes',
      'Analyze data patterns',
      'Implement corrective actions'
    ]
  }

  // Placeholder methods for complex calculations
  private calculateKegLifecycle(keg: any, scans: any[]): number {
    // Calculate keg lifecycle in days
    return 14 // Placeholder
  }

  private calculateInventoryTurnover(kegs: any[]): number {
    // Calculate inventory turnover rate
    return 0.8 // Placeholder
  }

  private calculateDailyVolumes(deliveries: any[]): number[] {
    // Calculate daily delivery volumes
    return deliveries.map(() => Math.random() * 10) // Placeholder
  }

  private getExpectedDeliveryVolume(): number {
    return 5 // Placeholder
  }

  private calculateProductMix(deliveries: any[]): Record<string, number> {
    // Calculate product mix percentages
    return { IPA: 40, Lager: 30, Porter: 20, Other: 10 } // Placeholder
  }

  private getExpectedProductMix(): Record<string, number> {
    return { IPA: 35, Lager: 35, Porter: 20, Other: 10 } // Placeholder
  }

  private calculateMixVariance(actual: Record<string, number>, expected: Record<string, number>): number {
    // Calculate mix variance
    return 5 // Placeholder
  }

  private calculateDeliveryEfficiency(deliveries: any[]): number {
    // Calculate delivery efficiency
    return 0.85 // Placeholder
  }
}
