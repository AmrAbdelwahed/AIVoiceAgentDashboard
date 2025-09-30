import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-[#2A2A2A] backdrop-blur-xl border-[#404040] shadow-2xl rounded-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-[#5A9BD5] rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-semibold text-white">Check Your Email</CardTitle>
            <CardDescription className="text-[#A0AEC0]">We've sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-white mb-4">
              Please check your email and click the confirmation link to activate your account.
            </p>
            <p className="text-sm text-[#A0AEC0]">
              Once confirmed, you'll be able to access your AI Voice Agent Dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
