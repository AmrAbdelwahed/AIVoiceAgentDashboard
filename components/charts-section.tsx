"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface ChartsProps {
  data?: {
    calls: any[]
    totalCalls: number
    successRate: number
  } | null
}

export function ChartsSection({ data }: ChartsProps) {
  // Generate sample data based on real data or fallback to mock data
  const callsPerDayData = data?.calls
    ? generateDailyCallsData(data.calls)
    : [
        { day: "Jan 1", calls: 45 },
        { day: "Jan 2", calls: 52 },
        { day: "Jan 3", calls: 48 },
        { day: "Jan 4", calls: 61 },
        { day: "Jan 5", calls: 55 },
        { day: "Jan 6", calls: 67 },
        { day: "Jan 7", calls: 43 },
      ]

  const callHandlingData = [
    { name: "AI Handled", value: data?.successRate || 78, color: "#3b82f6" },
    { name: "Failed/Missed", value: 100 - (data?.successRate || 78), color: "#ef4444" },
  ]

  const reservationsVsMissedData = [
    { name: "Week 1", reservations: 45, missed: 12 },
    { name: "Week 2", reservations: 52, missed: 8 },
    { name: "Week 3", reservations: 48, missed: 15 },
    { name: "Week 4", reservations: 61, missed: 6 },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Line Chart - Calls per Day */}
      <div className="xl:col-span-2 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Daily Call Volume</h3>
            <p className="text-sm text-slate-400">Calls handled over the last 7 days</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            Total Calls
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={callsPerDayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "12px",
                  color: "#f1f5f9",
                }}
              />
              <Line
                type="monotone"
                dataKey="calls"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2, fill: "#8b5cf6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart - Call Handling Distribution */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white">Call Success Rate</h3>
          <p className="text-sm text-slate-400">AI handling distribution</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={callHandlingData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {callHandlingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "12px",
                  color: "#f1f5f9",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-sm text-slate-300">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center">
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {data?.successRate?.toFixed(1) || "78"}%
          </p>
          <p className="text-sm text-slate-400">Success Rate</p>
        </div>
      </div>

      {/* Bar Chart - Reservations vs Missed Calls */}
      <div className="xl:col-span-3 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Weekly Performance</h3>
            <p className="text-sm text-slate-400">Reservations booked vs calls missed</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-slate-300">Reservations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-slate-300">Missed Calls</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reservationsVsMissedData} barGap={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "12px",
                  color: "#f1f5f9",
                }}
              />
              <Bar dataKey="reservations" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Reservations" />
              <Bar dataKey="missed" fill="#ef4444" radius={[6, 6, 0, 0]} name="Missed Calls" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function generateDailyCallsData(calls: any[]) {
  // Group calls by day and generate chart data
  const dailyData = calls.reduce((acc: any, call: any) => {
    const date = new Date(call.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  return Object.entries(dailyData)
    .map(([day, calls]) => ({ day, calls }))
    .slice(-7)
}
