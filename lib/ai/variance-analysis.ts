// Gemini AI integration for variance analysis with mock implementation

import { AIAnalysisResult, Keg, VarianceStatus } from '../types';

const USE_LIVE_GEMINI = process.env.USE_LIVE_GEMINI === 'true';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * Analyze variance and generate investigation report
 * Uses Gemini Flash AI in live mode, mock data in development
 */
export async function analyzeVariance(
  keg: Keg,
  variance: number,
  scanHistory?: Array<{ timestamp: string; location: string; scannedBy: string }>
): Promise<AIAnalysisResult> {
  if (USE_LIVE_GEMINI && GEMINI_API_KEY) {
    try {
      // TODO: Implement real Gemini API integration
      // const { GoogleGenerativeAI } = await import('@google/generative-ai');
      // const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      // const model = genAI.getGenerativeModel({ model: 'gemini-flash' });
      // 
      // const prompt = buildAnalysisPrompt(keg, variance, scanHistory);
      // const result = await model.generateContent(prompt);
      // const response = await result.response;
      // const text = response.text();
      // 
      // return parseAIResponse(text);
      
      throw new Error('Live Gemini AI integration not yet implemented');
    } catch (error) {
      console.error('Error analyzing variance with AI:', error);
      // Fall back to mock analysis
      return generateMockAnalysis(keg, variance);
    }
  } else {
    // Mock implementation
    return generateMockAnalysis(keg, variance);
  }
}

/**
 * Build prompt for Gemini AI
 */
function buildAnalysisPrompt(
  keg: Keg,
  variance: number,
  scanHistory?: Array<{ timestamp: string; location: string; scannedBy: string }>
): string {
  return `
You are an expert in brewery operations and keg management. Analyze the following keg variance issue and provide a structured investigation report.

KEG DETAILS:
- Beer: ${keg.name} (${keg.type})
- Keg Size: ${keg.keg_size}
- Expected Pints: ${keg.expected_pints}
- Actual Pints Sold: ${keg.pints_sold}
- Variance: ${variance} pints (${variance > 0 ? 'under' : 'over'} sold)

SCAN HISTORY:
${scanHistory?.map(scan => `- ${scan.timestamp}: Scanned at ${scan.location}`).join('\n') || 'No scan history available'}

Please provide a structured analysis in the following JSON format:
{
  "summary": "One-sentence explanation of the most likely cause",
  "required_actions": ["Action 1", "Action 2", "Action 3"],
  "time_windows": ["Time window 1 for footage review", "Time window 2"],
  "staff_to_interview": ["Staff member 1", "Staff member 2"]
}

Focus on:
1. Most likely causes (spillage, theft, measurement errors, foam waste, etc.)
2. Specific, actionable steps to investigate
3. Critical time periods to review security footage
4. Staff members who had access during key periods
`;
}

/**
 * Parse AI response into structured format
 */
function parseAIResponse(text: string): AIAnalysisResult {
  try {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fall back to default structure if parsing fails
    throw new Error('Could not parse AI response');
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      summary: 'Unable to generate AI analysis',
      required_actions: ['Review scan history', 'Check POS data', 'Interview staff'],
      time_windows: ['Full keg lifetime'],
      staff_to_interview: ['All staff with access'],
    };
  }
}

/**
 * Generate mock analysis for development
 */
function generateMockAnalysis(keg: Keg, variance: number): AIAnalysisResult {
  const absVariance = Math.abs(variance);
  const isUnder = variance > 0;
  
  // Different analysis based on variance severity
  if (absVariance <= 3) {
    // NORMAL variance
    return {
      summary: `The ${absVariance}-pint variance is within normal range and likely due to foam waste and measurement variations.`,
      required_actions: [
        'Document variance for trend analysis',
        'Verify tap lines are properly cleaned',
        'Ensure staff are trained on proper pouring technique',
      ],
      time_windows: [
        'No specific investigation needed',
      ],
      staff_to_interview: [],
    };
  } else if (absVariance <= 8) {
    // WARNING variance
    return {
      summary: `The ${absVariance}-pint ${isUnder ? 'shortage' : 'overage'} suggests possible ${isUnder ? 'spillage, improper pours, or staff consumption' : 'measurement errors or POS misconfiguration'}.`,
      required_actions: [
        `Review security footage during peak serving hours`,
        `Verify POS system is correctly recording all sales`,
        `Check tap equipment for leaks or malfunction`,
      ],
      time_windows: [
        `${formatTimeWindow(keg.brew_date, 3)} - First 3 days after installation`,
        `${formatTimeWindow(keg.brew_date, 7)} - Peak sales period`,
      ],
      staff_to_interview: [
        'Bartenders on duty during installation',
        'Closing staff on high-volume nights',
      ],
    };
  } else {
    // CRITICAL variance
    return {
      summary: `The ${absVariance}-pint ${isUnder ? 'shortage' : 'overage'} indicates a serious issue requiring immediate investigation for possible ${isUnder ? 'theft, significant spillage, or unauthorized consumption' : 'POS system malfunction or duplicate transaction recording'}.`,
      required_actions: [
        `URGENT: Review all security footage from keg installation to retirement`,
        `Audit POS transaction logs for anomalies or missing entries`,
        `Inspect keg and tap equipment for tampering or malfunction`,
      ],
      time_windows: [
        `${formatTimeWindow(keg.brew_date, 0)} - Delivery and installation`,
        `${formatTimeWindow(keg.brew_date, 1)} - First 24 hours (highest risk period)`,
        `${formatTimeWindow(keg.last_scan || keg.brew_date, 0)} - Last scan to retirement`,
      ],
      staff_to_interview: [
        'All staff with access during keg lifetime',
        'Delivery driver who brought the keg',
        'Manager who installed keg on tap',
        'Bartenders who worked majority of shifts',
      ],
    };
  }
}

/**
 * Format time window for investigation
 */
function formatTimeWindow(dateString: string, daysOffset: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + daysOffset);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Generate summary report text for display
 */
export function formatAnalysisReport(analysis: AIAnalysisResult): string {
  return `
VARIANCE ANALYSIS REPORT

Summary: ${analysis.summary}

Required Actions:
${analysis.required_actions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

Critical Time Windows for Security Footage Review:
${analysis.time_windows.map((window, i) => `${i + 1}. ${window}`).join('\n')}

${analysis.staff_to_interview.length > 0 ? `
Staff to Interview:
${analysis.staff_to_interview.map((staff, i) => `${i + 1}. ${staff}`).join('\n')}
` : ''}
  `.trim();
}

