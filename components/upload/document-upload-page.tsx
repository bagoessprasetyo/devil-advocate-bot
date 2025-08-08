'use client'

import { User } from '@supabase/supabase-js'
import { DashboardNav } from '@/components/dashboard/nav'
import { DocumentUploader } from '@/components/upload/document-uploader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Brain, 
  Target, 
  Eye, 
  MessageSquare,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface DocumentUploadPageProps {
  user: User
}

const analysisFeatures = [
  {
    icon: Brain,
    title: 'Logic & Reasoning Analysis',
    description: 'Identify logical fallacies, unsupported claims, and reasoning gaps in your document.'
  },
  {
    icon: CheckCircle,
    title: 'Evidence Evaluation',
    description: 'Assess the quality and sufficiency of evidence and supporting materials.'
  },
  {
    icon: Eye,
    title: 'Assumption Challenges',
    description: 'Uncover hidden assumptions and potential biases in your arguments.'
  },
  {
    icon: Target,
    title: 'Implementation Feasibility',
    description: 'Identify practical obstacles and feasibility concerns for your proposals.'
  },
  {
    icon: MessageSquare,
    title: 'Counterargument Preparation',
    description: 'Anticipate objections and criticisms others might raise about your ideas.'
  },
  {
    icon: FileText,
    title: 'Structure & Clarity Review',
    description: 'Improve organization, clarity, and overall communication effectiveness.'
  }
]

export function DocumentUploadPage({ user }: DocumentUploadPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />
      
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/chat">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chat
              </Button>
            </Link>
          </div>
          
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold mb-4">Document Analysis</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Upload your documents to receive comprehensive critical analysis and constructive feedback. 
              Perfect for business plans, research papers, proposals, and more.
            </p>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm">
                PDF, Word & Text files supported
              </Badge>
              <Badge variant="secondary" className="text-sm">
                Up to 10MB per file
              </Badge>
              <Badge variant="secondary" className="text-sm">
                AI-powered analysis
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Document</CardTitle>
                <CardDescription>
                  Drag and drop your files here, or click to browse and select files from your device.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentUploader 
                  maxFiles={3}
                  maxFileSize={10}
                  onUploadComplete={(files) => {
                    console.log('Upload completed:', files)
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What You'll Get</CardTitle>
                <CardDescription>
                  Comprehensive analysis across multiple dimensions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisFeatures.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div key={index} className="flex gap-3">
                      <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supported Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-red-500" />
                    <span className="text-sm">PDF Documents</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Microsoft Word (.doc, .docx)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Plain Text (.txt)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Markdown (.md)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Process Overview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Simple 3-step process to get comprehensive feedback on your documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">1</span>
                </div>
                <h3 className="font-medium mb-2">Upload Document</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your PDF, Word document, or text file using our secure uploader.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">2</span>
                </div>
                <h3 className="font-medium mb-2">AI Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes your content across multiple dimensions with constructive criticism.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">3</span>
                </div>
                <h3 className="font-medium mb-2">Get Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Receive detailed analysis with specific suggestions and areas for improvement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}