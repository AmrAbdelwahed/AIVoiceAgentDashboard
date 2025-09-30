"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { VapiAssistant } from "@/lib/vapi-types"

interface AssistantContextType {
  selectedAssistantId: string | null
  setSelectedAssistantId: (id: string | null) => void
  assistants: VapiAssistant[]
  isLoading: boolean
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined)

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(null)
  const [assistants, setAssistants] = useState<VapiAssistant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const response = await fetch("/api/vapi/assistants")
        if (response.ok) {
          const data = await response.json()
          setAssistants(data.assistants || [])
          // Set first assistant as default if available
          if (data.assistants && data.assistants.length > 0) {
            setSelectedAssistantId(data.assistants[0].id)
          }
        }
      } catch (error) {
        console.error("Error fetching assistants:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssistants()
  }, [])

  return (
    <AssistantContext.Provider value={{ selectedAssistantId, setSelectedAssistantId, assistants, isLoading }}>
      {children}
    </AssistantContext.Provider>
  )
}

export function useAssistant() {
  const context = useContext(AssistantContext)
  if (context === undefined) {
    throw new Error("useAssistant must be used within an AssistantProvider")
  }
  return context
}
