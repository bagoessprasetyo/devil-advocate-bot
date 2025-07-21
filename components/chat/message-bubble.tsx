import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Bot, User } from 'lucide-react'
import { format } from 'date-fns'
import { MarkdownRenderer } from './markdown-renderer'
import { StreamingText, ThinkingIndicator } from './streaming-text'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
  isLoading?: boolean
}

export function MessageBubble({ role, content, timestamp, isLoading }: MessageBubbleProps) {
  const isUser = role === 'user'

  return (
    <div className={cn(
      'flex gap-3 p-4',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      <Avatar className="w-8 h-8 mt-1">
        {isUser ? (
          <>
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarFallback className="bg-red-100 text-red-600">
              <Bot className="w-4 h-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>
      
      <div className={cn(
        'flex flex-col gap-1 max-w-[80%]',
        isUser ? 'items-end' : 'items-start'
      )}>
        <div className="flex items-center gap-2">
          <Badge variant={isUser ? 'default' : 'destructive'} className="text-xs">
            {isUser ? 'You' : 'Devil\'s Advocate'}
          </Badge>
          {timestamp && (
            <span className="text-xs text-muted-foreground">
              {format(timestamp, 'HH:mm')}
            </span>
          )}
        </div>
        
        <div className={cn(
          'rounded-lg px-4 py-2 transition-all duration-200',
          isUser 
            ? 'bg-primary text-primary-foreground ml-auto' 
            : 'bg-muted',
          isLoading && 'opacity-70',
          'animate-in slide-in-from-bottom-2 fade-in-0 duration-300'
        )}>
          {isLoading && !content ? (
            <ThinkingIndicator />
          ) : isUser ? (
            <div className="whitespace-pre-wrap leading-relaxed">{content}</div>
          ) : role === 'assistant' && isLoading ? (
            <StreamingText 
              content={content} 
              isComplete={false}
              className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-p:leading-relaxed"
            />
          ) : (
            <MarkdownRenderer 
              content={content}
              className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-p:leading-relaxed"
            />
          )}
        </div>
      </div>
    </div>
  )
}