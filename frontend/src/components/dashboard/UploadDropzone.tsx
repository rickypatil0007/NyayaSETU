import { useState, useRef } from 'react'
import { UploadCloud, FileType2, AlertCircle } from 'lucide-react'

interface UploadDropzoneProps {
  onUpload: (file: File) => void
}

export default function UploadDropzone({ onUpload }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const validateAndUpload = (file: File) => {
    setError(null)
    onUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0])
    }
  }

  return (
    <div className="w-full">
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-white/10 hover:border-white/20 bg-black/50 hover:bg-black/80'
        }`}
      >
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDragging ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted'}`}>
            <UploadCloud className="w-8 h-8" />
          </div>
        </div>
        
        <h3 className="text-xl font-medium text-white mb-2">Upload Document</h3>
        <p className="text-muted text-sm mb-8 max-w-sm mx-auto">
          Drag & drop your contract or regulatory document here, or click to browse files.
        </p>

        <div className="flex items-center justify-center gap-6 text-sm text-muted mb-8">
          <div className="flex items-center gap-2">
            <FileType2 className="w-4 h-4 text-red-400" />
            PDF
          </div>
          <div className="flex items-center gap-2">
            <FileType2 className="w-4 h-4 text-blue-400" />
            DOCX
          </div>
          <div className="flex items-center gap-2">
            <FileType2 className="w-4 h-4 text-gray-400" />
            TXT
          </div>
        </div>

        <button className="bg-white/5 hover:bg-white/10 text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors border border-white/10">
          Upload Document
        </button>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleChange}
          accept=".pdf,.docx,.txt"
          className="hidden" 
        />
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      
      <p className="text-center text-xs text-muted mt-6">
        Maximum file size: 20 MB. All documents are securely processed and encrypted.
      </p>
    </div>
  )
}
