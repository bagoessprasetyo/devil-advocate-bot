'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ConversationSidebar } from './conversation-sidebar'

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

interface MobileSidebarProps {
  conversations: Conversation[]
  currentConversationId?: string
  isLoading?: boolean
  onNewChat: () => void
  onSelectConversation: (id: string) => void
  onRenameConversation: (id: string, newTitle: string) => void
  onDeleteConversation: (id: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({
  conversations,
  currentConversationId,
  isLoading,
  onNewChat,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  open,
  onOpenChange,
}: MobileSidebarProps) {
  const handleSelectConversation = (id: string) => {
    onSelectConversation(id)
    onOpenChange(false)
  }

  const handleNewChat = () => {
    onNewChat()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-80">
        <ConversationSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          isLoading={isLoading}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          onRenameConversation={onRenameConversation}
          onDeleteConversation={onDeleteConversation}
        />
      </SheetContent>
    </Sheet>
  )
}