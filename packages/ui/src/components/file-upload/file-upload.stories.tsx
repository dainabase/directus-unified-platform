import type { Meta, StoryObj } from "@storybook/react";
import { FileUpload, FileItem } from "./file-upload";
import { useState } from "react";

const meta = {
  title: "Components/Forms/FileUpload",
  component: FileUpload,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A comprehensive file upload component with drag-and-drop, preview, progress tracking, and chunked upload support.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    accept: {
      control: "text",
      description: "Accepted file types",
    },
    multiple: {
      control: "boolean",
      description: "Allow multiple file selection",
    },
    maxFiles: {
      control: "number",
      description: "Maximum number of files",
    },
    maxSize: {
      control: "number",
      description: "Maximum file size in bytes",
    },
    minSize: {
      control: "number",
      description: "Minimum file size in bytes",
    },
    variant: {
      control: "select",
      options: ["default", "compact", "card"],
      description: "Visual variant of the upload area",
    },
    showPreview: {
      control: "boolean",
      description: "Show image previews",
    },
    showProgress: {
      control: "boolean",
      description: "Show upload progress bars",
    },
    showFileList: {
      control: "boolean",
      description: "Show uploaded files list",
    },
    allowRemove: {
      control: "boolean",
      description: "Allow file removal",
    },
    allowRetry: {
      control: "boolean",
      description: "Allow retry on failed uploads",
    },
    autoUpload: {
      control: "boolean",
      description: "Automatically upload files on selection",
    },
    chunked: {
      control: "boolean",
      description: "Enable chunked upload",
    },
    disabled: {
      control: "boolean",
      description: "Disable the upload component",
    },
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock upload function
const mockUpload = (files: FileItem[]): Promise<void> => {
  return new Promise((resolve) => {
    // Simulate upload delay
    setTimeout(() => {
      console.log("Uploaded files:", files);
      resolve();
    }, 2000);
  });
};

// Default story
export const Default: Story = {
  args: {
    label: "Upload files",
    description: "Drag and drop files here or click to browse",
    accept: "image/*,.pdf",
    maxSize: 10 * 1024 * 1024, // 10MB
  },
};

// Controlled component
export const Controlled: Story = {
  render: (args) => {
    const [files, setFiles] = useState<FileItem[]>([]);
    
    return (
      <div className="w-full max-w-2xl space-y-4">
        <FileUpload
          {...args}
          onChange={setFiles}
          onUpload={mockUpload}
        />
        
        {files.length > 0 && (
          <div className="p-4 border rounded">
            <h4 className="text-sm font-medium mb-2">Selected Files ({files.length})</h4>
            <ul className="text-sm space-y-1">
              {files.map((file) => (
                <li key={file.id} className="flex justify-between">
                  <span>{file.file.name}</span>
                  <span className="text-muted-foreground">{file.status}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
  args: {
    multiple: true,
    showFileList: true,
  },
};

// Single file upload
export const SingleFile: Story = {
  args: {
    multiple: false,
    label: "Upload single file",
    description: "Only one file allowed",
  },
};

// Multiple files
export const MultipleFiles: Story = {
  args: {
    multiple: true,
    maxFiles: 5,
    label: "Upload multiple files",
    description: "Maximum 5 files allowed",
  },
};

// Image upload with preview
export const ImageUpload: Story = {
  args: {
    accept: "image/*",
    showPreview: true,
    label: "Upload images",
    description: "JPG, PNG, GIF, SVG accepted",
  },
};

// Document upload
export const DocumentUpload: Story = {
  args: {
    accept: ".pdf,.doc,.docx,.xls,.xlsx",
    label: "Upload documents",
    description: "PDF, Word, Excel files accepted",
  },
};

// Video upload
export const VideoUpload: Story = {
  args: {
    accept: "video/*",
    maxSize: 100 * 1024 * 1024, // 100MB
    label: "Upload videos",
    description: "Maximum file size: 100MB",
  },
};

// Compact variant
export const CompactVariant: Story = {
  args: {
    variant: "compact",
    multiple: true,
  },
};

// Card variant
export const CardVariant: Story = {
  args: {
    variant: "card",
    label: "Drop files here",
    description: "Or click to browse",
  },
};

// With file size limits
export const WithSizeLimits: Story = {
  args: {
    minSize: 1024, // 1KB minimum
    maxSize: 5 * 1024 * 1024, // 5MB maximum
    label: "Upload with size limits",
    description: "Files must be between 1KB and 5MB",
  },
};

// Auto upload
export const AutoUpload: Story = {
  args: {
    autoUpload: true,
    onUpload: mockUpload,
    label: "Auto upload",
    description: "Files upload automatically on selection",
  },
};

// Manual upload
export const ManualUpload: Story = {
  args: {
    autoUpload: false,
    onUpload: mockUpload,
    label: "Manual upload",
    description: "Click upload button after selecting files",
  },
};

// Chunked upload
export const ChunkedUpload: Story = {
  args: {
    chunked: true,
    chunkSize: 1024 * 1024, // 1MB chunks
    onUpload: mockUpload,
    label: "Chunked upload",
    description: "Files uploaded in 1MB chunks",
  },
};

// Without file list
export const NoFileList: Story = {
  args: {
    showFileList: false,
    label: "Upload without list",
    description: "File list hidden",
  },
};

// Without preview
export const NoPreview: Story = {
  args: {
    accept: "image/*",
    showPreview: false,
    label: "Images without preview",
    description: "Preview disabled",
  },
};

// Without progress
export const NoProgress: Story = {
  args: {
    showProgress: false,
    onUpload: mockUpload,
    label: "Upload without progress",
    description: "Progress bars hidden",
  },
};

// No remove button
export const NoRemove: Story = {
  args: {
    allowRemove: false,
    label: "Cannot remove files",
    description: "Files cannot be removed once added",
  },
};

// No retry button
export const NoRetry: Story = {
  args: {
    allowRetry: false,
    onUpload: mockUpload,
    label: "Cannot retry failed uploads",
    description: "Retry disabled for failed uploads",
  },
};

// Custom validation
export const CustomValidation: Story = {
  args: {
    validateFile: (file: File) => {
      // Custom validation: only accept files with specific naming pattern
      if (!file.name.match(/^[A-Z]{3}-\d{4}/)) {
        return "File name must match pattern: XXX-0000";
      }
      return null;
    },
    label: "Custom validation",
    description: "File names must match pattern: XXX-0000",
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    disabled: true,
    label: "Disabled upload",
    description: "Upload is disabled",
  },
};

// Complete example
export const CompleteExample: Story = {
  render: () => {
    const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (files: FileItem[]) => {
      setIsUploading(true);
      
      // Simulate upload with progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        // Update progress (would be done via state updates in real app)
      }
      
      setIsUploading(false);
      setUploadedFiles(prev => [...prev, ...files]);
    };

    return (
      <div className="w-full max-w-3xl space-y-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">File Upload System</h3>
          
          <FileUpload
            multiple
            maxFiles={10}
            maxSize={50 * 1024 * 1024} // 50MB
            accept="image/*,.pdf,.doc,.docx"
            showPreview
            showProgress
            showFileList
            autoUpload={false}
            onUpload={handleUpload}
            label="Upload your files"
            description="Images, PDFs, and documents accepted (max 50MB each)"
          />
          
          {isUploading && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Uploading files...
              </p>
            </div>
          )}
          
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">
                Successfully Uploaded ({uploadedFiles.length})
              </h4>
              <ul className="text-sm space-y-1">
                {uploadedFiles.map((file) => (
                  <li key={file.id} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>{file.file.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  },
};

// Drag and drop demo
export const DragDropDemo: Story = {
  render: () => {
    const [draggedFiles, setDraggedFiles] = useState<string[]>([]);

    return (
      <div className="w-full max-w-2xl space-y-4">
        <div className="p-4 border rounded bg-muted">
          <p className="text-sm text-muted-foreground mb-2">
            Try dragging files from your desktop onto the upload area below
          </p>
        </div>
        
        <FileUpload
          multiple
          onChange={(files) => {
            setDraggedFiles(files.map(f => f.file.name));
          }}
          label="Drag files here"
          description="Watch the area change when you drag files over it"
        />
        
        {draggedFiles.length > 0 && (
          <div className="p-4 border rounded">
            <h4 className="text-sm font-medium mb-2">Files dropped:</h4>
            <ul className="text-sm list-disc list-inside">
              {draggedFiles.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => {
    return (
      <div className="space-y-8 w-full max-w-3xl">
        <div>
          <h3 className="text-lg font-semibold mb-4">Default Variant</h3>
          <FileUpload
            variant="default"
            label="Default upload area"
            description="Full-sized upload area with all features"
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Compact Variant</h3>
          <FileUpload
            variant="compact"
            label="Choose files"
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Card Variant</h3>
          <FileUpload
            variant="card"
            label="Upload documents"
            description="Click or drag files here"
          />
        </div>
      </div>
    );
  },
};
