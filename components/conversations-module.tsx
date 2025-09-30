"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Phone,
  Search,
  MessageSquare,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  DollarSign,
} from "lucide-react"
import type { VapiCall } from "@/lib/vapi-types"
import { useAssistant } from "@/lib/assistant-context"

interface ConversationAnalysis {
  sentiment: "positive" | "neutral" | "negative"
  intent: string
  keyPoints: string[]
  actionItems: string[]
}

export function ConversationsModule() {
  const [calls, setCalls] = useState<VapiCall[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCall, setSelectedCall] = useState<VapiCall | null>(null)
  const [analysis, setAnalysis] = useState<ConversationAnalysis | null>(null)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [filter, setFilter] = useState<"all" | "completed" | "failed">("all")
  const [expandedCallLogs, setExpandedCallLogs] = useState<Set<string>>(new Set())
  const { selectedAssistantId } = useAssistant()

  useEffect(() => {
    fetchCalls()
  }, [selectedAssistantId])

  const fetchCalls = async () => {
    try {
      setLoading(true)
      const assistantParam =
        selectedAssistantId && selectedAssistantId !== "all" ? `&assistantId=${selectedAssistantId}` : ""
      const response = await fetch(`/api/vapi/calls?limit=50${assistantParam}`)

      if (!response.ok) {
        throw new Error("Failed to fetch calls")
      }

      const result = await response.json()
      setCalls(result.calls || [])
    } catch (error) {
      console.error("Error fetching calls:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateSummary = async (call: VapiCall) => {
    if (!call.messages || call.messages.length === 0) {
      return
    }

    setGeneratingSummary(true)
    try {
      const conversationText = call.messages.map((msg) => `${msg.role}: ${msg.message}`).join("\n")

      const [summaryResponse, analysisResponse] = await Promise.all([
        fetch("/api/gemini/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationText }),
        }),
        fetch("/api/gemini/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationText }),
        }),
      ])

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json()
        const updatedCall = { ...call, summary: summaryData.summary }
        setSelectedCall(updatedCall)
        setCalls((prevCalls) => prevCalls.map((c) => (c.id === call.id ? updatedCall : c)))
      }

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json()
        setAnalysis(analysisData)
      }
    } catch (error) {
      console.error("Error generating summary:", error)
    } finally {
      setGeneratingSummary(false)
    }
  }

  const toggleCallLog = (callId: string) => {
    const newExpanded = new Set(expandedCallLogs)
    if (newExpanded.has(callId)) {
      newExpanded.delete(callId)
    } else {
      newExpanded.add(callId)
    }
    setExpandedCallLogs(newExpanded)
  }

  const filteredCalls = calls.filter((call) => {
    const matchesSearch =
      !searchTerm ||
      call.phoneNumber?.number?.includes(searchTerm) ||
      call.customer?.number?.includes(searchTerm) ||
      call.summary?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filter === "all" || call.status === filter

    return matchesSearch && matchesFilter
  })

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case "negative":
        return <TrendingDown className="w-4 h-4 text-red-400" />
      default:
        return <Minus className="w-4 h-4 text-yellow-400" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "negative":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    }
  }

  const calculateMetrics = () => {
    const totalCalls = calls.length
    const completedCalls = calls.filter((call) => call.status === "completed")
    const successRate = totalCalls > 0 ? (completedCalls.length / totalCalls) * 100 : 0

    const avgDuration =
      completedCalls.length > 0
        ? completedCalls.reduce((sum, call) => {
            if (call.startedAt && call.endedAt) {
              return sum + (new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000
            }
            return sum
          }, 0) / completedCalls.length
        : 0

    const totalCost = calls.reduce((sum, call) => sum + (call.cost || 0), 0)

    return {
      totalCalls,
      successRate,
      avgDuration,
      totalCost,
    }
  }

  const metrics = calculateMetrics()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Conversations</h1>
            <p className="text-[#A0AEC0] mt-2">Analyze AI voice interactions with Gemini AI</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#2A2A2A] border border-[#404040] rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-[#404040] rounded mb-4"></div>
              <div className="h-8 bg-[#404040] rounded mb-2"></div>
              <div className="h-4 bg-[#404040] rounded"></div>
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
          <h1 className="text-3xl font-semibold text-white">Conversations</h1>
          <p className="text-[#A0AEC0] mt-2">Analyze AI voice interactions with Gemini AI</p>
        </div>
        <Button onClick={fetchCalls} className="bg-[#5A9BD5] hover:bg-[#4FD1C5] text-white rounded-2xl px-6">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#5A9BD5] rounded-2xl flex items-center justify-center shadow-lg">
                  <Phone className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-white">{metrics.totalCalls}</h3>
              <p className="text-sm text-[#A0AEC0] mt-1">Total Calls</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#4FD1C5] rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-white">{metrics.successRate.toFixed(0)}%</h3>
              <p className="text-sm text-[#A0AEC0] mt-1">Success Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#5A9BD5] rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-white">{Math.round(metrics.avgDuration)}s</h3>
              <p className="text-sm text-[#A0AEC0] mt-1">Avg Duration</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#4FD1C5] rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-white">${metrics.totalCost.toFixed(2)}</h3>
              <p className="text-sm text-[#A0AEC0] mt-1">Total Cost</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0AEC0] w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#2A2A2A] border-[#404040] text-white placeholder:text-[#A0AEC0] focus:border-[#5A9BD5] rounded-2xl"
          />
        </div>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-auto">
          <TabsList className="bg-[#2A2A2A] border-[#404040] rounded-2xl">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#5A9BD5] rounded-xl">
              All
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-[#4FD1C5] rounded-xl">
              Completed
            </TabsTrigger>
            <TabsTrigger value="failed" className="data-[state=active]:bg-red-600 rounded-xl">
              Failed
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredCalls.length > 0 ? (
            filteredCalls.map((call) => (
              <Card
                key={call.id}
                className={`bg-[#2A2A2A] border-[#404040] hover:bg-[#404040] transition-all duration-300 cursor-pointer rounded-2xl shadow-lg ${
                  selectedCall?.id === call.id ? "ring-2 ring-[#5A9BD5] border-[#5A9BD5]" : ""
                }`}
                onClick={() => setSelectedCall(call)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#5A9BD5] rounded-2xl flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {call.customer?.number || call.phoneNumber?.number || "Unknown"}
                        </p>
                        <p className="text-sm text-[#A0AEC0]">
                          {call.createdAt ? new Date(call.createdAt).toLocaleString() : "Unknown time"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          call.status === "completed" ? "bg-[#4FD1C5] text-[#1E1E1E]" : "bg-red-500 text-white"
                        }
                      >
                        {call.status}
                      </Badge>
                      {call.startedAt && call.endedAt && (
                        <Badge variant="outline" className="border-[#404040] text-[#A0AEC0]">
                          <Clock className="w-3 h-3 mr-1" />
                          {Math.round(
                            (new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000 / 60,
                          )}
                          m
                        </Badge>
                      )}
                    </div>
                  </div>

                  {call.summary && <p className="text-sm text-[#A0AEC0] mb-3 line-clamp-2">{call.summary}</p>}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-[#A0AEC0]">
                      <MessageSquare className="w-3 h-3" />
                      {call.messages?.length || 0} messages
                    </div>
                    <div className="flex items-center gap-2">
                      {call.messages && call.messages.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleCallLog(call.id)
                          }}
                          className="border-[#404040] text-[#A0AEC0] hover:bg-[#404040] hover:border-[#5A9BD5] rounded-xl"
                        >
                          {expandedCallLogs.has(call.id) ? (
                            <>
                              <ChevronUp className="w-3 h-3 mr-1" />
                              Hide Call Log
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3 mr-1" />
                              View Full Call Log
                            </>
                          )}
                        </Button>
                      )}
                      {!call.summary && call.messages && call.messages.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            generateSummary(call)
                          }}
                          disabled={generatingSummary}
                          className="border-[#404040] text-[#A0AEC0] hover:bg-[#404040] hover:border-[#5A9BD5] rounded-xl"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Analyze
                        </Button>
                      )}
                    </div>
                  </div>

                  {expandedCallLogs.has(call.id) && call.messages && call.messages.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#404040]">
                      <h4 className="text-sm font-medium text-white mb-3">Full Call Transcript</h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {call.messages.map((message, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-xl text-sm ${
                              message.role === "assistant"
                                ? "bg-[#5A9BD5]/20 border-l-2 border-[#5A9BD5]"
                                : "bg-[#4FD1C5]/20 border-l-2 border-[#4FD1C5]"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-xs font-medium ${
                                  message.role === "assistant" ? "text-[#5A9BD5]" : "text-[#4FD1C5]"
                                }`}
                              >
                                {message.role === "assistant" ? "AI Assistant" : "Customer"}
                              </span>
                              {message.time && (
                                <span className="text-xs text-[#A0AEC0]">
                                  {new Date(message.time).toLocaleTimeString()}
                                </span>
                              )}
                            </div>
                            <p className="text-white">{message.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 text-[#A0AEC0]">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No conversations found</p>
              <p className="text-sm">Configure your Vapi API key to see call data</p>
            </div>
          )}
        </div>

        {/* Conversation Detail */}
        <div className="space-y-6">
          {selectedCall ? (
            <>
              <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Conversation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-[#A0AEC0] mb-1">Phone Number</p>
                    <p className="text-white font-mono">
                      {selectedCall.customer?.number || selectedCall.phoneNumber?.number || "Unknown"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[#A0AEC0] mb-1">Duration</p>
                    <p className="text-white">
                      {selectedCall.startedAt && selectedCall.endedAt
                        ? `${Math.round((new Date(selectedCall.endedAt).getTime() - new Date(selectedCall.startedAt).getTime()) / 1000 / 60)} minutes`
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[#A0AEC0] mb-1">Cost</p>
                    <p className="text-white">${selectedCall.cost?.toFixed(4) || "0.0000"}</p>
                  </div>

                  {selectedCall.summary && (
                    <div>
                      <p className="text-sm text-[#A0AEC0] mb-2">AI Summary</p>
                      <div className="bg-[#404040] rounded-2xl p-4 border border-[#404040]">
                        <p className="text-sm text-white">{selectedCall.summary}</p>
                      </div>
                    </div>
                  )}

                  {!selectedCall.summary && selectedCall.messages && selectedCall.messages.length > 0 && (
                    <Button
                      onClick={() => generateSummary(selectedCall)}
                      disabled={generatingSummary}
                      className="w-full bg-[#5A9BD5] hover:bg-[#4FD1C5] text-white rounded-2xl"
                    >
                      {generatingSummary ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating Summary...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate AI Summary
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {analysis && (
                <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      AI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#A0AEC0]">Sentiment:</span>
                      <Badge className={getSentimentColor(analysis.sentiment)}>
                        {getSentimentIcon(analysis.sentiment)}
                        <span className="ml-1 capitalize">{analysis.sentiment}</span>
                      </Badge>
                    </div>

                    <div>
                      <p className="text-sm text-[#A0AEC0] mb-1">Intent</p>
                      <p className="text-white">{analysis.intent}</p>
                    </div>

                    {analysis.keyPoints.length > 0 && (
                      <div>
                        <p className="text-sm text-[#A0AEC0] mb-2">Key Points</p>
                        <ul className="space-y-1">
                          {analysis.keyPoints.map((point, index) => (
                            <li key={index} className="text-sm text-white flex items-start gap-2">
                              <span className="w-1 h-1 bg-[#5A9BD5] rounded-full mt-2 flex-shrink-0"></span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.actionItems.length > 0 && (
                      <div>
                        <p className="text-sm text-[#A0AEC0] mb-2">Action Items</p>
                        <ul className="space-y-1">
                          {analysis.actionItems.map((item, index) => (
                            <li key={index} className="text-sm text-white flex items-start gap-2">
                              <span className="w-1 h-1 bg-[#4FD1C5] rounded-full mt-2 flex-shrink-0"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="bg-[#2A2A2A] border-[#404040] rounded-2xl shadow-lg">
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-[#A0AEC0]" />
                <p className="text-[#A0AEC0]">Select a conversation to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
