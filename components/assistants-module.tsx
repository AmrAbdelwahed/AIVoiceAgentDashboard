"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, Search, RefreshCw, Calendar, AlertCircle, CheckCircle, Eye, ExternalLink } from "lucide-react"
import type { VapiAssistant } from "@/lib/vapi-types"

interface AssistantsModuleProps {
  className?: string
}

export function AssistantsModule({ className }: AssistantsModuleProps) {
  const [assistants, setAssistants] = useState<VapiAssistant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAssistants()
  }, [])

  const fetchAssistants = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/vapi/assistants")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch assistants")
      }

      const data = await response.json()
      setAssistants(data.assistants || [])
    } catch (err) {
      console.error("Error fetching assistants:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch assistants")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAssistants()
    setRefreshing(false)
  }

  const filteredAssistants = assistants.filter(
    (assistant) =>
      assistant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assistant.description && assistant.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Assistants
            </h2>
            <p className="text-slate-400 mt-1">Manage your voice AI assistants</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 bg-slate-700/50" />
                <Skeleton className="h-4 w-full bg-slate-700/50" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 bg-slate-700/50" />
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
              AI Assistants
            </h2>
            <p className="text-slate-400 mt-1">Manage your voice AI assistants</p>
          </div>
        </div>

        <Alert className="border-red-500/30">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button
            onClick={fetchAssistants}
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
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Assistants
          </h2>
          <p className="text-slate-400 mt-1">Manage your voice AI assistants</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-blue-400 bg-transparent"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search assistants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{assistants.length}</p>
                <p className="text-sm text-slate-400">Total Assistants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{filteredAssistants.length}</p>
                <p className="text-sm text-slate-400">Filtered Results</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {assistants.length > 0 ? new Date(assistants[0].createdAt).toLocaleDateString() : "N/A"}
                </p>
                <p className="text-sm text-slate-400">Latest Created</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assistants Grid */}
      {filteredAssistants.length === 0 ? (
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Bot className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {searchTerm ? "No assistants found" : "No assistants available"}
            </h3>
            <p className="text-slate-400 mb-4">
              {searchTerm
                ? "Try adjusting your search terms or clear the search to see all assistants."
                : "You haven't created any AI assistants yet. Create your first assistant in the Vapi dashboard."}
            </p>
            <Button
              asChild
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-blue-400 bg-transparent"
            >
              <a
                href="https://dashboard.vapi.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Vapi Dashboard
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssistants.map((assistant) => (
            <Card
              key={assistant.id}
              className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:border-blue-500/30 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{assistant.name}</CardTitle>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1">Active</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {assistant.description && (
                  <p className="text-slate-300 text-sm line-clamp-2">{assistant.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Assistant ID:</span>
                    <code className="text-slate-300 bg-slate-700/50 px-2 py-1 rounded text-xs">
                      {assistant.id.slice(0, 8)}...
                    </code>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Created:</span>
                    <span className="text-slate-300">{new Date(assistant.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Updated:</span>
                    <span className="text-slate-300">{new Date(assistant.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-blue-400 bg-transparent"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-medium">About AI Assistants</h4>
              <div className="text-sm text-slate-300 space-y-1">
                <p>
                  Assistants are read-only in this dashboard for security. To create or edit assistants, use the Vapi
                  dashboard.
                </p>
                <p>
                  Each assistant can be configured with different voices, models, and conversation flows to match your
                  specific use case.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
