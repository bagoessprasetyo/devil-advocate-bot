'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { DashboardNav } from '@/components/dashboard/nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  Download, 
  Share2, 
  ArrowLeft, 
  Brain,
  AlertTriangle,
  CheckCircle,
  Eye,
  MessageSquare,
  Target,
  Lightbulb
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import Link from 'next/link'

interface Document {
  id: string
  title: string
  content: string | null
  file_type: string
  file_size: number
  analysis_status: 'pending' | 'processing' | 'completed' | 'error'
  analysis_result: any
  created_at: string
  updated_at: string
}

interface DocumentAnalysisViewProps {
  document: Document
  user: User
}

const analysisCategories = [
  {
    key: 'logic',
    title: 'Logic & Reasoning',
    icon: Brain,
    description: 'Logical fallacies and reasoning gaps'
  },
  {
    key: 'evidence',
    title: 'Evidence & Support', 
    icon: CheckCircle,
    description: 'Quality and sufficiency of evidence'
  },
  {
    key: 'assumptions',
    title: 'Assumptions',
    icon: Eye,
    description: 'Underlying assumptions and biases'
  },
  {
    key: 'clarity',
    title: 'Clarity & Structure',
    icon: FileText,
    description: 'Organization and communication'
  },
  {
    key: 'objections',
    title: 'Potential Objections',
    icon: MessageSquare,
    description: 'Counterarguments others might raise'
  },
  {
    key: 'implementation',
    title: 'Implementation',
    icon: Target,
    description: 'Practical obstacles and feasibility'
  }
]

export function DocumentAnalysisView({ document, user }: DocumentAnalysisViewProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'processing':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Analysis Complete'
      case 'processing':
        return 'Processing...'
      case 'error':
        return 'Analysis Failed'
      default:
        return 'Pending'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const exportAnalysis = () => {
    // Implementation for exporting analysis as PDF
    console.log('Export analysis as PDF')
  }

  const shareAnalysis = () => {
    // Implementation for sharing analysis
    console.log('Share analysis')
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />
      
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/chat">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chat
              </Button>
            </Link>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold truncate">{document.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>{formatFileSize(document.file_size)}</span>
                <span>•</span>
                <span>Uploaded {format(new Date(document.created_at), 'MMM d, yyyy')}</span>
                <span>•</span>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getStatusColor(document.analysis_status))}
                >
                  {getStatusText(document.analysis_status)}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={shareAnalysis}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={exportAnalysis}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {document.analysis_status === 'error' ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Analysis failed. Please try uploading the document again.
            </AlertDescription>
          </Alert>
        ) : document.analysis_status === 'processing' ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-lg font-medium">Analyzing your document...</p>
            <p className="text-sm text-muted-foreground">This may take a few moments</p>
          </div>
        ) : document.analysis_status === 'completed' ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
              <TabsTrigger value="document">Original Document</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {analysisCategories.map((category) => {
                  const Icon = category.icon
                  return (
                    <Card key={category.key} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{category.title}</CardTitle>
                        </div>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">Key Insights</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {document.analysis_result?.parsed_analysis?.[category.key] || 
                             document.analysis_result?.analysis_sections?.[category.key] || 
                             "Analysis insights will be displayed here after processing is complete."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="detailed" className="mt-6">
              <div className="space-y-6">
                {document.analysis_result?.parsed_analysis ? (
                  <>
                    {/* Overview */}
                    {document.analysis_result.parsed_analysis.overview && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Overview
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-relaxed">
                            {document.analysis_result.parsed_analysis.overview}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Analysis Sections */}
                    {analysisCategories.map((category) => {
                      const Icon = category.icon
                      const content = document.analysis_result.parsed_analysis[category.key]
                      if (!content) return null

                      return (
                        <Card key={category.key}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Icon className="h-5 w-5 text-primary" />
                              {category.title}
                            </CardTitle>
                            <CardDescription>{category.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {content}
                            </p>
                          </CardContent>
                        </Card>
                      )
                    })}

                    {/* Recommendations */}
                    {document.analysis_result.parsed_analysis.recommendations && (
                      <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-primary">
                            <Lightbulb className="h-5 w-5" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {document.analysis_result.parsed_analysis.recommendations}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Complete Analysis Report</CardTitle>
                      <CardDescription>
                        Raw analysis output from the AI
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px] w-full">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {document.analysis_result?.analysis ? (
                            <div className="whitespace-pre-wrap text-sm">
                              {document.analysis_result.analysis}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">
                              Analysis results will be displayed here after processing is complete.
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="document" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Original Document</CardTitle>
                  <CardDescription>
                    Extracted content from your uploaded file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] w-full">
                    <div className="text-sm font-mono whitespace-pre-wrap bg-muted/30 p-4 rounded">
                      {document.content || 'Document content could not be extracted.'}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Document analysis is pending. Please wait for processing to begin.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}