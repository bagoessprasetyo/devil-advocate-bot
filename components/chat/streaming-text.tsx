'use client'

import { useState, useEffect, memo } from 'react'
import { MarkdownRenderer } from './markdown-renderer'

interface StreamingTextProps {
  content: string
  isComplete?: boolean
  className?: string
  speed?: number
}

const StreamingTextComponent = memo(function StreamingText({ 
  content, 
  isComplete = false, 
  className,
  speed = 20 
}: StreamingTextProps) {
  // For real-time streaming, just show the content as it arrives
  // No need to simulate typing since the AI SDK streams content naturally
  
  return (
    <div className={className}>
      <MarkdownRenderer content={content} />
      {!isComplete && (
        <span className="inline-block w-0.5 h-4 bg-current animate-pulse ml-1" />
      )}
    </div>
  )
})

export const StreamingText = StreamingTextComponent

interface ThinkingIndicatorProps {
  className?: string
}

export const ThinkingIndicator = memo(function ThinkingIndicator({ className }: ThinkingIndicatorProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
        </div>
        <span className="text-sm">Thinking...</span>
      </div>
    </div>
  )
})