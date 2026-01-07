import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircleIcon, SparklesIcon } from "@/components/icons"
import Link from "next/link"

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D9488]/5 via-white to-[#06B6D4]/5 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white border-gray-100 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Check your email!</CardTitle>
          <CardDescription className="text-gray-500">We've sent you a confirmation link</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-600">Click the link in your email to verify your account and start using ARIA.</p>

          <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
            <div className="flex items-center gap-3 justify-center">
              <SparklesIcon className="h-5 w-5 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">
                Your 7-day free trial starts after verification
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-400 mb-4">Didn't receive the email? Check your spam folder or</p>
            <Link href="/login" className="text-[#0D9488] hover:text-[#0F766E] font-semibold transition-colors">
              Return to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
