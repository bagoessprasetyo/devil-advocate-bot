import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { DocumentAnalysisView } from '@/components/analysis/document-analysis-view'

interface AnalysisPageProps {
  params: { id: string }
}

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const supabase = createClient()

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Get document with analysis
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (docError || !document) {
    notFound()
  }

  return <DocumentAnalysisView document={document} user={user} />
}