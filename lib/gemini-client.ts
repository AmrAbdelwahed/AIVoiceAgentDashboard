interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

export class GeminiClient {
  private apiKey: string
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateSummary(conversationText: string): Promise<string> {
    const prompt = `
Please analyze this restaurant phone conversation and provide a concise summary including:
1. Customer intent (reservation, inquiry, complaint, etc.)
2. Key details (party size, date/time, special requests)
3. Outcome (successful booking, information provided, issue resolved, etc.)
4. Any follow-up actions needed

Conversation:
${conversationText}

Please provide a clear, professional summary in 2-3 sentences.
`

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
      }

      const data: GeminiResponse = await response.json()

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text.trim()
      }

      throw new Error("Invalid response format from Gemini API")
    } catch (error) {
      console.error("Error generating summary:", error)
      throw error
    }
  }

  async analyzeConversation(conversationText: string): Promise<{
    sentiment: "positive" | "neutral" | "negative"
    intent: string
    keyPoints: string[]
    actionItems: string[]
  }> {
    const prompt = `
Analyze this restaurant phone conversation and provide a JSON response with:
1. sentiment: "positive", "neutral", or "negative"
2. intent: primary purpose of the call
3. keyPoints: array of important details mentioned
4. actionItems: array of follow-up actions needed

Conversation:
${conversationText}

Respond only with valid JSON.
`

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
      }

      const data: GeminiResponse = await response.json()

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const jsonText = data.candidates[0].content.parts[0].text.trim()
        return JSON.parse(jsonText)
      }

      throw new Error("Invalid response format from Gemini API")
    } catch (error) {
      console.error("Error analyzing conversation:", error)
      // Return fallback analysis
      return {
        sentiment: "neutral",
        intent: "General inquiry",
        keyPoints: ["Conversation analysis unavailable"],
        actionItems: [],
      }
    }
  }
}
