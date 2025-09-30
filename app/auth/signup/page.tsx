"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [restaurantName, setRestaurantName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            restaurant_name: restaurantName,
          },
        },
      })
      if (error) throw error
      router.push("/auth/check-email")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-[#2A2A2A] backdrop-blur-xl border-[#404040] shadow-2xl rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold text-white">Create Account</CardTitle>
            <CardDescription className="text-[#A0AEC0]">Start managing your AI voice agent today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurant-name" className="text-[#A0AEC0]">
                  Restaurant Name
                </Label>
                <Input
                  id="restaurant-name"
                  type="text"
                  placeholder="Your Restaurant Name"
                  required
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="bg-[#1E1E1E] border-[#404040] text-white placeholder:text-[#6B7280] focus:border-[#5A9BD5]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#A0AEC0]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="restaurant@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#1E1E1E] border-[#404040] text-white placeholder:text-[#6B7280] focus:border-[#5A9BD5]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#A0AEC0]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#1E1E1E] border-[#404040] text-white placeholder:text-[#6B7280] focus:border-[#5A9BD5]"
                />
              </div>
              {error && (
                <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-800/30">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-[#5A9BD5] hover:bg-[#4A8BC5] text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-[#A0AEC0]">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#4FD1C5] hover:text-[#3FC1B5] underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
