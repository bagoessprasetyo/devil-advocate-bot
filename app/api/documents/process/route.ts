import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documentId } = await req.json()

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    // Get document from database
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Update status to processing
    await supabase
      .from('documents')
      .update({ analysis_status: 'processing' })
      .eq('id', documentId)

    // Extract text content from document
    let textContent = ''
    
    try {
      // Download file from Supabase Storage
      const response = await fetch(document.file_url)
      if (!response.ok) {
        throw new Error('Failed to download document')
      }

      if (document.file_type === 'text/plain' || document.file_type === 'text/markdown') {
        textContent = await response.text()
      } else if (document.file_type === 'application/pdf') {
        // Parse PDF using pdf-parse
        const { default: pdfParse } = await import('pdf-parse')
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const data = await pdfParse(buffer)
        textContent = data.text
      } else if (document.file_type.includes('word')) {
        // Parse Word document using mammoth
        const { default: mammoth } = await import('mammoth')
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const result = await mammoth.extractRawText({ buffer })
        textContent = result.value
      }

      // If content is too long, truncate it
      if (textContent.length > 12000) {
        textContent = textContent.substring(0, 12000) + '\n\n[Document truncated due to length]'
      }

    } catch (extractError) {
      console.error('Content extraction error:', extractError)
      await supabase
        .from('documents')
        .update({ 
          analysis_status: 'error',
          analysis_result: { error: 'Failed to extract document content' }
        })
        .eq('id', documentId)
      
      return NextResponse.json({ error: 'Failed to process document' }, { status: 500 })
    }

    // Perform AI analysis
    try {
      const systemPrompt = `You are a devil's advocate AI designed to provide constructive criticism and analysis. 
Analyze the following document and provide detailed feedback across these dimensions.

Return your response as a JSON object with the following structure:
{
  "overview": "Brief overall assessment of the document",
  "logic": "Analysis of logical fallacies, unsupported claims, and reasoning gaps",
  "evidence": "Evaluation of the quality and sufficiency of evidence provided", 
  "assumptions": "Challenge underlying assumptions and hidden biases",
  "clarity": "Assessment of organization, clarity, and communication effectiveness",
  "objections": "Anticipated counterarguments and criticisms others might raise",
  "implementation": "Practical obstacles or feasibility issues identified",
  "recommendations": "Specific actionable suggestions for improvement"
}

Provide specific, actionable feedback with examples from the document. Be constructively critical but not harsh.
Focus on helping improve the document rather than just criticizing it.`

      const { text: analysisText } = await generateText({
        model: openai('gpt-4-turbo'),
        system: systemPrompt,
        prompt: `Please analyze this document:\n\n${textContent}`,
        temperature: 0.3,
        maxTokens: 3000,
      })

      // Parse the JSON response
      let parsedAnalysis
      try {
        parsedAnalysis = JSON.parse(analysisText)
      } catch (parseError) {
        // Fallback if JSON parsing fails
        parsedAnalysis = {
          overview: "Analysis completed",
          logic: analysisText.substring(0, 500),
          evidence: "Could not parse structured analysis",
          assumptions: "",
          clarity: "",
          objections: "",
          implementation: "",
          recommendations: ""
        }
      }

      // Save analysis result
      const analysisResult = {
        content: textContent,
        analysis: analysisText,
        parsed_analysis: parsedAnalysis,
        processed_at: new Date().toISOString(),
        word_count: textContent.split(/\s+/).filter(word => word.length > 0).length,
        character_count: textContent.length,
        analysis_sections: parsedAnalysis
      }

      await supabase
        .from('documents')
        .update({ 
          analysis_status: 'completed',
          analysis_result: analysisResult,
          content: textContent
        })
        .eq('id', documentId)

      return NextResponse.json({
        documentId,
        status: 'completed',
        analysis: analysisResult
      })

    } catch (aiError) {
      console.error('AI analysis error:', aiError)
      await supabase
        .from('documents')
        .update({ 
          analysis_status: 'error',
          analysis_result: { error: 'AI analysis failed' }
        })
        .eq('id', documentId)
      
      return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
    }

  } catch (error) {
    console.error('Process API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}