import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ensureUserProfile } from '@/lib/auth/profile'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Ensure user profile exists (fallback if trigger failed)
  await ensureUserProfile(user)

  return children
}