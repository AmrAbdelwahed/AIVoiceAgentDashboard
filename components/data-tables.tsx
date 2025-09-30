import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Calendar, Clock, User, MessageSquare, ExternalLink } from "lucide-react"
import type { VapiCall } from "@/lib/vapi-types"

interface DataTablesProps {
  calls: VapiCall[]
}

export function DataTables({ calls }: DataTablesProps) {
  const safeCalls = calls || []

  // Extract reservations from calls
  const recentReservations = safeCalls
    .filter(
      (call) => call.summary?.toLowerCase().includes("reservation") || call.summary?.toLowerCase().includes("booking"),
    )
    .slice(0, 5)
    .map((call, index) => ({
      id: call.id,
      name: call.customer?.number || call.phoneNumber?.number || "Unknown",
      time: call.startedAt
        ? new Date(call.startedAt).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })
        : "N/A",
      date: call.startedAt
        ? new Date(call.startedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "N/A",
      partySize: Math.floor(Math.random() * 6) + 1, // Mock data
      notes: call.summary || "No notes available",
      status: call.status === "completed" ? "confirmed" : "pending",
    }))

  // Format call logs
  const callLogs = safeCalls.slice(0, 6).map((call) => ({
    id: call.id,
    caller: call.customer?.number || call.phoneNumber?.number || "Unknown",
    intent: extractIntent(call.summary),
    outcome: call.summary || "No summary available",
    escalated: call.status === "failed",
    time: call.createdAt ? getTimeAgo(call.createdAt) : "Unknown",
    duration:
      call.startedAt && call.endedAt
        ? formatDuration(new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime())
        : "N/A",
  }))

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Recent Reservations Table */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Recent Reservations</h3>
              <p className="text-sm text-slate-400">Latest bookings made by AI</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-blue-400 transition-all duration-300 bg-transparent"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>

        <div className="space-y-4">
          {recentReservations.length > 0 ? (
            recentReservations.map((reservation, index) => (
              <div
                key={reservation.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-300 border border-slate-600/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{reservation.name}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {reservation.time} • {reservation.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {reservation.partySize} guests
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs truncate">{reservation.notes}</p>
                  </div>
                </div>
                <Badge
                  variant={reservation.status === "confirmed" ? "default" : "secondary"}
                  className={`capitalize ${
                    reservation.status === "confirmed"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  }`}
                >
                  {reservation.status}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reservations found</p>
              <p className="text-sm">Configure your Vapi API key to see real data</p>
            </div>
          )}
        </div>
      </div>

      {/* Call Logs Table */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Call Logs</h3>
              <p className="text-sm text-slate-400">Recent AI interactions</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-blue-400 transition-all duration-300 bg-transparent"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>

        <div className="space-y-4">
          {callLogs.length > 0 ? (
            callLogs.map((call, index) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-300 border border-slate-600/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium font-mono text-sm text-white">{call.caller}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {call.intent}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {call.duration}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs truncate">{call.outcome}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {call.escalated && (
                    <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">Failed</Badge>
                  )}
                  <span className="text-xs text-slate-400">{call.time}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No call logs found</p>
              <p className="text-sm">Configure your Vapi API key to see real data</p>
            </div>
          )}
        </div>
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

function getTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}
