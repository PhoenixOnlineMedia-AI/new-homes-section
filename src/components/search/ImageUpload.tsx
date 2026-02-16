'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  onUpload: (file: File) => void
  onClear?: () => void
  isLoading?: boolean
  preview?: string | null
  className?: string
}

export function ImageUpload({
  onUpload,
  onClear,
  isLoading = false,
  preview = null,
  className = '',
}: ImageUploadProps) {
  const [localPreview, setLocalPreview] = useState<string | null>(preview)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        
        // Create preview
        const reader = new FileReader()
        reader.onload = () => {
          setLocalPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
        
        onUpload(file)
      }
    },
    [onUpload]
  )

  const handleClear = () => {
    setLocalPreview(null)
    onClear?.()
  }

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isLoading,
  })

  // Show preview if available
  if (localPreview) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative rounded-xl overflow-hidden border-2 border-re-blue-200">
          <img
            src={localPreview}
            alt="Uploaded dream home"
            className="w-full h-48 object-cover"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Label */}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white text-sm font-medium">Your Dream Home</p>
            <p className="text-white/80 text-xs">Finding similar homes...</p>
          </div>
          
          {/* Clear button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-slate-700 rounded-full h-8 w-8"
            onClick={handleClear}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {/* Loading spinner */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all
        ${isDragActive 
          ? 'border-re-blue-500 bg-re-blue-50' 
          : isDragReject
          ? 'border-red-400 bg-red-50'
          : 'border-slate-300 hover:border-re-blue-400 hover:bg-slate-50'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center text-center">
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors
          ${isDragActive ? 'bg-re-blue-100 text-re-blue-600' : 'bg-slate-100 text-slate-400'}
        `}>
          {isDragActive ? (
            <Upload className="h-6 w-6" />
          ) : (
            <ImageIcon className="h-6 w-6" />
          )}
        </div>
        
        <p className="text-sm font-medium text-slate-700 mb-1">
          {isDragActive 
            ? 'Drop your photo here' 
            : 'Upload a dream home photo'
          }
        </p>
        
        <p className="text-xs text-slate-500">
          Drag & drop or click to browse
        </p>
        
        <p className="text-xs text-slate-400 mt-2">
          JPG, PNG, WebP up to 10MB
        </p>
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl">
          <Loader2 className="h-8 w-8 text-re-blue-600 animate-spin" />
        </div>
      )}
    </div>
  )
}

export default ImageUpload
