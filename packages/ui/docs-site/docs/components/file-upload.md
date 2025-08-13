---
id: file-upload
title: File Upload
sidebar_position: 38
---

import { FileUpload } from '@dainabase/ui';

The FileUpload component provides a comprehensive solution for file uploads with drag-and-drop support, progress tracking, validation, and preview capabilities. Perfect for forms, media galleries, document management, and any application requiring file handling.

## Preview

```jsx live
function FileUploadDemo() {
  const [files, setFiles] = useState([]);
  
  const handleUpload = (uploadedFiles) => {
    setFiles(uploadedFiles);
  };
  
  return (
    <div className="space-y-4 w-full max-w-md">
      <FileUpload
        onUpload={handleUpload}
        accept="image/*,application/pdf"
        maxSize={5 * 1024 * 1024} // 5MB
        multiple
      />
      {files.length > 0 && (
        <div className="text-sm">
          <p>Uploaded {files.length} file(s)</p>
        </div>
      )}
    </div>
  );
}
```

## Features

- 🎯 **Drag & Drop** - Intuitive drag-and-drop interface
- 📁 **Multiple Files** - Support for single or multiple file uploads
- 📊 **Progress Tracking** - Real-time upload progress indicators
- 👁️ **File Preview** - Image thumbnails and file type icons
- ✅ **Validation** - File type, size, and custom validation
- 🔄 **Resumable Uploads** - Support for chunked and resumable uploads
- 📱 **Mobile Optimized** - Native file picker on mobile devices
- ♿ **Accessible** - Full keyboard and screen reader support
- 🎨 **Customizable** - Flexible styling and theming options
- ⚡ **Performance** - Optimized for large files and batch uploads

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```jsx
import { FileUpload } from '@dainabase/ui';

function App() {
  const handleFileUpload = (files) => {
    console.log('Files uploaded:', files);
  };
  
  return (
    <FileUpload
      onUpload={handleFileUpload}
      accept="image/*"
      maxSize={10 * 1024 * 1024} // 10MB
    />
  );
}
```

## Examples

### Image Upload with Preview

```jsx
function ImageUploadExample() {
  const [images, setImages] = useState([]);
  
  const handleImageUpload = (files) => {
    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));
    setImages(prev => [...prev, ...newImages]);
  };
  
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-4">
      <FileUpload
        onUpload={handleImageUpload}
        accept="image/*"
        maxSize={5 * 1024 * 1024}
        multiple
        maxFiles={5}
      />
      
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-32 object-cover rounded"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
              <p className="text-xs mt-1 truncate">{image.name}</p>
              <p className="text-xs text-gray-500">
                {(image.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Document Upload with Validation

```jsx
function DocumentUploadExample() {
  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState([]);
  
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const validateFile = (file) => {
    const errors = [];
    
    if (!allowedTypes.includes(file.type)) {
      errors.push(`${file.name}: Invalid file type`);
    }
    
    if (file.size > 10 * 1024 * 1024) {
      errors.push(`${file.name}: File size exceeds 10MB`);
    }
    
    return errors;
  };
  
  const handleUpload = (files) => {
    const validationErrors = [];
    const validFiles = [];
    
    files.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        validationErrors.push(...fileErrors);
      } else {
        validFiles.push(file);
      }
    });
    
    setErrors(validationErrors);
    if (validFiles.length > 0) {
      setDocuments(prev => [...prev, ...validFiles]);
    }
  };
  
  return (
    <div className="space-y-4">
      <FileUpload
        onUpload={handleUpload}
        accept=".pdf,.doc,.docx,.xls,.xlsx"
        maxSize={10 * 1024 * 1024}
        multiple
        placeholder="Drop documents here or click to browse"
      />
      
      {errors.length > 0 && (
        <div className="p-3 bg-red-50 rounded">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">{error}</p>
          ))}
        </div>
      )}
      
      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploaded Documents:</h4>
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-gray-500">
                    {(doc.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDocuments(prev => prev.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Drag and Drop Zone

```jsx
function DragDropZoneExample() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  return (
    <FileUpload
      onUpload={(files) => setUploadedFiles(files)}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={() => setIsDragging(false)}
      multiple
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-all
        ${isDragging 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
        }
      `}
    >
      <div className="space-y-4">
        <div className="text-6xl">
          {isDragging ? '📥' : '📁'}
        </div>
        <div>
          <p className="text-lg font-medium">
            {isDragging ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-gray-500">
            or click to browse your computer
          </p>
        </div>
        {uploadedFiles.length > 0 && (
          <p className="text-sm text-green-600">
            {uploadedFiles.length} file(s) uploaded successfully
          </p>
        )}
      </div>
    </FileUpload>
  );
}
```

### Upload with Progress

```jsx
function UploadProgressExample() {
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  const simulateUpload = async (file) => {
    const fileId = file.name + Date.now();
    
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { name: file.name, progress, status: 'uploading' }
      }));
    }
    
    // Mark as complete
    setUploadProgress(prev => ({
      ...prev,
      [fileId]: { name: file.name, progress: 100, status: 'complete' }
    }));
    
    setUploadedFiles(prev => [...prev, file]);
  };
  
  const handleUpload = async (files) => {
    for (const file of files) {
      await simulateUpload(file);
    }
  };
  
  return (
    <div className="space-y-4">
      <FileUpload
        onUpload={handleUpload}
        multiple
        maxFiles={5}
      />
      
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([id, file]) => (
            <div key={id} className="bg-gray-50 rounded p-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{file.name}</span>
                <span className={
                  file.status === 'complete' ? 'text-green-600' : 'text-blue-600'
                }>
                  {file.status === 'complete' ? '✓ Complete' : `${file.progress}%`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    file.status === 'complete' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${file.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Avatar Upload

```jsx
function AvatarUploadExample() {
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAvatarUpload = async (files) => {
    if (files.length === 0) return;
    
    setIsLoading(true);
    const file = files[0];
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatar(e.target.result);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <div className="flex items-center space-x-6">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
          {avatar ? (
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-4xl">👤</span>
            </div>
          )}
        </div>
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <FileUpload
          onUpload={handleAvatarUpload}
          accept="image/*"
          maxSize={2 * 1024 * 1024}
          single
          className="inline-block"
        >
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {avatar ? 'Change Photo' : 'Upload Photo'}
          </button>
        </FileUpload>
        <p className="text-xs text-gray-500">
          JPG, PNG or GIF. Max size 2MB.
        </p>
      </div>
    </div>
  );
}
```

### CSV File Import

```jsx
function CSVImportExample() {
  const [csvData, setCsvData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState(null);
  
  const parseCSV = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',');
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index]?.trim() || '';
            });
            return row;
          });
        
        setColumns(headers);
        setCsvData(data);
        setError(null);
      } catch (err) {
        setError('Failed to parse CSV file');
        setCsvData([]);
        setColumns([]);
      }
    };
    
    reader.readAsText(file);
  };
  
  const handleCSVUpload = (files) => {
    if (files.length > 0) {
      parseCSV(files[0]);
    }
  };
  
  return (
    <div className="space-y-4">
      <FileUpload
        onUpload={handleCSVUpload}
        accept=".csv"
        single
        placeholder="Drop CSV file here or click to browse"
      />
      
      {error && (
        <div className="p-3 bg-red-50 rounded">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {csvData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-50">
                {columns.map((col, index) => (
                  <th key={index} className="border px-4 py-2 text-left text-sm font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.slice(0, 5).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="border px-4 py-2 text-sm">
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {csvData.length > 5 && (
            <p className="text-sm text-gray-500 mt-2">
              Showing 5 of {csvData.length} rows
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

### Chunked Upload

```jsx
function ChunkedUploadExample() {
  const [uploadStatus, setUploadStatus] = useState({});
  const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
  
  const uploadChunk = async (file, chunk, chunkIndex, totalChunks) => {
    // Simulate chunk upload
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUploadStatus(prev => ({
      ...prev,
      [file.name]: {
        chunksUploaded: chunkIndex + 1,
        totalChunks,
        progress: Math.round(((chunkIndex + 1) / totalChunks) * 100)
      }
    }));
  };
  
  const handleChunkedUpload = async (files) => {
    for (const file of files) {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        
        await uploadChunk(file, chunk, i, totalChunks);
      }
      
      setUploadStatus(prev => ({
        ...prev,
        [file.name]: {
          ...prev[file.name],
          complete: true
        }
      }));
    }
  };
  
  return (
    <div className="space-y-4">
      <FileUpload
        onUpload={handleChunkedUpload}
        maxSize={100 * 1024 * 1024} // 100MB
        multiple
      />
      
      {Object.keys(uploadStatus).length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Upload Status:</h4>
          {Object.entries(uploadStatus).map(([filename, status]) => (
            <div key={filename} className="bg-gray-50 rounded p-3">
              <div className="flex justify-between text-sm mb-1">
                <span>{filename}</span>
                <span>
                  {status.complete 
                    ? '✓ Complete' 
                    : `Chunk ${status.chunksUploaded}/${status.totalChunks}`
                  }
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    status.complete ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${status.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Gallery Upload

```jsx
function GalleryUploadExample() {
  const [gallery, setGallery] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const handleGalleryUpload = (files) => {
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      uploadDate: new Date()
    }));
    setGallery(prev => [...prev, ...newImages]);
  };
  
  const deleteImage = (id) => {
    setGallery(prev => prev.filter(img => img.id !== id));
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
  };
  
  return (
    <div className="space-y-4">
      <FileUpload
        onUpload={handleGalleryUpload}
        accept="image/*"
        multiple
        maxFiles={20}
        maxSize={10 * 1024 * 1024}
      />
      
      {gallery.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Gallery ({gallery.length} images)</h4>
            <button
              onClick={() => setGallery([])}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {gallery.map((image) => (
              <div
                key={image.id}
                className="relative group cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-24 object-cover rounded"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteImage(image.id);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded text-xs opacity-0 group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setSelectedImage(null)}>
          <div className="max-w-4xl max-h-full p-4">
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="max-w-full max-h-full object-contain"
            />
            <p className="text-white text-center mt-2">{selectedImage.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Form with File Attachments

```jsx
function FormWithAttachmentsExample() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    attachments: []
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };
  
  const handleFileUpload = (files) => {
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };
  
  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border rounded"
          rows={4}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Attachments</label>
        <FileUpload
          onUpload={handleFileUpload}
          multiple
          maxFiles={5}
          maxSize={5 * 1024 * 1024}
          accept=".pdf,.doc,.docx,.jpg,.png"
        />
        
        {formData.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {formData.attachments.map((file, index) => (
              <div key={index} className="flex justify-between items-center text-sm bg-gray-50 px-2 py-1 rounded">
                <span>{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Submit Form
      </button>
    </form>
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onUpload` | `(files: File[]) => void` | `undefined` | Callback when files are uploaded |
| `onChange` | `(files: File[]) => void` | `undefined` | Callback when file selection changes |
| `accept` | `string` | `'*'` | Accepted file types |
| `multiple` | `boolean` | `false` | Allow multiple file selection |
| `single` | `boolean` | `false` | Restrict to single file |
| `maxFiles` | `number` | `undefined` | Maximum number of files |
| `maxSize` | `number` | `undefined` | Maximum file size in bytes |
| `minSize` | `number` | `undefined` | Minimum file size in bytes |
| `disabled` | `boolean` | `false` | Disable the upload |
| `required` | `boolean` | `false` | Mark as required field |
| `placeholder` | `string` | `'Drop files here or click to upload'` | Placeholder text |
| `dragActiveText` | `string` | `'Drop files here'` | Text when dragging |
| `validator` | `(file: File) => boolean \| string` | `undefined` | Custom validation function |
| `onDragEnter` | `() => void` | `undefined` | Drag enter callback |
| `onDragLeave` | `() => void` | `undefined` | Drag leave callback |
| `onDrop` | `(files: File[]) => void` | `undefined` | Drop callback |
| `onError` | `(error: Error) => void` | `undefined` | Error callback |
| `onProgress` | `(progress: number) => void` | `undefined` | Upload progress callback |
| `showPreview` | `boolean` | `true` | Show file previews |
| `showSize` | `boolean` | `true` | Show file sizes |
| `showRemove` | `boolean` | `true` | Show remove buttons |
| `className` | `string` | `''` | Container CSS classes |
| `dropzoneClassName` | `string` | `''` | Dropzone CSS classes |
| `previewClassName` | `string` | `''` | Preview container CSS classes |
| `children` | `ReactNode` | `undefined` | Custom upload trigger |
| `autoUpload` | `boolean` | `true` | Auto-upload on selection |
| `uploadUrl` | `string` | `undefined` | Server upload endpoint |
| `headers` | `object` | `{}` | HTTP headers for upload |
| `withCredentials` | `boolean` | `false` | Include credentials in request |
| `method` | `'POST' \| 'PUT'` | `'POST'` | HTTP method for upload |
| `fieldName` | `string` | `'file'` | Form field name |

## Accessibility

The FileUpload component follows WCAG 2.1 Level AA guidelines:

- **Keyboard Navigation**: Full keyboard support with Tab and Enter
- **Screen Readers**: Proper ARIA labels and status announcements
- **Focus Management**: Clear focus indicators
- **Progress Announcements**: Upload progress announced to screen readers
- **Error Announcements**: Validation errors clearly announced
- **Drag & Drop Alternative**: Always provides click alternative
- **Mobile Support**: Touch-optimized file selection
- **Status Updates**: Live regions for status changes

```jsx
// Accessible implementation
<div role="group" aria-labelledby="upload-label">
  <label id="upload-label">
    Upload Documents
  </label>
  <FileUpload
    aria-label="Document upload"
    aria-describedby="upload-help upload-error"
    aria-required="true"
    required
  />
  <span id="upload-help" className="text-sm text-gray-600">
    PDF, DOC, or DOCX files up to 10MB
  </span>
  {error && (
    <span id="upload-error" role="alert" className="text-red-600">
      {error}
    </span>
  )}
</div>
```

## Best Practices

### Do's ✅

- **Do** validate files on both client and server
- **Do** show clear file requirements
- **Do** provide progress feedback
- **Do** handle errors gracefully
- **Do** support keyboard navigation
- **Do** optimize for mobile devices
- **Do** compress images before upload
- **Do** implement virus scanning on server

### Don'ts ❌

- **Don't** allow unrestricted file types
- **Don't** trust client-side validation alone
- **Don't** upload without user confirmation
- **Don't** block the UI during upload
- **Don't** lose upload progress on error
- **Don't** forget to clean up object URLs
- **Don't** allow unlimited file sizes
- **Don't** expose sensitive upload paths

## Use Cases

1. **Profile Pictures**: Avatar and profile image uploads
2. **Document Management**: PDF, Word, Excel file uploads
3. **Media Galleries**: Image and video collections
4. **Form Attachments**: Supporting documents for applications
5. **Data Import**: CSV, JSON, XML file imports
6. **Content Creation**: Blog images, article attachments
7. **E-commerce**: Product images, variant photos
8. **Support Tickets**: Screenshots and log file uploads

## Related Components

- [Button](./button) - Upload trigger buttons
- [Progress](./progress) - Upload progress indicators
- [Alert](./alert) - Error and success messages
- [Form](./form) - Form integration
- [Dialog](./dialog) - Upload confirmations
- [Avatar](./avatar) - Profile picture display