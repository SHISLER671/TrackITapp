import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" text="Loading TrackIT..." />
      </div>
    </div>
  )
}
