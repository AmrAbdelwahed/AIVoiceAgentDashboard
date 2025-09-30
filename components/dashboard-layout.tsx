"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Phone, Settings, Bell, Menu, X, Home, MessageSquare, StickyNote, LogOut, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { AssistantSelector } from "@/components/assistant-selector"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Conversations", href: "/dashboard/conversations", icon: MessageSquare },
  { name: "Notes", href: "/dashboard/notes", icon: StickyNote },
  { name: "ROI", href: "/dashboard/roi", icon: DollarSign },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(profile)
      }
    }

    getUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:flex
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex h-full w-72 flex-col bg-[#2A2A2A] border-r border-[#404040]">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#5A9BD5] rounded-2xl flex items-center justify-center shadow-lg">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">VoiceAI Pro</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-[#A0AEC0]"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`
                        group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300
                        ${
                          isActive
                            ? "bg-[#5A9BD5] text-white shadow-lg"
                            : "text-[#A0AEC0] hover:text-white hover:bg-[#404040]"
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Settings */}
            <div className="mt-8 pt-8 border-t border-[#404040]">
              <Link
                href="/dashboard/settings"
                className={`
                  group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300
                  ${
                    pathname === "/dashboard/settings"
                      ? "bg-[#5A9BD5] text-white shadow-lg"
                      : "text-[#A0AEC0] hover:text-white hover:bg-[#404040]"
                  }
                `}
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-6 border-t border-[#404040]">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#404040] border border-[#404040]">
              <div className="w-8 h-8 bg-[#5A9BD5] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xs font-bold text-white">
                  {profile?.restaurant_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{profile?.restaurant_name || "Restaurant"}</p>
                <p className="text-xs text-[#A0AEC0] truncate">Owner</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-[#A0AEC0] hover:text-white hover:bg-[#404040]"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#404040] bg-[#2A2A2A] px-6">
          <Button variant="ghost" size="sm" className="lg:hidden text-[#A0AEC0]" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>

          {/* Assistant Selector */}
          <div className="flex-1 flex justify-center">
            <AssistantSelector />
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="relative text-[#A0AEC0] hover:text-white hover:bg-[#404040] transition-colors duration-300"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#4FD1C5] rounded-full shadow-lg"></span>
            </Button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
