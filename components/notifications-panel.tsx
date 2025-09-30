import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, CheckCircle, Calendar, Settings, ExternalLink, Bell, Wifi } from "lucide-react"

// Sample notifications data
const notifications = [
  {
    id: 1,
    type: "alert",
    title: "High Call Volume",
    message: "Receiving 40% more calls than usual today",
    time: "5 min ago",
    icon: AlertTriangle,
    severity: "warning",
  },
  {
    id: 2,
    type: "success",
    title: "API Connected",
    message: "Vapi integration is working correctly",
    time: "2 hours ago",
    icon: CheckCircle,
    severity: "success",
  },
  {
    id: 3,
    type: "info",
    title: "System Update",
    message: "Dashboard updated with new features",
    time: "1 day ago",
    icon: Settings,
    severity: "info",
  },
]

export function NotificationsPanel() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Notifications */}
      <div className="xl:col-span-2 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Recent Alerts</h3>
              <p className="text-sm text-slate-400">System notifications and alerts</p>
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
          {notifications.map((notification, index) => (
            <div
              key={notification.id}
              className="flex items-start gap-4 p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-300 border border-slate-600/30"
            >
              <div
                className={`
                w-10 h-10 rounded-xl flex items-center justify-center shadow-lg
                ${notification.severity === "success" ? "bg-green-500/20 text-green-400 border border-green-500/30" : ""}
                ${notification.severity === "warning" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" : ""}
                ${notification.severity === "error" ? "bg-red-500/20 text-red-400 border border-red-500/30" : ""}
                ${notification.severity === "info" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : ""}
              `}
              >
                <notification.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">{notification.title}</h4>
                  <span className="text-xs text-slate-400">{notification.time}</span>
                </div>
                <p className="text-sm text-slate-400 mt-1">{notification.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Settings */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Quick Settings</h3>
            <p className="text-sm text-slate-400">Manage AI configuration</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* AI Status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-700/30 border border-slate-600/30">
            <div>
              <p className="font-medium text-white">AI Receptionist</p>
              <p className="text-sm text-slate-400">Currently active</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <Switch defaultChecked />
            </div>
          </div>

          {/* Business Hours */}
          <div className="p-3 rounded-xl bg-slate-700/30 border border-slate-600/30">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-white">Business Hours</p>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-600/50">
                <Calendar className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Mon - Fri</span>
                <span className="text-slate-300">9:00 AM - 10:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sat - Sun</span>
                <span className="text-slate-300">10:00 AM - 11:00 PM</span>
              </div>
            </div>
          </div>

          {/* API Status */}
          <div className="p-3 rounded-xl bg-slate-700/30 border border-slate-600/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-white">Vapi Integration</p>
                <p className="text-xs text-slate-400">API connection status</p>
              </div>
              <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                <Wifi className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-600/50 hover:border-blue-400 transition-all duration-300 bg-transparent"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Manage Settings
            </Button>
          </div>

          {/* Custom Instructions */}
          <div className="p-3 rounded-xl bg-slate-700/30 border border-slate-600/30">
            <p className="font-medium text-white mb-3">Custom Instructions</p>
            <Textarea
              placeholder="Add special instructions for the AI (e.g., special promotions, policies...)"
              className="min-h-[80px] text-sm bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 transition-colors duration-300"
            />
            <Button
              size="sm"
              className="mt-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-300"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
