import type React from "react"
import { AssistantProvider } from "@/lib/assistant-context"

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <AssistantProvider>{children}</AssistantProvider>
}
