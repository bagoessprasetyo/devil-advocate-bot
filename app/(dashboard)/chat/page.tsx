import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardWithSidebar } from '@/components/dashboard/dashboard-with-sidebar'

interface ChatPageProps {
  searchParams: { conversation?: string }
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <DashboardWithSidebar 
      user={user} 
      conversationId={searchParams.conversation}
    />
  )
}