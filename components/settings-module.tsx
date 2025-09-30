"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Key,
  User,
  Bell,
  Shield,
  Database,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Server,
  Globe,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ApiKeys {
  vapi_private_key: string | null
  vapi_public_key: string | null
  gemini_api_key: string | null
  created_at?: string
  updated_at?: string
}

interface UserProfile {
  id: string
  email: string
  created_at: string
}

export function SettingsModule() {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    vapi_private_key: null,
    vapi_public_key: null,
    gemini_api_key: null,
  })
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showVapiPrivateKey, setShowVapiPrivateKey] = useState(false)
  const [showVapiPublicKey, setShowVapiPublicKey] = useState(false)
  const [showGeminiKey, setShowGeminiKey] = useState(false)
  const [vapiPrivateKeyInput, setVapiPrivateKeyInput] = useState("")
  const [vapiPublicKeyInput, setVapiPublicKeyInput] = useState("")
  const [geminiKeyInput, setGeminiKeyInput] = useState("")
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    callAlerts: true,
    weeklyReports: true,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)

      // Fetch user profile
      const supabase = createClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error("Not authenticated")
      }

      setUserProfile({
        id: user.id,
        email: user.email || "",
        created_at: user.created_at || "",
      })

      // Fetch API keys
      const response = await fetch("/api/settings/api-keys")
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys || { vapi_private_key: null, vapi_public_key: null, gemini_api_key: null })
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveApiKeys = async () => {
    try {
      setSaving(true)
      setSaveMessage(null)

      const updateData: any = {}
      if (vapiPrivateKeyInput.trim()) updateData.vapi_private_key = vapiPrivateKeyInput.trim()
      if (vapiPublicKeyInput.trim()) updateData.vapi_public_key = vapiPublicKeyInput.trim()
      if (geminiKeyInput.trim()) updateData.gemini_api_key = geminiKeyInput.trim()

      if (Object.keys(updateData).length === 0) {
        setSaveMessage({ type: "error", message: "No API keys to update" })
        return
      }

      const response = await fetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        setSaveMessage({ type: "success", message: "API keys updated successfully" })
        setVapiPrivateKeyInput("")
        setVapiPublicKeyInput("")
        setGeminiKeyInput("")
        await fetchSettings() // Refresh to get masked keys
      } else {
        const error = await response.json()
        setSaveMessage({ type: "error", message: error.error || "Failed to update API keys" })
      }
    } catch (error) {
      setSaveMessage({ type: "error", message: "An error occurred while saving" })
    } finally {
      setSaving(false)
    }
  }

  const testVapiConnection = async () => {
    try {
      const response = await fetch("/api/vapi/calls?limit=1")
      if (response.ok) {
        setSaveMessage({ type: "success", message: "Vapi connection successful" })
      } else {
        setSaveMessage({ type: "error", message: "Vapi connection failed" })
      }
    } catch (error) {
      setSaveMessage({ type: "error", message: "Failed to test Vapi connection" })
    }
  }

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-slate-400 mt-2">Manage your account and API integrations</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 animate-pulse"
            >
              <div className="h-4 bg-slate-700/50 rounded mb-4"></div>
              <div className="h-8 bg-slate-700/50 rounded mb-2"></div>
              <div className="h-4 bg-slate-700/50 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-slate-400 mt-2">Manage your account and API integrations</p>
        </div>
        <Button
          onClick={fetchSettings}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-blue-400 bg-transparent"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <Alert className={saveMessage.type === "success" ? "border-green-500/30" : "border-red-500/30"}>
          {saveMessage.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400" />
          )}
          <AlertDescription className={saveMessage.type === "success" ? "text-green-300" : "text-red-300"}>
            {saveMessage.message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList className="bg-slate-800/50 border-slate-700">
          <TabsTrigger value="api-keys" className="data-[state=active]:bg-blue-600">
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-purple-600">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-green-600">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-red-600">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Vapi Private Key */}
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Server className="w-4 h-4 text-white" />
                  </div>
                  Vapi Private Key
                </CardTitle>
                <p className="text-xs text-slate-400">Server-side only - for secure API calls</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Status:</span>
                  <Badge
                    className={
                      apiKeys.vapi_private_key
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }
                  >
                    {apiKeys.vapi_private_key ? "Configured" : "Not Set"}
                  </Badge>
                </div>

                {apiKeys.vapi_private_key && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">Current Key</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type={showVapiPrivateKey ? "text" : "password"}
                        value={apiKeys.vapi_private_key}
                        readOnly
                        className="bg-slate-700/50 border-slate-600 text-slate-300 font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowVapiPrivateKey(!showVapiPrivateKey)}
                        className="text-slate-400 hover:text-white"
                      >
                        {showVapiPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-slate-300">New Private Key</Label>
                  <Input
                    type="password"
                    placeholder="Enter private key (no prefix required)"
                    value={vapiPrivateKeyInput}
                    onChange={(e) => setVapiPrivateKeyInput(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vapi Public Key */}
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  Vapi Public Key
                </CardTitle>
                <p className="text-xs text-slate-400">Client-side - for embedding assistants</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Status:</span>
                  <Badge
                    className={
                      apiKeys.vapi_public_key
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }
                  >
                    {apiKeys.vapi_public_key ? "Configured" : "Not Set"}
                  </Badge>
                </div>

                {apiKeys.vapi_public_key && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">Current Key</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type={showVapiPublicKey ? "text" : "password"}
                        value={apiKeys.vapi_public_key}
                        readOnly
                        className="bg-slate-700/50 border-slate-600 text-slate-300 font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowVapiPublicKey(!showVapiPublicKey)}
                        className="text-slate-400 hover:text-white"
                      >
                        {showVapiPublicKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-slate-300">New Public Key</Label>
                  <Input
                    type="password"
                    placeholder="Enter public key (no prefix required)"
                    value={vapiPublicKeyInput}
                    onChange={(e) => setVapiPublicKeyInput(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Gemini API Key */}
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Key className="w-4 h-4 text-white" />
                  </div>
                  Gemini API Key
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Status:</span>
                  <Badge
                    className={
                      apiKeys.gemini_api_key
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }
                  >
                    {apiKeys.gemini_api_key ? "Configured" : "Not Set"}
                  </Badge>
                </div>

                {apiKeys.gemini_api_key && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">Current Key</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type={showGeminiKey ? "text" : "password"}
                        value={apiKeys.gemini_api_key}
                        readOnly
                        className="bg-slate-700/50 border-slate-600 text-slate-300 font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                        className="text-slate-400 hover:text-white"
                      >
                        {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-slate-300">New Gemini API Key</Label>
                  <Input
                    type="password"
                    placeholder="AIza..."
                    value={geminiKeyInput}
                    onChange={(e) => setGeminiKeyInput(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                  <p className="text-xs text-slate-400">
                    Get your API key from{" "}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                    >
                      Google AI Studio
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>

                {(apiKeys.vapi_private_key || apiKeys.vapi_public_key) && (
                  <Button
                    onClick={testVapiConnection}
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-blue-400 bg-transparent"
                  >
                    Test Vapi Connection
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={saveApiKeys}
              disabled={saving || (!vapiPrivateKeyInput.trim() && !vapiPublicKeyInput.trim() && !geminiKeyInput.trim())}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save API Keys
                </>
              )}
            </Button>
          </div>

          {/* API Key Usage Information */}
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Key className="w-4 h-4 text-blue-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-white font-medium">API Key Usage</h4>
                  <div className="text-sm text-slate-300 space-y-1">
                    <p>
                      <strong>Private Key:</strong> Used server-side for secure operations like fetching assistants,
                      customers, call logs, and analytics.
                    </p>
                    <p>
                      <strong>Public Key:</strong> Used client-side for embedding assistants and public-facing features.
                    </p>
                    <p>
                      <strong>Security:</strong> Private keys are never exposed to the client and are only used in
                      secure API routes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Email</Label>
                  <Input
                    value={userProfile?.email || ""}
                    readOnly
                    className="bg-slate-700/50 border-slate-600 text-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">User ID</Label>
                  <Input
                    value={userProfile?.id || ""}
                    readOnly
                    className="bg-slate-700/50 border-slate-600 text-slate-300 font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Account Created</Label>
                  <Input
                    value={userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : ""}
                    readOnly
                    className="bg-slate-700/50 border-slate-600 text-slate-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-sm text-slate-400">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Call Alerts</p>
                  <p className="text-sm text-slate-400">Get notified about failed calls</p>
                </div>
                <Switch
                  checked={notifications.callAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, callAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Weekly Reports</p>
                  <p className="text-sm text-slate-400">Receive weekly analytics summaries</p>
                </div>
                <Switch
                  checked={notifications.weeklyReports}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                <div>
                  <p className="text-white font-medium">Database Connection</p>
                  <p className="text-sm text-slate-400">Supabase integration status</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Database className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </div>

              <div className="pt-4 border-t border-slate-700/50">
                <Button onClick={signOut} variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
