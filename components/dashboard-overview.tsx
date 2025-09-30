"use client"

import { useState, useEffect } from "react"
import { MetricsCards } from "@/components/metrics-cards"
import { ChartsSection } from "@/components/charts-section"
import { DataTables } from "@/components/data-tables"
import { NotificationsPanel } from "@/components/notifications-panel"
import type { VapiCall } from "@/lib/vapi-types"

interface DashboardData {
  calls: VapiCall[]
  totalCalls: number
  totalReservations: number
  totalRevenue: number
  avgCallDuration: number
  successRate: number
}

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/vapi/calls?limit=100")

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data")
        }

        const result = await response.json()
        const calls = result.calls || []

        // Calculate metrics from calls data
        const totalCalls = calls.length
        const completedCalls = calls.filter((call: VapiCall) => call.status === "completed")
        const totalReservations = completedCalls.filter(
          (call: VapiCall) =>
            call.summary?.toLowerCase().includes("reservation") || call.summary?.toLowerCase().includes("booking"),
        ).length

        const totalRevenue = completedCalls.reduce((sum: number, call: VapiCall) => {
          return sum + (call.cost || 0)
        }, 0)

        const avgCallDuration =
          completedCalls.length > 0
            ? completedCalls.reduce((sum: number, call: VapiCall) => {
                if (call.startedAt && call.endedAt) {
                  const duration = new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()
                  return sum + duration
                }
                return sum
              }, 0) /
              completedCalls.length /
              1000 // Convert to seconds
            : 0

        const successRate = totalCalls > 0 ? (completedCalls.length / totalCalls) * 100 : 0

        setData({
          calls: calls.slice(0, 10), // Show latest 10 calls
          totalCalls,
          totalReservations,
          totalRevenue,
          avgCallDuration,
          successRate,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 animate-pulse"
            >
              <div className="h-12 bg-slate-700/50 rounded-xl mb-4"></div>
              <div className="h-8 bg-slate-700/50 rounded mb-2"></div>
              <div className="h-4 bg-slate-700/50 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800/30 rounded-2xl p-6">
        <h3 className="text-red-400 font-medium mb-2">Error Loading Dashboard</h3>
        <p className="text-red-300/80 text-sm">{error}</p>
        <p className="text-slate-400 text-xs mt-2">Make sure your Vapi API key is configured in Settings.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-slate-400 mt-2">Monitor your AI voice agent performance and insights</p>
      </div>

      {/* Metrics Cards */}
      <MetricsCards data={data} />

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartsSection data={data} />
        <NotificationsPanel />
      </div>

      {/* Recent Calls Table */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Calls</h2>
        <DataTables calls={data.calls} />
      </div>
    </div>
  )
}
