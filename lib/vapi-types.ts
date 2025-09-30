export interface VapiCall {
  id: string
  createdAt: string
  updatedAt: string
  type: string
  status: string
  phoneNumber?: {
    number: string
  }
  customer?: {
    number: string
  }
  startedAt?: string
  endedAt?: string
  cost?: number
  costBreakdown?: {
    transport?: number
    stt?: number
    llm?: number
    tts?: number
    vapi?: number
    total?: number
  }
  messages?: Array<{
    role: string
    message: string
    time: number
  }>
  recordingUrl?: string
  summary?: string
  analysis?: {
    successEvaluation?: string
    structuredData?: any
  }
}

export interface VapiResponse {
  calls: VapiCall[]
  pagination?: {
    page: number
    limit: number
    total: number
  }
}

export interface VapiAssistant {
  id: string
  name: string
  description?: string
  model?: {
    provider: string
    model: string
  }
  voice?: {
    provider: string
    voiceId: string
  }
  firstMessage?: string
  systemMessage?: string
  createdAt: string
  updatedAt: string
}

export interface VapiAssistantsResponse {
  assistants: VapiAssistant[]
  pagination?: {
    page: number
    limit: number
    total: number
  }
}

export interface VapiChat {
  id: string
  createdAt: string
  updatedAt: string
  assistantId?: string
  messages: Array<{
    role: string
    content: string
    timestamp: string
  }>
  status: string
}

export interface VapiChatsResponse {
  chats: VapiChat[]
  pagination?: {
    page: number
    limit: number
    total: number
  }
}
