import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check } from 'lucide-react'
import { useState, memo } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

interface CodeBlockProps {
  children: string
  className?: string
  inline?: boolean
}

function CodeBlock({ children, className, inline }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const language = className?.replace('language-', '') || 'text'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (inline) {
    return (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    )
  }

  return (
    <div className="relative group">
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b">
        <span className="text-xs text-muted-foreground font-mono uppercase">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              <span className="text-xs">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: '0 0 0.375rem 0.375rem',
          fontSize: '0.875rem',
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  )
}

export const MarkdownRenderer = memo(function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-sm max-w-none dark:prose-invert', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ children, className, ...props }) => {
            const inline = !className
            return (
              <CodeBlock
                className={className}
                inline={inline}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </CodeBlock>
            )
          },
          // Style headings
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-6 mb-4 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold mt-5 mb-3 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium mt-4 mb-2 first:mt-0">{children}</h3>
          ),
          // Style lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-3">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-3">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          // Style paragraphs
          p: ({ children }) => (
            <p className="leading-relaxed my-3 first:mt-0 last:mb-0">{children}</p>
          ),
          // Style blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/20 pl-4 my-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          // Style emphasis
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          // Style links
          a: ({ href, children }) => (
            <a 
              href={href}
              className="text-primary hover:text-primary/80 underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          // Style horizontal rules
          hr: () => (
            <hr className="border-0 border-t border-border my-6" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
})