'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileText, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadedFile {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
  url?: string
}

interface DocumentUploaderProps {
  onUploadComplete?: (files: UploadedFile[]) => void
  maxFiles?: number
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
  className?: string
}

const ACCEPTED_TYPES = [
  '.pdf',
  '.doc',
  '.docx', 
  '.txt',
  '.md',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown'
]

const MAX_FILE_SIZE = 10 // MB

export function DocumentUploader({
  onUploadComplete,
  maxFiles = 5,
  maxFileSize = MAX_FILE_SIZE,
  acceptedTypes = ACCEPTED_TYPES,
  className
}: DocumentUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const isValidType = acceptedTypes.some(type => 
      type.startsWith('.') ? type === fileExtension : type === file.type
    )

    if (!isValidType) {
      return 'File type not supported. Please upload PDF, Word, or text files.'
    }

    return null
  }

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    setError(null)
    const newFiles: UploadedFile[] = []

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList instanceof FileList ? fileList[i] : fileList[i]
      
      if (files.length + newFiles.length >= maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`)
        break
      }

      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        continue
      }

      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
        status: 'uploading'
      }

      newFiles.push(uploadedFile)
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles])
      
      // Process each file
      for (const uploadedFile of newFiles) {
        await processFile(uploadedFile)
      }
    }
  }, [files.length, maxFiles, maxFileSize])

  const processFile = async (uploadedFile: UploadedFile) => {
    try {
      const formData = new FormData()
      formData.append('file', uploadedFile.file)

      // Simulate upload progress
      const updateProgress = (progress: number) => {
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id ? { ...f, progress } : f
        ))
      }

      // Upload file
      updateProgress(30)
      
      const uploadResponse = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      const { documentId, url } = await uploadResponse.json()
      updateProgress(60)

      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'processing', progress: 70 }
          : f
      ))

      // Process document
      const processResponse = await fetch('/api/documents/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId })
      })

      if (!processResponse.ok) {
        throw new Error('Processing failed')
      }

      // Complete
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { 
              ...f, 
              status: 'completed', 
              progress: 100,
              url: `/analysis/${documentId}`
            }
          : f
      ))

      const completedFiles = files.filter(f => f.status === 'completed')
      onUploadComplete?.(completedFiles)

    } catch (error) {
      console.error('Upload error:', error)
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed'
            }
          : f
      ))
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const openAnalysis = (file: UploadedFile) => {
    if (file.url && file.status === 'completed') {
      router.push(file.url)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragOver 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Drop files here or click to upload
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Support for PDF, Word documents, and text files up to {maxFileSize}MB
          </p>
          <Button variant="outline">
            Select Files
          </Button>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploaded Files</h4>
          {files.map((file) => (
            <Card key={file.id} className="p-3">
              <div className="flex items-center gap-3">
                {getFileIcon(file.file.name)}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  
                  {file.status === 'uploading' || file.status === 'processing' ? (
                    <div className="mt-2">
                      <Progress value={file.progress} className="h-1" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {file.status === 'uploading' ? 'Uploading...' : 'Processing...'}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  {file.status === 'processing' && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  
                  {file.status === 'completed' && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openAnalysis(file)}
                      >
                        View Analysis
                      </Button>
                    </>
                  )}
                  
                  {file.status === 'error' && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-xs text-destructive">
                        {file.error}
                      </span>
                    </div>
                  )}

                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}