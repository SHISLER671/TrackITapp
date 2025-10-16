import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">
          🍺 Keg Tracker
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Track beer kegs across the supply chain from brewery to restaurant
        </p>
      </div>
      
      <Card className="w-full max-w-2xl mb-8">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">Features Coming Soon:</CardTitle>
          <CardDescription>
            Building a comprehensive keg tracking solution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>QR Code scanning</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Delivery tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Inventory management</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Real-time updates</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Mobile-first design</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
          Get Started
        </Button>
        <Button variant="outline" size="lg">
          Learn More
        </Button>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>🚀 Successfully deployed to Vercel!</p>
        <p>Built with Next.js 15, React 19 & Tailwind CSS</p>
      </div>
    </main>
  )
}
