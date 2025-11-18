'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RestaurantsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to restaurant dashboard
    router.push('/dashboard/restaurant')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Redirecting to restaurant dashboard...</div>
    </div>
  )
}
