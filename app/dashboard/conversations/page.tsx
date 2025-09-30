import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ConversationsModule } from "@/components/conversations-module"

export default async function ConversationsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout>
      <ConversationsModule />
    </DashboardLayout>
  )
}
