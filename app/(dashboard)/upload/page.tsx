import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DocumentUploadPage } from '@/components/upload/document-upload-page'

export default async function UploadPage() {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return <DocumentUploadPage user={user} />
}