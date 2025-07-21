'use client'

import { useChat } from 'ai/react'
import { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './message-bubble'
import { ChatInput } from './chat-input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import type { ConversationMode } from '@/types/database'

interface ChatInterfaceProps {
  conversationId?: string
  initialMode?: ConversationMode
}

export function ChatInterface({ conversationId, initialMode = 'challenge' }: ChatInterfaceProps) {
  const [mode, setMode] = useState<ConversationMode>(initialMode)
  const [currentConversationId, setCurrentConversationId] = useState(conversationId)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, append, isLoading, error, setMessages } = useChat({
    api: '/api/chat',
    body: {
      conversationId: currentConversationId,
      mode,
    },
    onResponse: (response) => {
      // Extract conversation ID from response headers if it's a new conversation
      const newConversationId = response.headers.get('X-Conversation-Id')
      if (newConversationId && !currentConversationId) {
        setCurrentConversationId(newConversationId)
      }
    },
    onError: (error) => {
      console.error('Chat error:', error)
    },
  })

  // Load conversation messages when conversation changes
  useEffect(() => {
    const loadConversation = async () => {
      if (conversationId && conversationId !== currentConversationId) {
        try {
          const response = await fetch(`/api/conversations/${conversationId}`)
          if (response.ok) {
            const { conversation } = await response.json()
            const conversationMessages = conversation.messages
              .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map((msg: any) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                createdAt: new Date(msg.created_at),
              }))
            
            setMessages(conversationMessages)
            setCurrentConversationId(conversationId)
            setMode(conversation.mode || 'challenge')
          }
        } catch (error) {
          console.error('Failed to load conversation:', error)
        }
      } else if (!conversationId && currentConversationId) {
        // Clear messages when starting new chat
        setMessages([])
        setCurrentConversationId(undefined)
      }
    }

    loadConversation()
  }, [conversationId, currentConversationId, setMessages])

  // Auto-scroll to bottom when new messages arrive or content changes
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current
      const isNearBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 100
      
      // Only auto-scroll if user is near the bottom (not if they've scrolled up to read)
      if (isNearBottom) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isLoading])

  // Smooth scroll to bottom when a new message starts
  const scrollToBottom = (smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      })
    }
  }

  const handleSendMessage = async (message: string, selectedMode: ConversationMode) => {
    if (!message.trim() || isLoading) return
    
    setMode(selectedMode)
    
    // Scroll to bottom when sending a message
    setTimeout(() => scrollToBottom(), 100)
    
    try {
      await append({
        role: 'user',
        content: message.trim(),
      })
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message === 'No credits remaining' 
              ? 'You\'ve used all your free credits. Upgrade to continue chatting.'
              : 'Something went wrong. Please try again.'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="space-y-4 p-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤔</div>
              <h2 className="text-2xl font-bold mb-2">Ready to Challenge Your Ideas?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Share your thoughts, arguments, or proposals, and I'll help you strengthen them 
                through constructive criticism and devil's advocacy.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
                <div className="p-4 border rounded-lg">
                  <div className="font-medium mb-1">💡 Challenge Mode</div>
                  <div className="text-muted-foreground">
                    Critical analysis and assumption testing
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="font-medium mb-1">⚖️ Debate Mode</div>
                  <div className="text-muted-foreground">
                    Structured arguments and counterpoints
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="font-medium mb-1">📊 Analysis Mode</div>
                  <div className="text-muted-foreground">
                    Systematic evaluation and feedback
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              role={message.role as 'user' | 'assistant'}
              content={message.content}
              timestamp={new Date(message.createdAt || Date.now())}
              isLoading={isLoading}
            />
          ))}

          {/* Show thinking indicator when starting a new response (only if no assistant response yet) */}
          {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
            <MessageBubble
              role="assistant"
              content=""
              isLoading={true}
            />
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        currentMode={mode}
        onModeChange={setMode}
      />
    </div>
  )
}