import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/chat')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center text-xl font-bold">
              DA
            </div>
            <h1 className="text-4xl font-bold">Devil's Advocate AI</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Strengthen your ideas through intelligent opposition and critical analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧠 Challenge Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Test your assumptions and identify logical gaps through critical analysis
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚖️ Debate Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Engage in structured arguments to strengthen your position
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Analysis Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get systematic evaluation and actionable feedback on your ideas
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Free tier includes 5 conversations per month • No credit card required
          </p>
        </div>
      </div>
    </div>
  )
}
