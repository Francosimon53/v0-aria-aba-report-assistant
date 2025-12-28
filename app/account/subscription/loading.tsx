import { LoaderIcon } from "@/components/icons"

export default function SubscriptionLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center">
      <div className="flex items-center gap-3 text-teal-600">
        <LoaderIcon className="h-6 w-6 animate-spin" />
        <span>Loading subscription...</span>
      </div>
    </div>
  )
}
