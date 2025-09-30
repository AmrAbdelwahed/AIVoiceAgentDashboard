import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AnalyticsModule } from "@/components/analytics-module"

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout>
      <AnalyticsModule />
    </DashboardLayout>
  )
}
