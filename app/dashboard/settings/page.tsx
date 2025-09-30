import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SettingsModule } from "@/components/settings-module"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout>
      <SettingsModule />
    </DashboardLayout>
  )
}
