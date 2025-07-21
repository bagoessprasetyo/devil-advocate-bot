'use client'

import { useState, useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Keyboard, Command } from 'lucide-react'

interface KeyboardShortcut {
  keys: string[]
  description: string
  category: string
}

const shortcuts: KeyboardShortcut[] = [
  {
    keys: ['Ctrl', 'N'],
    description: 'Start new conversation',
    category: 'Navigation'
  },
  {
    keys: ['Ctrl', 'B'],
    description: 'Toggle sidebar',
    category: 'Navigation'
  },
  {
    keys: ['Ctrl', 'K'],
    description: 'Open conversation search (mobile)',
    category: 'Navigation'
  },
  {
    keys: ['Enter'],
    description: 'Send message',
    category: 'Chat'
  },
  {
    keys: ['Shift', 'Enter'],
    description: 'Add new line in message',
    category: 'Chat'
  },
  {
    keys: ['Ctrl', 'Shift', '/'],
    description: 'Show keyboard shortcuts',
    category: 'General'
  },
  {
    keys: ['Escape'],
    description: 'Cancel editing',
    category: 'General'
  }
]

const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  // Keyboard shortcut to open the dialog
  useHotkeys('ctrl+shift+/', () => {
    setOpen(true)
  }, { enableOnContentEditable: true, enableOnFormTags: true })

  const formatKey = (key: string) => {
    if (key === 'Ctrl' && isMac) return 'Cmd'
    return key
  }

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, KeyboardShortcut[]>)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 p-2"
          title="Keyboard shortcuts"
        >
          <Keyboard className="h-4 w-4" /> Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                {category}
              </h4>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={`${category}-${index}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <div key={keyIndex} className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className="text-xs font-mono px-1.5 py-0.5 h-auto bg-background"
                          >
                            {formatKey(key)}
                          </Badge>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-xs text-muted-foreground">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isMac ? (
              <Command className="h-3 w-3" />
            ) : (
              <kbd className="px-1.5 py-0.5 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded">
                Ctrl
              </kbd>
            )}
            <span>
              {isMac ? 'Cmd' : 'Ctrl'} key shortcuts work globally
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}