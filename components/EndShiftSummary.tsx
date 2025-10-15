"use client"

import { useState, useEffect } from "react"
import type { Keg } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { generateShiftInsights } from "@/lib/ai-assistant"

interface EndShiftSummaryProps {
  onClose: () => void
}

interface ShiftStats {
  kegsCreated: number
  totalABV: number
  averageABV: number
  kegTypes: { [key: string]: number }
  kegSizes: { [key: string]: number }
  kegs: Keg[]
  aiInsights?: string
}

export default function EndShiftSummary({ onClose }: EndShiftSummaryProps) {
  const [stats, setStats] = useState<ShiftStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  useEffect(() => {
    loadShiftStats()
  }, [])

  const loadShiftStats = async () => {
    try {
      const supabase = createClient()
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

      const { data, error } = await supabase
        .from("kegs")
        .select("*")
        .gte("created_at", startOfDay.toISOString())
        .order("created_at", { ascending: false })

      if (error) throw error

      const kegs = data || []
      const kegsCreated = kegs.length
      const totalABV = kegs.reduce((sum: number, keg: any) => sum + keg.abv, 0)
      const averageABV = kegsCreated > 0 ? totalABV / kegsCreated : 0

      const kegTypes: { [key: string]: number } = {}
      const kegSizes: { [key: string]: number } = {}

      kegs.forEach((keg: any) => {
        kegTypes[keg.type] = (kegTypes[keg.type] || 0) + 1
        kegSizes[keg.keg_size] = (kegSizes[keg.keg_size] || 0) + 1
      })

      // Generate AI insights
      const aiInsights = await generateShiftInsights(kegs)

      setStats({
        kegsCreated,
        totalABV,
        averageABV,
        kegTypes,
        kegSizes,
        kegs,
        aiInsights,
      })
    } catch (error) {
      console.error("Failed to load shift stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = async () => {
    setGeneratingPdf(true)

    try {
      // Create HTML content for PDF
      const htmlContent = `
        <html>
          <head>
            <title>End of Shift Report - ${new Date().toLocaleDateString()}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
              .stat-box { border: 1px solid #ddd; padding: 15px; text-align: center; }
              .stat-number { font-size: 24px; font-weight: bold; color: #2563eb; }
              .keg-list { margin-top: 20px; }
              .keg-item { border-bottom: 1px solid #eee; padding: 10px 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>End of Shift Report</h1>
              <p>Date: ${new Date().toLocaleDateString()}</p>
              <p>Generated at: ${new Date().toLocaleTimeString()}</p>
            </div>
            
            <div class="stats">
              <div class="stat-box">
                <div class="stat-number">${stats?.kegsCreated || 0}</div>
                <div>Kegs Created</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${stats?.averageABV.toFixed(1) || 0}%</div>
                <div>Average ABV</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${Object.keys(stats?.kegTypes || {}).length}</div>
                <div>Beer Styles</div>
              </div>
            </div>
            
            <h2>Keg Breakdown by Style</h2>
            <table>
              <thead>
                <tr><th>Beer Style</th><th>Count</th></tr>
              </thead>
              <tbody>
                ${Object.entries(stats?.kegTypes || {})
                  .map(([style, count]) => `<tr><td>${style}</td><td>${count}</td></tr>`)
                  .join("")}
              </tbody>
            </table>
            
            <h2>Keg Breakdown by Size</h2>
            <table>
              <thead>
                <tr><th>Keg Size</th><th>Count</th></tr>
              </thead>
              <tbody>
                ${Object.entries(stats?.kegSizes || {})
                  .map(([size, count]) => `<tr><td>${size}</td><td>${count}</td></tr>`)
                  .join("")}
              </tbody>
            </table>
            
            <h2>All Kegs Created Today</h2>
            <table>
              <thead>
                <tr><th>Name</th><th>Style</th><th>ABV</th><th>IBU</th><th>Size</th><th>Created</th></tr>
              </thead>
              <tbody>
                ${
                  stats?.kegs
                    .map(
                      (keg) =>
                        `<tr>
                    <td>${keg.name}</td>
                    <td>${keg.type}</td>
                    <td>${keg.abv}%</td>
                    <td>${keg.ibu}</td>
                    <td>${keg.keg_size}</td>
                    <td>${new Date(keg.created_at).toLocaleTimeString()}</td>
                  </tr>`,
                    )
                    .join("") || ""
                }
              </tbody>
            </table>
          </body>
        </html>
      `

      // Open in new window for printing
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
      }

      alert("PDF report opened for printing!")
    } catch (error) {
      console.error("Failed to generate PDF:", error)
      alert("Failed to generate PDF report")
    } finally {
      setGeneratingPdf(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading shift summary...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">End of Shift Summary</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats?.kegsCreated || 0}</div>
            <div className="text-blue-700 font-medium">Kegs Created</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{stats?.averageABV.toFixed(1) || 0}%</div>
            <div className="text-green-700 font-medium">Average ABV</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{Object.keys(stats?.kegTypes || {}).length}</div>
            <div className="text-purple-700 font-medium">Beer Styles</div>
          </div>
        </div>

        {stats && stats.kegsCreated > 0 && (
          <>
            {/* AI Insights */}
            {stats.aiInsights && (
              <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🤖</span>
                  <h3 className="text-lg font-semibold text-purple-900">AI Insights</h3>
                </div>
                <div className="text-gray-700 whitespace-pre-line">{stats.aiInsights}</div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">By Beer Style</h3>
                <div className="space-y-2">
                  {Object.entries(stats.kegTypes).map(([style, count]) => (
                    <div key={style} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{style}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">By Keg Size</h3>
                <div className="space-y-2">
                  {Object.entries(stats.kegSizes).map(([size, count]) => (
                    <div key={size} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{size}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Kegs</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {stats.kegs.map((keg, index) => (
                    <div key={keg.id} className="flex justify-between items-center p-3 bg-white rounded border">
                      <div>
                        <div className="font-medium">{keg.name}</div>
                        <div className="text-sm text-gray-600">
                          {keg.type} • {keg.abv}% ABV • {keg.keg_size}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{new Date(keg.created_at).toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {stats && stats.kegsCreated === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🍺</div>
            <p className="text-gray-600">No kegs were created today</p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={generatePDF}
            disabled={generatingPdf || !stats || stats.kegsCreated === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {generatingPdf ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>📄</span>
                <span>Generate PDF Report</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
