"use client"

import { useAssistant } from "@/lib/assistant-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bot } from "lucide-react"

export function AssistantSelector() {
  const { selectedAssistantId, setSelectedAssistantId, assistants, isLoading } = useAssistant()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] border border-[#404040] rounded-xl">
        <Bot className="w-4 h-4 text-[#A0AEC0]" />
        <span className="text-sm text-[#A0AEC0]">Loading assistants...</span>
      </div>
    )
  }

  if (assistants.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] border border-[#404040] rounded-xl">
        <Bot className="w-4 h-4 text-[#A0AEC0]" />
        <span className="text-sm text-[#A0AEC0]">No assistants found</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Bot className="w-4 h-4 text-[#A0AEC0]" />
      <Select value={selectedAssistantId || undefined} onValueChange={setSelectedAssistantId}>
        <SelectTrigger className="w-[200px] bg-[#2A2A2A] border-[#404040] text-white">
          <SelectValue placeholder="All Assistants" />
        </SelectTrigger>
        <SelectContent className="bg-[#2A2A2A] border-[#404040]">
          <SelectItem value="all" className="text-white hover:bg-[#404040]">
            All Assistants
          </SelectItem>
          {assistants.map((assistant) => (
            <SelectItem key={assistant.id} value={assistant.id} className="text-white hover:bg-[#404040]">
              {assistant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
