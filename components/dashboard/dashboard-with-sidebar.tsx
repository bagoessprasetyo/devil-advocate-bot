'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { useHotkeys } from 'react-hotkeys-hook'
import { ConversationSidebar } from '@/components/chat/conversation-sidebar'
import { MobileSidebar } from '@/components/chat/mobile-sidebar'
import { ChatInterface } from '@/components/chat/chat-interface'
import { DashboardNav } from '@/components/dashboard/nav'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { ConversationMode } from '@/types/database'

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

interface DashboardWithSidebarProps {
  user: User
  conversationId?: string
}

export function DashboardWithSidebar({ user, conversationId: initialConversationId }: DashboardWithSidebarProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(initialConversationId)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Keyboard shortcuts
  useHotkeys('ctrl+n, cmd+n', (e) => {
    e.preventDefault()
    handleNewChat()
  }, { enableOnContentEditable: true, enableOnFormTags: true })

  useHotkeys('ctrl+k, cmd+k', (e) => {
    e.preventDefault()
    setMobileOpen(true)
  }, { enableOnContentEditable: true, enableOnFormTags: true })

  useHotkeys('ctrl+b, cmd+b', (e) => {
    e.preventDefault()
    setSidebarCollapsed(!sidebarCollapsed)
  }, { enableOnContentEditable: true, enableOnFormTags: true })

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await fetch('/api/conversations')
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }
      const data = await response.json()
      return data.conversations as Conversation[]
    },
  })

  // Subscribe to conversation changes
  useEffect(() => {
    const channel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user.id, queryClient])

  const handleNewChat = () => {
    setCurrentConversationId(undefined)
    router.push('/chat')
  }

  const handleSelectConversation = (id: string) => {
    if (id !== currentConversationId) {
      setCurrentConversationId(id)
      router.push(`/chat?conversation=${id}`)
    }
  }

  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      })

      if (!response.ok) {
        throw new Error('Failed to rename conversation')
      }

      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    } catch (error) {
      console.error('Error renaming conversation:', error)
    }
  }

  const handleDeleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete conversation')
      }

      // If we're currently viewing the deleted conversation, go to new chat
      if (currentConversationId === id) {
        setCurrentConversationId(undefined)
        router.push('/chat')
      }

      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  const currentConversation = conversations.find(c => c.id === currentConversationId)

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav 
        user={user}
        onToggleSidebar={handleToggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
        leftContent={
          <MobileSidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            isLoading={conversationsLoading}
            onNewChat={handleNewChat}
            onSelectConversation={handleSelectConversation}
            onRenameConversation={handleRenameConversation}
            onDeleteConversation={handleDeleteConversation}
            open={mobileOpen}
            onOpenChange={setMobileOpen}
          />
        }
      />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Desktop Sidebar */}
        <div className={cn(
          "hidden lg:block transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-0 overflow-hidden" : "w-80"
        )}>
          {!sidebarCollapsed && (
            <ConversationSidebar
              conversations={conversations}
              currentConversationId={currentConversationId}
              isLoading={conversationsLoading}
              onNewChat={handleNewChat}
              onSelectConversation={handleSelectConversation}
              onRenameConversation={handleRenameConversation}
              onDeleteConversation={handleDeleteConversation}
            />
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
          <ChatInterface 
            conversationId={currentConversationId}
            key={currentConversationId} // Force re-render when conversation changes
          />
        </div>
      </div>
    </div>
  )
}