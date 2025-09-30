export class VAPIService {
  private baseURL = "https://api.vapi.ai"
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.VAPI_PRIVATE_KEY || ""
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`VAPI API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  async getAssistants(params?: {
    limit?: number
    createdAtGt?: string
    createdAtLt?: string
  }) {
    const searchParams = new URLSearchParams()

    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.createdAtGt) searchParams.append("createdAtGt", params.createdAtGt)
    if (params?.createdAtLt) searchParams.append("createdAtLt", params.createdAtLt)

    const queryString = searchParams.toString()
    const endpoint = `/assistant${queryString ? `?${queryString}` : ""}`

    return this.makeRequest(endpoint)
  }

  async getCalls(params?: {
    assistantId?: string
    limit?: number
    createdAtGt?: string
    createdAtLt?: string
  }) {
    const searchParams = new URLSearchParams()

    if (params?.assistantId) searchParams.append("assistantId", params.assistantId)
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.createdAtGt) searchParams.append("createdAtGt", params.createdAtGt)
    if (params?.createdAtLt) searchParams.append("createdAtLt", params.createdAtLt)

    const queryString = searchParams.toString()
    const endpoint = `/call${queryString ? `?${queryString}` : ""}`

    return this.makeRequest(endpoint)
  }

  async getCall(callId: string) {
    return this.makeRequest(`/call/${callId}`)
  }

  async getChats(params?: {
    assistantId?: string
    limit?: number
    createdAtGt?: string
    createdAtLt?: string
  }) {
    const searchParams = new URLSearchParams()

    if (params?.assistantId) searchParams.append("assistantId", params.assistantId)
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.createdAtGt) searchParams.append("createdAtGt", params.createdAtGt)
    if (params?.createdAtLt) searchParams.append("createdAtLt", params.createdAtLt)

    const queryString = searchParams.toString()
    const endpoint = `/chat${queryString ? `?${queryString}` : ""}`

    return this.makeRequest(endpoint)
  }

  async getChat(chatId: string) {
    return this.makeRequest(`/chat/${chatId}`)
  }
}
