'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Send, Brain, MessageCircle, FileText, Scale } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConversationMode } from '@/types/database'

interface ChatInputProps {
  onSendMessage: (message: string, mode: ConversationMode) => void
  disabled?: boolean
  currentMode?: ConversationMode
  onModeChange?: (mode: ConversationMode) => void
  placeholder?: string
}

const modes = [
  { 
    value: 'challenge' as ConversationMode, 
    label: 'Challenge Mode', 
    icon: Brain,
    description: 'Critical analysis and assumption challenges'
  },
  { 
    value: 'debate' as ConversationMode, 
    label: 'Debate Mode', 
    icon: MessageCircle,
    description: 'Structured back-and-forth arguments'
  },
  { 
    value: 'analysis' as ConversationMode, 
    label: 'Analysis Mode', 
    icon: FileText,
    description: 'Systematic evaluation and feedback'
  },
]

export function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  currentMode = 'challenge',
  onModeChange,
  placeholder = "Describe your idea, argument, or proposal..."
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [selectedMode, setSelectedMode] = useState<ConversationMode>(currentMode)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus after sending a message
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [disabled])

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = Math.min(scrollHeight, 128) + 'px'
    }
  }, [message])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || disabled) return
    
    onSendMessage(message.trim(), selectedMode)
    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!message.trim() || disabled) return
      
      onSendMessage(message.trim(), selectedMode)
      setMessage('')
    }
  }

  const handleModeChange = (mode: ConversationMode) => {
    setSelectedMode(mode)
    onModeChange?.(mode)
  }

  const currentModeData = modes.find(m => m.value === selectedMode)
  const Icon = currentModeData?.icon || Brain

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-4xl mx-auto p-4 space-y-3">
        {/* Mode Selection */}
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedMode} onValueChange={handleModeChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              {modes.map((mode) => {
                const ModeIcon = mode.icon
                return (
                  <SelectItem key={mode.value} value={mode.value}>
                    <div className="flex items-center gap-2">
                      <ModeIcon className="w-4 h-4" />
                      <span>{mode.label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {currentModeData?.description}
          </span>
        </div>

        {/* Message Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1 space-y-2">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[48px] max-h-32 resize-none"
              maxLength={2000}
              rows={1}
            />
            {message && (
              <div className="text-xs text-muted-foreground">
                {message.length}/2000 characters • Press Enter to send, Shift+Enter for new line
              </div>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={disabled || !message.trim()}
            size="icon"
            className="h-12 w-12"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}