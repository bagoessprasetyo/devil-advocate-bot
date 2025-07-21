'use client'

import { useState } from 'react'
import { Plus, MessageSquare, Search, MoreHorizontal, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

interface ConversationSidebarProps {
  conversations: Conversation[]
  currentConversationId?: string
  isLoading?: boolean
  onNewChat: () => void
  onSelectConversation: (id: string) => void
  onRenameConversation: (id: string, newTitle: string) => void
  onDeleteConversation: (id: string) => void
}

export function ConversationSidebar({
  conversations,
  currentConversationId,
  isLoading = false,
  onNewChat,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    searchQuery.toLowerCase().split(' ').some(term => 
      conv.title.toLowerCase().includes(term)
    )
  )

  const groupedConversations = {
    today: [] as Conversation[],
    yesterday: [] as Conversation[],
    lastWeek: [] as Conversation[],
    older: [] as Conversation[],
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  filteredConversations.forEach(conv => {
    const convDate = new Date(conv.updated_at)
    if (convDate >= today) {
      groupedConversations.today.push(conv)
    } else if (convDate >= yesterday) {
      groupedConversations.yesterday.push(conv)
    } else if (convDate >= lastWeek) {
      groupedConversations.lastWeek.push(conv)
    } else {
      groupedConversations.older.push(conv)
    }
  })

  const handleStartEdit = (conv: Conversation) => {
    setEditingId(conv.id)
    setEditTitle(conv.title)
  }

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim())
    }
    setEditingId(null)
    setEditTitle('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  const handleDeleteClick = (id: string) => {
    setConversationToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (conversationToDelete) {
      onDeleteConversation(conversationToDelete)
    }
    setDeleteDialogOpen(false)
    setConversationToDelete(null)
  }

  const renderConversationItem = (conv: Conversation) => {
    const lastActivity = new Date(conv.updated_at)
    const timeAgo = format(lastActivity, 'MMM d')
    
    return (
      <div
        key={conv.id}
        className={cn(
          'group relative flex flex-col gap-1 rounded-lg px-3 py-3 text-sm hover:bg-accent cursor-pointer transition-colors',
          currentConversationId === conv.id && 'bg-accent'
        )}
        onClick={() => !editingId && onSelectConversation(conv.id)}
      >
        <div className="flex items-start gap-3">
          <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
          
          <div className="flex-1 min-w-0">
            {editingId === conv.id ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit()
                  if (e.key === 'Escape') handleCancelEdit()
                }}
                onBlur={handleSaveEdit}
                className="h-6 text-xs"
                autoFocus
              />
            ) : (
              <div className="space-y-1">
                <div className="font-medium text-foreground truncate leading-tight">
                  {conv.title}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{conv.message_count} messages</span>
                  <span>{timeAgo}</span>
                </div>
              </div>
            )}
          </div>

          {!editingId && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleStartEdit(conv)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteClick(conv.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderConversationGroup = (title: string, conversations: Conversation[]) => {
    if (conversations.length === 0) return null

    return (
      <div className="mb-4">
        <h3 className="mb-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
        <div className="space-y-2">
          {conversations.map(renderConversationItem)}
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex h-full w-80 flex-col border-r bg-muted/30">
        {/* Header */}
        <div className="flex items-center gap-2 p-4 border-b">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onNewChat} className="flex-1 justify-start gap-2">
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Start a new conversation (Ctrl+N)</p>
              <p className="text-xs opacity-75">Press Ctrl+Shift+/ for more shortcuts</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Search */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-xs"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 px-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 flex-1 rounded" />
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm font-medium mb-1">No conversation sessions</p>
              <p className="text-xs leading-relaxed max-w-[200px] mb-3">
                Your conversation sessions will appear here once you start chatting
              </p>
              <div className="text-xs bg-muted/50 rounded px-2 py-1">
                💡 Press <kbd className="bg-background px-1 rounded text-[10px] font-mono">Ctrl+N</kbd> for new chat
              </div>
            </div>
          ) : (
            <div className="py-2">
              {renderConversationGroup('Today', groupedConversations.today)}
              {renderConversationGroup('Yesterday', groupedConversations.yesterday)}
              {renderConversationGroup('Last 7 days', groupedConversations.lastWeek)}
              {renderConversationGroup('Older', groupedConversations.older)}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}