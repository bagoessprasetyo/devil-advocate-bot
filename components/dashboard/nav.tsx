'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { KeyboardShortcuts } from '@/components/ui/keyboard-shortcuts'
import { 
  MessageCircle, 
  Settings, 
  LogOut, 
  User as UserIcon,
  Zap,
  PanelLeft
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'

interface DashboardNavProps {
  user: User
  leftContent?: React.ReactNode
  onToggleSidebar?: () => void
  sidebarCollapsed?: boolean
}

export function DashboardNav({ user, leftContent, onToggleSidebar, sidebarCollapsed }: DashboardNavProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const displayName = user.user_metadata?.full_name || 
                     user.user_metadata?.name || 
                     user.email?.split('@')[0] || 
                     'User'

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <div className="flex items-center gap-3">
          {leftContent}
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="hidden lg:flex h-8 w-8 p-0"
              title={`${sidebarCollapsed ? 'Show' : 'Hide'} sidebar (Ctrl+B)`}
            >
              <PanelLeft className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")} />
            </Button>
          )}
          <Link href="/chat" className="flex items-center gap-2 font-semibold">
            <div className="w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
              DA
            </div>
            <span className="hidden sm:inline">Devil's Advocate AI</span>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <KeyboardShortcuts />
          
          <Badge variant="secondary" className="hidden sm:inline-flex">
            <Zap className="w-3 h-3 mr-1" />
            Free Plan
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url || user.user_metadata?.picture} />
                  <AvatarFallback>
                    <UserIcon className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/chat">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  New Chat
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut className="w-4 h-4 mr-2" />
                {isLoggingOut ? 'Logging out...' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}