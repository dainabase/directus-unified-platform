"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Progress } from "../progress";
import { Card } from "../card";
import { 
  Upload, 
  File, 
  FileText, 
  Image, 
  Video, 
  Music,
  Archive,
  Code,
  X,
  Check,
  AlertCircle,
  Download,
  Eye,
  Trash2
} from "lucide-react";

// File type categories
const FILE_CATEGORIES = {
  image: ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp", "ico"],
  video: ["mp4", "avi", "mov", "wmv", "flv", "mkv", "webm"],
  audio: ["mp3", "wav", "ogg", "flac", "aac", "wma", "m4a"],
  document: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf"],
  archive: ["zip", "rar", "7z", "tar", "gz", "bz2"],
  code: ["js", "ts", "jsx", "tsx", "css", "html", "json", "xml", "py", "java"]
};

// Get file icon based on extension
const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  
  if (FILE_CATEGORIES.image.includes(ext)) return Image;
  if (FILE_CATEGORIES.video.includes(ext)) return Video;
  if (FILE_CATEGORIES.audio.includes(ext)) return Music;
  if (FILE_CATEGORIES.document.includes(ext)) return FileText;
  if (FILE_CATEGORIES.archive.includes(ext)) return Archive;
  if (FILE_CATEGORIES.code.includes(ext)) return Code;
  return File;
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// File upload status
export type FileUploadStatus = "idle" | "uploading" | "success" | "error";

// File item type
export interface FileItem {
  id: string;
  file: File;
  status: FileUploadStatus;
  progress: number;
  error?: string;
  preview?: string;
  uploaded?: boolean;
}

// Component props
export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  minSize?: number; // in bytes
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
  variant?: "default" | "compact" | "card";
  showPreview?: boolean;
  showProgress?: boolean;
  showFileList?: boolean;
  allowRemove?: boolean;
  allowRetry?: boolean;
  autoUpload?: boolean;
  chunked?: boolean;
  chunkSize?: number; // in bytes
  onUpload?: (files: FileItem[]) => Promise<void>;
  onChange?: (files: FileItem[]) => void;
  onRemove?: (file: FileItem) => void;
  onError?: (error: string, file?: FileItem) => void;
  validateFile?: (file: File) => string | null;
}

// Main FileUpload component
export const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      accept,
      multiple = false,
      maxFiles = 10,
      maxSize = 10 * 1024 * 1024, // 10MB default
      minSize = 0,
      disabled = false,
      label = "Upload files",
      description = "Drag and drop files here or click to browse",
      className,
      variant = "default",
      showPreview = true,
      showProgress = true,
      showFileList = true,
      allowRemove = true,
      allowRetry = true,
      autoUpload = false,
      chunked = false,
      chunkSize = 1024 * 1024, // 1MB chunks
      onUpload,
      onChange,
      onRemove,
      onError,
      validateFile,
    },
    ref
  ) => {
    const [files, setFiles] = React.useState<FileItem[]>([]);
    const [isDragActive, setIsDragActive] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const uploadAbortControllers = React.useRef<Map<string, AbortController>>(new Map());

    // Generate unique ID for file
    const generateFileId = (file: File): string => {
      return `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`;
    };

    // Validate single file
    const validateSingleFile = (file: File): string | null => {
      // Custom validation
      if (validateFile) {
        const customError = validateFile(file);
        if (customError) return customError;
      }

      // Size validation
      if (file.size > maxSize) {
        return `File size exceeds ${formatFileSize(maxSize)}`;
      }
      if (file.size < minSize) {
        return `File size is below ${formatFileSize(minSize)}`;
      }

      // Type validation
      if (accept) {
        const acceptedTypes = accept.split(",").map(t => t.trim());
        const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`;
        const fileType = file.type;
        
        const isAccepted = acceptedTypes.some(type => {
          if (type.startsWith(".")) {
            return fileExt === type.toLowerCase();
          }
          if (type.endsWith("/*")) {
            return fileType.startsWith(type.replace("/*", ""));
          }
          return fileType === type;
        });

        if (!isAccepted) {
          return `File type not accepted. Allowed: ${accept}`;
        }
      }

      return null;
    };

    // Create file preview
    const createPreview = (file: File): Promise<string | undefined> => {
      return new Promise((resolve) => {
        if (!showPreview) {
          resolve(undefined);
          return;
        }

        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        if (!FILE_CATEGORIES.image.includes(ext)) {
          resolve(undefined);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          resolve(undefined);
        };
        reader.readAsDataURL(file);
      });
    };

    // Process files
    const processFiles = async (fileList: FileList | File[]) => {
      const newFiles: FileItem[] = [];
      const filesArray = Array.from(fileList);

      // Check max files limit
      if (!multiple && filesArray.length > 1) {
        onError?.("Multiple files not allowed");
        return;
      }

      if (files.length + filesArray.length > maxFiles) {
        onError?.(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Process each file
      for (const file of filesArray) {
        const error = validateSingleFile(file);
        const preview = await createPreview(file);
        
        const fileItem: FileItem = {
          id: generateFileId(file),
          file,
          status: error ? "error" : "idle",
          progress: 0,
          error,
          preview,
          uploaded: false
        };

        newFiles.push(fileItem);
      }

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onChange?.(updatedFiles);

      // Auto upload if enabled
      if (autoUpload && onUpload) {
        const filesToUpload = newFiles.filter(f => f.status === "idle");
        if (filesToUpload.length > 0) {
          uploadFiles(filesToUpload);
        }
      }
    };

    // Upload files
    const uploadFiles = async (filesToUpload: FileItem[]) => {
      if (!onUpload) return;

      // Update status to uploading
      setFiles(prev => prev.map(f => 
        filesToUpload.find(uf => uf.id === f.id) 
          ? { ...f, status: "uploading" as FileUploadStatus }
          : f
      ));

      try {
        // Simulate upload with progress
        if (chunked) {
          // Chunked upload simulation
          for (const fileItem of filesToUpload) {
            const controller = new AbortController();
            uploadAbortControllers.current.set(fileItem.id, controller);

            const chunks = Math.ceil(fileItem.file.size / chunkSize);
            
            for (let i = 0; i < chunks; i++) {
              if (controller.signal.aborted) break;
              
              const progress = ((i + 1) / chunks) * 100;
              
              setFiles(prev => prev.map(f => 
                f.id === fileItem.id 
                  ? { ...f, progress }
                  : f
              ));

              // Simulate chunk upload delay
              await new Promise(resolve => setTimeout(resolve, 100));
            }

            if (!controller.signal.aborted) {
              setFiles(prev => prev.map(f => 
                f.id === fileItem.id 
                  ? { ...f, status: "success" as FileUploadStatus, progress: 100, uploaded: true }
                  : f
              ));
            }

            uploadAbortControllers.current.delete(fileItem.id);
          }
        } else {
          // Regular upload
          await onUpload(filesToUpload);
          
          setFiles(prev => prev.map(f => 
            filesToUpload.find(uf => uf.id === f.id)
              ? { ...f, status: "success" as FileUploadStatus, progress: 100, uploaded: true }
              : f
          ));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        
        setFiles(prev => prev.map(f => 
          filesToUpload.find(uf => uf.id === f.id)
            ? { ...f, status: "error" as FileUploadStatus, error: errorMessage }
            : f
        ));
        
        onError?.(errorMessage);
      }
    };

    // Handle file removal
    const handleRemove = (fileItem: FileItem) => {
      // Cancel upload if in progress
      const controller = uploadAbortControllers.current.get(fileItem.id);
      if (controller) {
        controller.abort();
        uploadAbortControllers.current.delete(fileItem.id);
      }

      const updatedFiles = files.filter(f => f.id !== fileItem.id);
      setFiles(updatedFiles);
      onChange?.(updatedFiles);
      onRemove?.(fileItem);
    };

    // Handle retry
    const handleRetry = (fileItem: FileItem) => {
      const updatedFile = { ...fileItem, status: "idle" as FileUploadStatus, progress: 0, error: undefined };
      setFiles(prev => prev.map(f => f.id === fileItem.id ? updatedFile : f));
      
      if (autoUpload && onUpload) {
        uploadFiles([updatedFile]);
      }
    };

    // Drag and drop handlers
    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragActive(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (disabled) return;

      const { files } = e.dataTransfer;
      if (files && files.length > 0) {
        processFiles(files);
      }
    };

    // File input change handler
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;
      if (files && files.length > 0) {
        processFiles(files);
      }
      // Reset input
      e.target.value = "";
    };

    // Click handler
    const handleClick = () => {
      if (!disabled) {
        fileInputRef.current?.click();
      }
    };

    // Upload all pending files
    const uploadPendingFiles = () => {
      const pendingFiles = files.filter(f => f.status === "idle");
      if (pendingFiles.length > 0 && onUpload) {
        uploadFiles(pendingFiles);
      }
    };

    // Render upload area
    const renderUploadArea = () => {
      const baseClasses = cn(
        "relative transition-all",
        disabled && "opacity-50 cursor-not-allowed"
      );

      if (variant === "compact") {
        return (
          <Button
            type="button"
            variant={isDragActive ? "secondary" : "outline"}
            disabled={disabled}
            onClick={handleClick}
            className={cn(baseClasses, className)}
          >
            <Upload className="mr-2 h-4 w-4" />
            {label}
          </Button>
        );
      }

      if (variant === "card") {
        return (
          <Card
            className={cn(
              baseClasses,
              "p-6 cursor-pointer hover:bg-muted/50",
              isDragActive && "bg-muted border-primary",
              className
            )}
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <Upload className={cn(
                "h-10 w-10 mb-4 text-muted-foreground",
                isDragActive && "text-primary"
              )} />
              <p className="text-sm font-medium mb-1">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
              {accept && (
                <p className="text-xs text-muted-foreground mt-2">
                  Accepted: {accept}
                </p>
              )}
              {maxSize && (
                <p className="text-xs text-muted-foreground">
                  Max size: {formatFileSize(maxSize)}
                </p>
              )}
            </div>
          </Card>
        );
      }

      // Default variant
      return (
        <div
          className={cn(
            baseClasses,
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer",
            "hover:border-primary/50 hover:bg-muted/50",
            isDragActive && "border-primary bg-muted",
            className
          )}
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className={cn(
            "mx-auto h-12 w-12 mb-4 text-muted-foreground",
            isDragActive && "text-primary"
          )} />
          <p className="text-sm font-medium mb-1">{label}</p>
          <p className="text-xs text-muted-foreground mb-4">{description}</p>
          <Button type="button" variant="secondary" disabled={disabled}>
            Browse Files
          </Button>
          <div className="mt-4 text-xs text-muted-foreground">
            {accept && <p>Accepted: {accept}</p>}
            {maxSize && <p>Max size: {formatFileSize(maxSize)}</p>}
            {multiple && maxFiles && <p>Max files: {maxFiles}</p>}
          </div>
        </div>
      );
    };

    // Render file list
    const renderFileList = () => {
      if (!showFileList || files.length === 0) return null;

      return (
        <div className="mt-4 space-y-2">
          {files.map(fileItem => {
            const FileIcon = getFileIcon(fileItem.file.name);
            const isImage = showPreview && fileItem.preview;

            return (
              <div
                key={fileItem.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  fileItem.status === "error" && "border-destructive/50 bg-destructive/10",
                  fileItem.status === "success" && "border-green-500/50 bg-green-500/10"
                )}
              >
                {/* Preview or icon */}
                {isImage ? (
                  <img
                    src={fileItem.preview}
                    alt={fileItem.file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <FileIcon className="h-10 w-10 text-muted-foreground shrink-0" />
                )}

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(fileItem.file.size)}
                    {fileItem.status === "uploading" && ` • ${Math.round(fileItem.progress)}%`}
                    {fileItem.status === "error" && ` • ${fileItem.error}`}
                  </p>

                  {/* Progress bar */}
                  {showProgress && fileItem.status === "uploading" && (
                    <Progress value={fileItem.progress} className="h-1 mt-1" />
                  )}
                </div>

                {/* Status icon */}
                {fileItem.status === "success" && (
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                )}
                {fileItem.status === "error" && (
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                )}

                {/* Actions */}
                <div className="flex gap-1">
                  {allowRetry && fileItem.status === "error" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRetry(fileItem)}
                      className="h-8 w-8 p-0"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  )}
                  {allowRemove && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(fileItem)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Upload all button */}
          {!autoUpload && onUpload && files.some(f => f.status === "idle") && (
            <Button
              type="button"
              onClick={uploadPendingFiles}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload {files.filter(f => f.status === "idle").length} file(s)
            </Button>
          )}
        </div>
      );
    };

    return (
      <div ref={ref}>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileInputChange}
          className="hidden"
          aria-label={label}
        />
        
        {renderUploadArea()}
        {renderFileList()}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";

export default FileUpload;
