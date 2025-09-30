"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DollarSign, TrendingUp, TrendingDown, Calendar, LucidePieChart, BarChart3 } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar,
  Pie,
} from "recharts"
import { useAssistant } from "@/lib/assistant-context"

const roiData = {
  summary: {
    total_revenue_generated: 15200,
    total_cost_savings: 4800,
    agent_cost: 3000,
    net_gain: 17000,
    roi_percentage: 466,
  },
  monthly_breakdown: [
    {
      month: "January 2025",
      revenue_generated: 2200,
      cost_savings: 600,
      agent_cost: 500,
      net_gain: 2300,
      roi_percentage: 460,
    },
    {
      month: "February 2025",
      revenue_generated: 2800,
      cost_savings: 800,
      agent_cost: 500,
      net_gain: 3100,
      roi_percentage: 520,
    },
    {
      month: "March 2025",
      revenue_generated: 3200,
      cost_savings: 900,
      agent_cost: 500,
      net_gain: 3600,
      roi_percentage: 580,
    },
    {
      month: "April 2025",
      revenue_generated: 4000,
      cost_savings: 1200,
      agent_cost: 500,
      net_gain: 4700,
      roi_percentage: 740,
    },
  ],
  metrics: {
    revenue_by_source: [
      { source: "New Bookings", amount: 9200 },
      { source: "Upsells", amount: 3100 },
      { source: "Saved Cancellations", amount: 2900 },
    ],
    savings_breakdown: [
      { category: "Reception Staff Hours", amount: 2500 },
      { category: "Missed Calls Prevented", amount: 1500 },
      { category: "Reduced No-Shows", amount: 800 },
    ],
  },
}

const COLORS = ["#5A9BD5", "#4FD1C5", "#A0AEC0", "#8B5CF6", "#F59E0B"]

export function ROIModule() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const { selectedAssistantId } = useAssistant()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage}%`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">ROI Dashboard</h1>
          <p className="text-[#A0AEC0] mt-2">Track your AI voice agent's financial impact</p>
        </div>
        <Badge className="bg-[#4FD1C5] text-[#1E1E1E] px-4 py-2 text-sm font-medium">
          <TrendingUp className="w-4 h-4 mr-2" />
          {formatPercentage(roiData.summary.roi_percentage)} ROI
        </Badge>
      </div>

      {/* Summary Cards - 2x2 grid as per spec */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A0AEC0] text-sm font-medium">Total Revenue Generated</p>
                <p className="text-2xl font-semibold text-white mt-1">
                  {formatCurrency(roiData.summary.total_revenue_generated)}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#5A9BD5] rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A0AEC0] text-sm font-medium">Total Cost Savings</p>
                <p className="text-2xl font-semibold text-white mt-1">
                  {formatCurrency(roiData.summary.total_cost_savings)}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#4FD1C5] rounded-2xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-[#1E1E1E]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A0AEC0] text-sm font-medium">Net Gain</p>
                <p className="text-2xl font-semibold text-white mt-1">{formatCurrency(roiData.summary.net_gain)}</p>
              </div>
              <div className="w-12 h-12 bg-[#8B5CF6] rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A0AEC0] text-sm font-medium">Agent Cost</p>
                <p className="text-2xl font-semibold text-white mt-1">{formatCurrency(roiData.summary.agent_cost)}</p>
              </div>
              <div className="w-12 h-12 bg-[#A0AEC0] rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[#1E1E1E]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="bg-[#2A2A2A] border-[#404040] p-1 rounded-2xl">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-[#5A9BD5] data-[state=active]:text-white rounded-xl px-6 py-2"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="trends"
            className="data-[state=active]:bg-[#5A9BD5] data-[state=active]:text-white rounded-xl px-6 py-2"
          >
            Monthly Trends
          </TabsTrigger>
          <TabsTrigger
            value="breakdown"
            className="data-[state=active]:bg-[#5A9BD5] data-[state=active]:text-white rounded-xl px-6 py-2"
          >
            Breakdown
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LucidePieChart className="w-5 h-5" />
                  Revenue by Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={roiData.metrics.revenue_by_source}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                      label={false}
                    >
                      {roiData.metrics.revenue_by_source.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {roiData.metrics.revenue_by_source.map((entry, index) => (
                    <div key={entry.source} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-[#A0AEC0]">{entry.source}</span>
                      </div>
                      <span className="text-sm font-medium text-white">{formatCurrency(entry.amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Cost Savings Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={roiData.metrics.savings_breakdown} margin={{ bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                    <XAxis
                      dataKey="category"
                      stroke="#A0AEC0"
                      fontSize={11}
                      angle={-25}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis stroke="#A0AEC0" fontSize={12} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                      contentStyle={{
                        backgroundColor: "#2A2A2A",
                        border: "1px solid #404040",
                        borderRadius: "8px",
                        color: "#FFFFFF",
                      }}
                    />
                    <Bar dataKey="amount" fill="#4FD1C5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                ROI Trend Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={roiData.monthly_breakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis
                    dataKey="month"
                    stroke="#A0AEC0"
                    fontSize={12}
                    tickFormatter={(value) => value.split(" ")[0]}
                  />
                  <YAxis stroke="#A0AEC0" fontSize={12} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "roi_percentage" ? formatPercentage(value as number) : formatCurrency(value as number),
                      name === "roi_percentage"
                        ? "ROI %"
                        : name.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
                    ]}
                    contentStyle={{
                      backgroundColor: "#2A2A2A",
                      border: "1px solid #404040",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="roi_percentage"
                    stroke="#5A9BD5"
                    strokeWidth={3}
                    dot={{ fill: "#5A9BD5", strokeWidth: 2, r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="net_gain"
                    stroke="#4FD1C5"
                    strokeWidth={2}
                    dot={{ fill: "#4FD1C5", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-white">Monthly Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#404040]">
                        <th className="text-left py-3 px-4 text-[#A0AEC0] font-medium">Month</th>
                        <th className="text-right py-3 px-4 text-[#A0AEC0] font-medium">Revenue</th>
                        <th className="text-right py-3 px-4 text-[#A0AEC0] font-medium">Savings</th>
                        <th className="text-right py-3 px-4 text-[#A0AEC0] font-medium">Agent Cost</th>
                        <th className="text-right py-3 px-4 text-[#A0AEC0] font-medium">Net Gain</th>
                        <th className="text-right py-3 px-4 text-[#A0AEC0] font-medium">ROI %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roiData.monthly_breakdown.map((month, index) => (
                        <tr key={month.month} className={index % 2 === 0 ? "bg-[#2A2A2A]" : "bg-[#1E1E1E]"}>
                          <td className="py-4 px-4 text-white font-medium">{month.month}</td>
                          <td className="py-4 px-4 text-right text-white">{formatCurrency(month.revenue_generated)}</td>
                          <td className="py-4 px-4 text-right text-white">{formatCurrency(month.cost_savings)}</td>
                          <td className="py-4 px-4 text-right text-white">{formatCurrency(month.agent_cost)}</td>
                          <td className="py-4 px-4 text-right text-white font-semibold">
                            {formatCurrency(month.net_gain)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Badge className="bg-[#4FD1C5] text-[#1E1E1E]">
                              {formatPercentage(month.roi_percentage)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
