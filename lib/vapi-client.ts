interface VapiCall {
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

interface VapiResponse {
  calls: VapiCall[]
  pagination?: {
    page: number
    limit: number
    total: number
  }
}

interface VapiAssistant {
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

interface VapiAssistantsResponse {
  assistants: VapiAssistant[]
  pagination?: {
    page: number
    limit: number
    total: number
  }
}

export class VapiClient {
  private apiKey: string
  private baseUrl = "https://api.vapi.ai"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getAssistants(options?: {
    limit?: number
    page?: number
  }): Promise<VapiAssistantsResponse> {
    const params = new URLSearchParams()

    if (options?.limit) params.append("limit", options.limit.toString())
    if (options?.page) params.append("page", options.page.toString())

    const response = await fetch(`${this.baseUrl}/assistant?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Vapi API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return { assistants: data || [] }
  }

  async getCalls(options?: {
    limit?: number
    page?: number
    assistantId?: string
    phoneNumberId?: string
    status?: string
  }): Promise<VapiResponse> {
    const params = new URLSearchParams()

    if (options?.limit) params.append("limit", options.limit.toString())
    if (options?.page) params.append("page", options.page.toString())
    if (options?.assistantId) params.append("assistantId", options.assistantId)
    if (options?.phoneNumberId) params.append("phoneNumberId", options.phoneNumberId)
    if (options?.status) params.append("status", options.status)

    const response = await fetch(`${this.baseUrl}/call?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Vapi API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return { calls: data || [] }
  }

  async getCall(callId: string): Promise<VapiCall> {
    const response = await fetch(`${this.baseUrl}/call/${callId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Vapi API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getAnalytics(options?: {
    startDate?: string
    endDate?: string
    assistantId?: string
  }) {
    const params = new URLSearchParams()

    if (options?.startDate) params.append("startDate", options.startDate)
    if (options?.endDate) params.append("endDate", options.endDate)
    if (options?.assistantId) params.append("assistantId", options.assistantId)

    const response = await fetch(`${this.baseUrl}/analytics?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Vapi API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }
}

export type { VapiCall, VapiResponse, VapiAssistant, VapiAssistantsResponse }
