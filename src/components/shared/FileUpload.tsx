"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";

interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  onFileSelect: (file: File | null) => void;
  selectedFile?: File | null;
  isUploading?: boolean;
  className?: string;
}

export function FileUpload({
  accept = ".pdf,.doc,.docx,.ppt,.pptx",
  maxSizeMB = 10,
  label = "Upload File",
  onFileSelect,
  selectedFile,
  isUploading = false,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${maxSizeMB}MB`);
      return false;
    }
    return true;
  };

  const handleFileChange = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleRemove = () => {
    onFileSelect(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (selectedFile) {
    return (
      <div className={cn("flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100", className)}>
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
          {isUploading ? (
            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
          ) : (
            <FileText className="w-5 h-5 text-purple-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
          <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
        </div>
        {!isUploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          "flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
          dragOver
            ? "border-purple-400 bg-purple-50"
            : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
        )}
      >
        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
          <Upload className="w-5 h-5 text-purple-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            <span className="text-purple-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {accept.replace(/\./g, "").toUpperCase().replace(/,/g, ", ")} • Max {maxSizeMB}MB
          </p>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
