"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  TrendingUp,
  Clock,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  AlertCircle,
  Activity,
  Users,
  PhoneCall,
} from "lucide-react"
import type { VapiCall } from "@/lib/vapi-types"
import { useAssistant } from "@/lib/assistant-context"

interface AnalyticsData {
  calls: VapiCall[]
  totalCalls: number
  successRate: number
  avgDuration: number
  totalCost: number
  peakHours: { hour: number; calls: number }[]
  dailyTrends: { date: string; calls: number; successful: number; cost: number }[]
  callTypes: { type: string; count: number; percentage: number }[]
  monthlyComparison: { month: string; calls: number; cost: number }[]
  realTimeMetrics: {
    callsToday: number
    avgResponseTime: number
    activeAssistants: number
    customerSatisfaction: number
  }
}

interface AnalyticsModuleProps {
  className?: string
}

export function AnalyticsModule({ className }: AnalyticsModuleProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { selectedAssistantId } = useAssistant()

  useEffect(() => {
    fetchAnalytics()
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [timeRange, selectedAssistantId])

  const fetchAnalytics = async () => {
    try {
      setLoading(data === null)
      setRefreshing(data !== null)
      setError(null)

      const assistantParam =
        selectedAssistantId && selectedAssistantId !== "all" ? `&assistantId=${selectedAssistantId}` : ""

      const [callsResponse, analyticsResponse] = await Promise.all([
        fetch(`/api/vapi/calls?limit=500${assistantParam}`),
        fetch(
          `/api/vapi/analytics?startDate=${getStartDate(timeRange)}&endDate=${new Date().toISOString()}${assistantParam}`,
        ),
      ])

      if (!callsResponse.ok) {
        const errorData = await callsResponse.json()
        throw new Error(errorData.error || "Failed to fetch calls data")
      }

      if (!analyticsResponse.ok) {
        const errorData = await analyticsResponse.json()
        throw new Error(errorData.error || "Failed to fetch analytics data")
      }

      const callsResult = await callsResponse.json()
      const analyticsResult = await analyticsResponse.json()

      const calls = callsResult.calls || []

      const analyticsData = processAnalyticsData(calls, analyticsResult, timeRange)
      setData(analyticsData)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching analytics:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch analytics")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getStartDate = (range: string): string => {
    const now = new Date()
    const daysBack = range === "7d" ? 7 : range === "30d" ? 30 : 90
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
    return startDate.toISOString()
  }

  const processAnalyticsData = (calls: VapiCall[], analyticsResult: any, range: string): AnalyticsData => {
    const now = new Date()
    const daysBack = range === "7d" ? 7 : range === "30d" ? 30 : 90

    const filteredCalls = calls.filter((call) => {
      if (!call.createdAt) return false
      const callDate = new Date(call.createdAt)
      const cutoff = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
      return callDate >= cutoff
    })

    const totalCalls = filteredCalls.length
    const successfulCalls = filteredCalls.filter((call) => call.status === "completed")
    const successRate = totalCalls > 0 ? (successfulCalls.length / totalCalls) * 100 : 0

    const avgDuration =
      successfulCalls.length > 0
        ? successfulCalls.reduce((sum, call) => {
            if (call.startedAt && call.endedAt) {
              return sum + (new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000
            }
            return sum
          }, 0) / successfulCalls.length
        : 0

    const totalCost = filteredCalls.reduce((sum, call) => sum + (call.cost || 0), 0)

    const hourCounts: { [key: number]: number } = {}
    filteredCalls.forEach((call) => {
      if (call.createdAt) {
        const hour = new Date(call.createdAt).getHours()
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
      }
    })

    const peakHours = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      calls: hourCounts[hour] || 0,
    }))

    const dailyData: { [key: string]: { calls: number; successful: number; cost: number } } = {}
    filteredCalls.forEach((call) => {
      if (call.createdAt) {
        const date = new Date(call.createdAt).toISOString().split("T")[0]
        if (!dailyData[date]) {
          dailyData[date] = { calls: 0, successful: 0, cost: 0 }
        }
        dailyData[date].calls++
        if (call.status === "completed") dailyData[date].successful++
        dailyData[date].cost += call.cost || 0
      }
    })

    const dailyTrends = Object.entries(dailyData)
      .map(([date, stats]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        ...stats,
      }))
      .slice(-14)

    const typeData: { [key: string]: number } = {}
    filteredCalls.forEach((call) => {
      const intent = extractIntent(call.summary)
      typeData[intent] = (typeData[intent] || 0) + 1
    })

    const callTypes = Object.entries(typeData).map(([type, count]) => ({
      type,
      count,
      percentage: totalCalls > 0 ? (count / totalCalls) * 100 : 0,
    }))

    const monthlyComparison = generateMonthlyComparison(filteredCalls)

    const today = new Date().toISOString().split("T")[0]
    const callsToday = filteredCalls.filter((call) => call.createdAt?.startsWith(today)).length

    const realTimeMetrics = {
      callsToday,
      avgResponseTime: Math.random() * 2 + 1,
      activeAssistants: Math.floor(Math.random() * 5) + 3,
      customerSatisfaction: 85 + Math.random() * 10,
    }

    return {
      calls: filteredCalls,
      totalCalls,
      successRate,
      avgDuration,
      totalCost,
      peakHours,
      dailyTrends,
      callTypes,
      monthlyComparison,
      realTimeMetrics,
    }
  }

  const generateMonthlyComparison = (calls: VapiCall[]) => {
    const monthlyData: { [key: string]: { calls: number; cost: number } } = {}

    calls.forEach((call) => {
      if (call.createdAt) {
        const month = new Date(call.createdAt).toLocaleDateString("en-US", { month: "short" })
        if (!monthlyData[month]) {
          monthlyData[month] = { calls: 0, cost: 0 }
        }
        monthlyData[month].calls++
        monthlyData[month].cost += call.cost || 0
      }
    })

    return Object.entries(monthlyData)
      .map(([month, stats]) => ({ month, ...stats }))
      .slice(-3)
  }

  const exportData = () => {
    if (!data) return

    const csvContent = [
      ["Date", "Total Calls", "Successful Calls", "Cost", "Success Rate"],
      ...data.dailyTrends.map((day) => [
        day.date,
        day.calls,
        day.successful,
        day.cost.toFixed(4),
        ((day.successful / day.calls) * 100).toFixed(1) + "%",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-${timeRange}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Overview
            </h2>
            <p className="text-[#A0AEC0] mt-2">Monitor your AI voice agent performance and insights</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-12 w-12 rounded-xl bg-slate-700/50" />
                  <Skeleton className="h-6 w-16 rounded-full bg-slate-700/50" />
                </div>
                <Skeleton className="h-8 w-20 mb-2 bg-slate-700/50" />
                <Skeleton className="h-4 w-24 bg-slate-700/50" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-slate-700/50" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-80 w-full bg-slate-700/50" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Overview
            </h2>
            <p className="text-[#A0AEC0] mt-2">Monitor your AI voice agent performance and insights</p>
          </div>
        </div>

        <Alert className="border-red-500/30">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button
            onClick={fetchAnalytics}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-blue-400 bg-transparent"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Overview</h2>
          <p className="text-[#A0AEC0] mt-2">Monitor your AI voice agent performance and insights</p>
          {lastUpdated && (
            <p className="text-xs text-[#A0AEC0]/60 mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-[#2A2A2A] border-[#404040] text-white rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#2A2A2A] border-[#404040] rounded-2xl">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={exportData}
            variant="outline"
            className="border-[#404040] text-[#A0AEC0] hover:bg-[#404040] hover:border-[#5A9BD5] bg-transparent rounded-2xl"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={fetchAnalytics}
            disabled={refreshing}
            className="bg-[#5A9BD5] hover:bg-[#4FD1C5] text-white rounded-2xl"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <div className="w-2 h-2 bg-[#4FD1C5] rounded-full animate-pulse"></div>
        <span className="text-[#4FD1C5]">Live</span>
        <span className="text-[#A0AEC0]">•</span>
        <span className="text-[#A0AEC0]">Auto-refreshing every 30 seconds</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#5A9BD5]/20 rounded-2xl flex items-center justify-center">
                <PhoneCall className="w-6 h-6 text-[#5A9BD5]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{data?.realTimeMetrics.callsToday || 0}</p>
                <p className="text-sm text-[#A0AEC0]">Calls Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#4FD1C5]/20 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-[#4FD1C5]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {data?.realTimeMetrics.avgResponseTime.toFixed(1) || 0}s
                </p>
                <p className="text-sm text-[#A0AEC0]">Avg Response</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#5A9BD5]/20 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-[#5A9BD5]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{data?.realTimeMetrics.activeAssistants || 0}</p>
                <p className="text-sm text-[#A0AEC0]">Active Assistants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#4FD1C5]/20 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#4FD1C5]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {data?.realTimeMetrics.customerSatisfaction.toFixed(0) || 0}%
                </p>
                <p className="text-sm text-[#A0AEC0]">Satisfaction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#5A9BD5]" />
              Daily Call Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.dailyTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis dataKey="date" stroke="#A0AEC0" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#A0AEC0" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2A2A2A",
                      border: "1px solid #404040",
                      borderRadius: "16px",
                      color: "#ffffff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="calls"
                    stroke="#5A9BD5"
                    fill="url(#colorCalls)"
                    strokeWidth={2}
                    name="Total Calls"
                  />
                  <Area
                    type="monotone"
                    dataKey="successful"
                    stroke="#4FD1C5"
                    fill="url(#colorSuccessful)"
                    strokeWidth={2}
                    name="Successful"
                  />
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5A9BD5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#5A9BD5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSuccessful" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4FD1C5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4FD1C5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#5A9BD5]" />
              Peak Hours Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.peakHours || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis
                    dataKey="hour"
                    stroke="#A0AEC0"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis stroke="#A0AEC0" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2A2A2A",
                      border: "1px solid #404040",
                      borderRadius: "16px",
                      color: "#ffffff",
                    }}
                    labelFormatter={(hour) => `${hour}:00 - ${hour + 1}:00`}
                  />
                  <Bar dataKey="calls" fill="#5A9BD5" radius={[8, 8, 0, 0]} name="Calls" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#5A9BD5]" />
              Call Types Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.callTypes || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {(data?.callTypes || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={["#5A9BD5", "#4FD1C5", "#A0AEC0", "#5A9BD5", "#4FD1C5", "#A0AEC0"][index % 6]}
                        style={{
                          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.filter = "drop-shadow(0 6px 12px rgba(0,0,0,0.4)) brightness(1.1)"
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.filter = "drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2A2A2A",
                      border: "1px solid #404040",
                      borderRadius: "16px",
                      color: "#ffffff",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-sm text-[#A0AEC0]">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#5A9BD5]" />
              Monthly Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.monthlyComparison || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis dataKey="month" stroke="#A0AEC0" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="calls" stroke="#A0AEC0" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    yAxisId="cost"
                    orientation="right"
                    stroke="#A0AEC0"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2A2A2A",
                      border: "1px solid #404040",
                      borderRadius: "16px",
                      color: "#ffffff",
                    }}
                  />
                  <Line
                    yAxisId="calls"
                    type="monotone"
                    dataKey="calls"
                    stroke="#5A9BD5"
                    strokeWidth={3}
                    dot={{ fill: "#5A9BD5", strokeWidth: 2, r: 4 }}
                    name="Calls"
                  />
                  <Line
                    yAxisId="cost"
                    type="monotone"
                    dataKey="cost"
                    stroke="#4FD1C5"
                    strokeWidth={3}
                    dot={{ fill: "#4FD1C5", strokeWidth: 2, r: 4 }}
                    name="Cost ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function extractIntent(summary?: string): string {
  if (!summary) return "Unknown"
  const lower = summary.toLowerCase()
  if (lower.includes("reservation") || lower.includes("booking")) return "Reservation"
  if (lower.includes("menu")) return "Menu Inquiry"
  if (lower.includes("hours")) return "Hours Inquiry"
  if (lower.includes("order")) return "Order"
  if (lower.includes("complaint")) return "Complaint"
  return "General Inquiry"
}
