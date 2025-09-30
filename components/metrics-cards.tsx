import { Phone, Calendar, DollarSign, TrendingUp } from "lucide-react"

interface MetricsCardsProps {
  data?: {
    totalCalls: number
    totalReservations: number
    totalRevenue: number
    successRate: number
  } | null
}

export function MetricsCards({ data }: MetricsCardsProps) {
  const metrics = [
    {
      title: "Total Calls",
      value: data ? data.totalCalls.toLocaleString() : "0",
      change: "+12%",
      changeType: "positive" as const,
      icon: Phone,
      description: "This month",
    },
    {
      title: "Reservations Booked",
      value: data ? data.totalReservations.toLocaleString() : "0",
      change: "+8%",
      changeType: "positive" as const,
      icon: Calendar,
      description: "This month",
    },
    {
      title: "Success Rate",
      value: data ? `${data.successRate.toFixed(1)}%` : "0%",
      change: "+15%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "Call completion",
    },
    {
      title: "Total Cost",
      value: data ? `$${data.totalRevenue.toFixed(2)}` : "$0.00",
      change: "+22%",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "API usage cost",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <div
          key={metric.title}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/10"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <metric.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30">
              {metric.change}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{metric.value}</h3>
            <p className="text-sm text-slate-300 mt-1">{metric.title}</p>
            <p className="text-xs text-slate-400 mt-1">{metric.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
