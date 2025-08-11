import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle
} from 'react';
import {
  Camera,
  Crop,
  Download,
  FlipHorizontal,
  FlipVertical,
  Grid3x3,
  Image as ImageIcon,
  Loader2,
  Move,
  Palette,
  RotateCw,
  RotateCcw,
  Save,
  Sliders,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Star,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  X,
  Check,
  Upload,
  Sun,
  Moon,
  Droplet,
  Contrast,
  Sparkles,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  RefreshCw,
  Copy,
  Clipboard,
  Scissors
} from 'lucide-react';
import { cn } from '../utils/cn';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type CropShape = 'rect' | 'circle' | 'triangle' | 'hexagon' | 'star' | 'custom';
export type ExportFormat = 'jpeg' | 'png' | 'webp' | 'base64' | 'blob';
export type FilterType = 'none' | 'grayscale' | 'sepia' | 'blur' | 'sharpen' | 'brightness' | 'contrast' | 'saturate' | 'invert' | 'hueRotate';
export type AspectRatio = 'free' | '16:9' | '4:3' | '1:1' | '9:16' | '3:4' | 'custom';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Transform {
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  zoom: number;
}

interface Filter {
  type: FilterType;
  value: number;
}

interface HistoryState {
  cropArea: CropArea;
  transform: Transform;
  filters: Filter[];
  timestamp: number;
}

interface ImageCropperProps {
  src?: string;
  defaultCrop?: CropArea;
  defaultTransform?: Partial<Transform>;
  defaultFilters?: Filter[];
  cropShape?: CropShape;
  aspectRatio?: AspectRatio;
  customAspectRatio?: number;
  minCropWidth?: number;
  minCropHeight?: number;
  maxZoom?: number;
  minZoom?: number;
  zoomStep?: number;
  rotationStep?: number;
  quality?: number;
  showGrid?: boolean;
  showPreview?: boolean;
  showToolbar?: boolean;
  showSidebar?: boolean;
  enableTouch?: boolean;
  enableKeyboard?: boolean;
  enableHistory?: boolean;
  maxHistorySize?: number;
  autoSave?: boolean;
  autoSaveInterval?: number;
  onCropStart?: (area: CropArea) => void;
  onCropChange?: (area: CropArea) => void;
  onCropEnd?: (area: CropArea) => void;
  onTransformChange?: (transform: Transform) => void;
  onFilterChange?: (filters: Filter[]) => void;
  onSave?: (data: string | Blob, format: ExportFormat) => void;
  onError?: (error: Error) => void;
  onImageLoad?: (image: HTMLImageElement) => void;
  className?: string;
  toolbarClassName?: string;
  sidebarClassName?: string;
  canvasClassName?: string;
  previewClassName?: string;
  disabled?: boolean;
  readOnly?: boolean;
  allowUpload?: boolean;
  acceptedFormats?: string[];
  maxFileSize?: number;
  watermark?: {
    text?: string;
    image?: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity?: number;
  };
}

export interface ImageCropperRef {
  crop: () => void;
  reset: () => void;
  export: (format: ExportFormat) => Promise<string | Blob>;
  undo: () => void;
  redo: () => void;
  rotate: (angle: number) => void;
  zoom: (level: number) => void;
  flip: (axis: 'x' | 'y') => void;
  applyFilter: (filter: Filter) => void;
  clearFilters: () => void;
  getState: () => {
    cropArea: CropArea;
    transform: Transform;
    filters: Filter[];
  };
  setState: (state: Partial<{
    cropArea: CropArea;
    transform: Transform;
    filters: Filter[];
  }>) => void;
}

// ============================================================================
// Utility Functions
// ============================================================================

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const applyFiltersToCanvas = (
  ctx: CanvasRenderingContext2D,
  filters: Filter[]
): void => {
  const filterString = filters
    .map(filter => {
      switch (filter.type) {
        case 'grayscale':
          return `grayscale(${filter.value}%)`;
        case 'sepia':
          return `sepia(${filter.value}%)`;
        case 'blur':
          return `blur(${filter.value}px)`;
        case 'brightness':
          return `brightness(${filter.value}%)`;
        case 'contrast':
          return `contrast(${filter.value}%)`;
        case 'saturate':
          return `saturate(${filter.value}%)`;
        case 'invert':
          return `invert(${filter.value}%)`;
        case 'hueRotate':
          return `hue-rotate(${filter.value}deg)`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join(' ');
  
  ctx.filter = filterString;
};

const drawCropShape = (
  ctx: CanvasRenderingContext2D,
  shape: CropShape,
  x: number,
  y: number,
  width: number,
  height: number
): void => {
  ctx.beginPath();
  
  switch (shape) {
    case 'circle':
      ctx.arc(x + width / 2, y + height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI);
      break;
    case 'triangle':
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x + width, y + height);
      ctx.closePath();
      break;
    case 'hexagon':
      const size = Math.min(width, height) / 2;
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = centerX + size * Math.cos(angle);
        const py = centerY + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    case 'star':
      const spikes = 5;
      const outerRadius = Math.min(width, height) / 2;
      const innerRadius = outerRadius / 2;
      const cx = x + width / 2;
      const cy = y + height / 2;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
        rot += step;
        ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      break;
    default:
      ctx.rect(x, y, width, height);
  }
};

const calculateAspectRatio = (ratio: AspectRatio, custom?: number): number | null => {
  switch (ratio) {
    case '16:9':
      return 16 / 9;
    case '4:3':
      return 4 / 3;
    case '1:1':
      return 1;
    case '9:16':
      return 9 / 16;
    case '3:4':
      return 3 / 4;
    case 'custom':
      return custom || null;
    default:
      return null;
  }
};

// ============================================================================
// Main Component
// ============================================================================

export const ImageCropper = forwardRef<ImageCropperRef, ImageCropperProps>(
  (
    {
      src,
      defaultCrop,
      defaultTransform,
      defaultFilters = [],
      cropShape = 'rect',
      aspectRatio = 'free',
      customAspectRatio,
      minCropWidth = 50,
      minCropHeight = 50,
      maxZoom = 5,
      minZoom = 0.1,
      zoomStep = 0.1,
      rotationStep = 90,
      quality = 0.92,
      showGrid = true,
      showPreview = true,
      showToolbar = true,
      showSidebar = true,
      enableTouch = true,
      enableKeyboard = true,
      enableHistory = true,
      maxHistorySize = 20,
      autoSave = false,
      autoSaveInterval = 30000,
      onCropStart,
      onCropChange,
      onCropEnd,
      onTransformChange,
      onFilterChange,
      onSave,
      onError,
      onImageLoad,
      className,
      toolbarClassName,
      sidebarClassName,
      canvasClassName,
      previewClassName,
      disabled = false,
      readOnly = false,
      allowUpload = true,
      acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      maxFileSize = 10 * 1024 * 1024, // 10MB
      watermark
    },
    ref
  ) => {
    // State
    const [imageSrc, setImageSrc] = useState<string | undefined>(src);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    
    const [cropArea, setCropArea] = useState<CropArea>(
      defaultCrop || { x: 0, y: 0, width: 200, height: 200 }
    );
    
    const [transform, setTransform] = useState<Transform>({
      rotation: defaultTransform?.rotation || 0,
      flipX: defaultTransform?.flipX || false,
      flipY: defaultTransform?.flipY || false,
      zoom: defaultTransform?.zoom || 1
    });
    
    const [filters, setFilters] = useState<Filter[]>(defaultFilters);
    const [history, setHistory] = useState<HistoryState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [showGridOverlay, setShowGridOverlay] = useState(showGrid);
    const [showPreviewPanel, setShowPreviewPanel] = useState(showPreview);
    const [selectedTool, setSelectedTool] = useState<string>('crop');
    const [error, setError] = useState<string | null>(null);
    
    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    
    // Computed values
    const canUndo = useMemo(() => historyIndex > 0, [historyIndex]);
    const canRedo = useMemo(() => historyIndex < history.length - 1, [historyIndex, history.length]);
    
    const currentAspectRatio = useMemo(
      () => calculateAspectRatio(aspectRatio, customAspectRatio),
      [aspectRatio, customAspectRatio]
    );
    
    // ============================================================================
    // History Management
    // ============================================================================
    
    const addToHistory = useCallback(() => {
      if (!enableHistory) return;
      
      const newState: HistoryState = {
        cropArea: { ...cropArea },
        transform: { ...transform },
        filters: [...filters],
        timestamp: Date.now()
      };
      
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newState);
      
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }
      
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }, [enableHistory, cropArea, transform, filters, history, historyIndex, maxHistorySize]);
    
    const undo = useCallback(() => {
      if (!canUndo) return;
      
      const prevIndex = historyIndex - 1;
      const prevState = history[prevIndex];
      
      setCropArea(prevState.cropArea);
      setTransform(prevState.transform);
      setFilters(prevState.filters);
      setHistoryIndex(prevIndex);
    }, [canUndo, history, historyIndex]);
    
    const redo = useCallback(() => {
      if (!canRedo) return;
      
      const nextIndex = historyIndex + 1;
      const nextState = history[nextIndex];
      
      setCropArea(nextState.cropArea);
      setTransform(nextState.transform);
      setFilters(nextState.filters);
      setHistoryIndex(nextIndex);
    }, [canRedo, history, historyIndex]);
    
    // ============================================================================
    // Image Loading & Canvas Drawing
    // ============================================================================
    
    const drawImage = useCallback(() => {
      if (!canvasRef.current || !imageRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const image = imageRef.current;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Save context state
      ctx.save();
      
      // Apply transforms
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((transform.rotation * Math.PI) / 180);
      ctx.scale(
        transform.flipX ? -transform.zoom : transform.zoom,
        transform.flipY ? -transform.zoom : transform.zoom
      );
      
      // Apply filters
      applyFiltersToCanvas(ctx, filters);
      
      // Draw image
      ctx.drawImage(
        image,
        -image.width / 2,
        -image.height / 2,
        image.width,
        image.height
      );
      
      // Restore context state
      ctx.restore();
      
      // Draw crop overlay
      drawCropOverlay();
      
      // Update preview
      updatePreview();
    }, [transform, filters]);
    
    const drawCropOverlay = useCallback(() => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Clear crop area
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      drawCropShape(ctx, cropShape, cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      ctx.fill();
      ctx.restore();
      
      // Draw crop border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      drawCropShape(ctx, cropShape, cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      ctx.stroke();
      
      // Draw grid
      if (showGridOverlay) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        
        // Rule of thirds grid
        const thirdWidth = cropArea.width / 3;
        const thirdHeight = cropArea.height / 3;
        
        for (let i = 1; i <= 2; i++) {
          // Vertical lines
          ctx.beginPath();
          ctx.moveTo(cropArea.x + thirdWidth * i, cropArea.y);
          ctx.lineTo(cropArea.x + thirdWidth * i, cropArea.y + cropArea.height);
          ctx.stroke();
          
          // Horizontal lines
          ctx.beginPath();
          ctx.moveTo(cropArea.x, cropArea.y + thirdHeight * i);
          ctx.lineTo(cropArea.x + cropArea.width, cropArea.y + thirdHeight * i);
          ctx.stroke();
        }
      }
      
      // Draw resize handles
      if (!readOnly && !disabled) {
        const handles = [
          { x: cropArea.x, y: cropArea.y, cursor: 'nw-resize' },
          { x: cropArea.x + cropArea.width / 2, y: cropArea.y, cursor: 'n-resize' },
          { x: cropArea.x + cropArea.width, y: cropArea.y, cursor: 'ne-resize' },
          { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height / 2, cursor: 'e-resize' },
          { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height, cursor: 'se-resize' },
          { x: cropArea.x + cropArea.width / 2, y: cropArea.y + cropArea.height, cursor: 's-resize' },
          { x: cropArea.x, y: cropArea.y + cropArea.height, cursor: 'sw-resize' },
          { x: cropArea.x, y: cropArea.y + cropArea.height / 2, cursor: 'w-resize' }
        ];
        
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        handles.forEach(handle => {
          ctx.beginPath();
          ctx.arc(handle.x, handle.y, 6, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        });
      }
    }, [cropArea, cropShape, showGridOverlay, readOnly, disabled]);
    
    const updatePreview = useCallback(() => {
      if (!previewCanvasRef.current || !imageRef.current || !canvasRef.current) return;
      
      const previewCanvas = previewCanvasRef.current;
      const previewCtx = previewCanvas.getContext('2d');
      if (!previewCtx) return;
      
      const sourceCanvas = canvasRef.current;
      
      // Set preview canvas size
      previewCanvas.width = cropArea.width;
      previewCanvas.height = cropArea.height;
      
      // Clear preview
      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      
      // Draw cropped area
      previewCtx.save();
      drawCropShape(previewCtx, cropShape, 0, 0, cropArea.width, cropArea.height);
      previewCtx.clip();
      
      previewCtx.drawImage(
        sourceCanvas,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      );
      
      // Add watermark if specified
      if (watermark) {
        previewCtx.globalAlpha = watermark.opacity || 0.5;
        
        if (watermark.text) {
          previewCtx.font = '20px Arial';
          previewCtx.fillStyle = 'white';
          previewCtx.strokeStyle = 'black';
          previewCtx.lineWidth = 2;
          
          let x = 10, y = 30;
          switch (watermark.position) {
            case 'top-right':
              x = previewCanvas.width - previewCtx.measureText(watermark.text).width - 10;
              break;
            case 'bottom-left':
              y = previewCanvas.height - 10;
              break;
            case 'bottom-right':
              x = previewCanvas.width - previewCtx.measureText(watermark.text).width - 10;
              y = previewCanvas.height - 10;
              break;
            case 'center':
              x = (previewCanvas.width - previewCtx.measureText(watermark.text).width) / 2;
              y = previewCanvas.height / 2;
              break;
          }
          
          previewCtx.strokeText(watermark.text, x, y);
          previewCtx.fillText(watermark.text, x, y);
        }
        
        previewCtx.globalAlpha = 1;
      }
      
      previewCtx.restore();
    }, [cropArea, cropShape, watermark]);
    
    // ============================================================================
    // Export Functions
    // ============================================================================
    
    const exportImage = useCallback(async (format: ExportFormat): Promise<string | Blob> => {
      if (!previewCanvasRef.current) {
        throw new Error('No image to export');
      }
      
      const canvas = previewCanvasRef.current;
      
      switch (format) {
        case 'base64':
          return canvas.toDataURL(`image/${format === 'base64' ? 'png' : format}`, quality);
        
        case 'blob':
        case 'jpeg':
        case 'png':
        case 'webp':
          return new Promise((resolve, reject) => {
            canvas.toBlob(
              blob => {
                if (blob) resolve(blob);
                else reject(new Error('Failed to create blob'));
              },
              `image/${format === 'blob' ? 'png' : format}`,
              quality
            );
          });
        
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    }, [quality]);
    
    // ============================================================================
    // Event Handlers
    // ============================================================================
    
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      
      if (!acceptedFormats.includes(file.type)) {
        setError(`File type not supported. Please upload: ${acceptedFormats.join(', ')}`);
        return;
      }
      
      if (file.size > maxFileSize) {
        setError(`File too large. Maximum size: ${(maxFileSize / 1024 / 1024).toFixed(2)}MB`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImageSrc(dataUrl);
        setError(null);
      };
      reader.onerror = () => {
        setError('Failed to read file');
      };
      reader.readAsDataURL(file);
    }, [acceptedFormats, maxFileSize]);
    
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
      if (disabled || readOnly || !canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if clicking on resize handle
      const handles = [
        { x: cropArea.x, y: cropArea.y, type: 'nw' },
        { x: cropArea.x + cropArea.width / 2, y: cropArea.y, type: 'n' },
        { x: cropArea.x + cropArea.width, y: cropArea.y, type: 'ne' },
        { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height / 2, type: 'e' },
        { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height, type: 'se' },
        { x: cropArea.x + cropArea.width / 2, y: cropArea.y + cropArea.height, type: 's' },
        { x: cropArea.x, y: cropArea.y + cropArea.height, type: 'sw' },
        { x: cropArea.x, y: cropArea.y + cropArea.height / 2, type: 'w' }
      ];
      
      const handle = handles.find(h => 
        Math.abs(h.x - x) < 10 && Math.abs(h.y - y) < 10
      );
      
      if (handle) {
        setIsResizing(true);
        setResizeHandle(handle.type);
        setDragStart({ x, y });
        onCropStart?.(cropArea);
      } else if (
        x >= cropArea.x &&
        x <= cropArea.x + cropArea.width &&
        y >= cropArea.y &&
        y <= cropArea.y + cropArea.height
      ) {
        setIsDragging(true);
        setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
        onCropStart?.(cropArea);
      }
    }, [disabled, readOnly, cropArea, onCropStart]);
    
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || (!isDragging && !isResizing) || !dragStart) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (isDragging) {
        const newX = Math.max(0, Math.min(x - dragStart.x, rect.width - cropArea.width));
        const newY = Math.max(0, Math.min(y - dragStart.y, rect.height - cropArea.height));
        
        const newCropArea = { ...cropArea, x: newX, y: newY };
        setCropArea(newCropArea);
        onCropChange?.(newCropArea);
      } else if (isResizing && resizeHandle) {
        let newCropArea = { ...cropArea };
        const aspectRatioValue = currentAspectRatio;
        
        switch (resizeHandle) {
          case 'nw':
            newCropArea.width = cropArea.x + cropArea.width - x;
            newCropArea.height = aspectRatioValue 
              ? newCropArea.width / aspectRatioValue 
              : cropArea.y + cropArea.height - y;
            newCropArea.x = x;
            newCropArea.y = aspectRatioValue 
              ? cropArea.y + cropArea.height - newCropArea.height 
              : y;
            break;
          case 'ne':
            newCropArea.width = x - cropArea.x;
            newCropArea.height = aspectRatioValue 
              ? newCropArea.width / aspectRatioValue 
              : cropArea.y + cropArea.height - y;
            newCropArea.y = aspectRatioValue 
              ? cropArea.y + cropArea.height - newCropArea.height 
              : y;
            break;
          case 'sw':
            newCropArea.width = cropArea.x + cropArea.width - x;
            newCropArea.height = aspectRatioValue 
              ? newCropArea.width / aspectRatioValue 
              : y - cropArea.y;
            newCropArea.x = x;
            break;
          case 'se':
            newCropArea.width = x - cropArea.x;
            newCropArea.height = aspectRatioValue 
              ? newCropArea.width / aspectRatioValue 
              : y - cropArea.y;
            break;
          case 'n':
            newCropArea.height = cropArea.y + cropArea.height - y;
            newCropArea.y = y;
            if (aspectRatioValue) {
              newCropArea.width = newCropArea.height * aspectRatioValue;
              newCropArea.x = cropArea.x + (cropArea.width - newCropArea.width) / 2;
            }
            break;
          case 's':
            newCropArea.height = y - cropArea.y;
            if (aspectRatioValue) {
              newCropArea.width = newCropArea.height * aspectRatioValue;
              newCropArea.x = cropArea.x + (cropArea.width - newCropArea.width) / 2;
            }
            break;
          case 'w':
            newCropArea.width = cropArea.x + cropArea.width - x;
            newCropArea.x = x;
            if (aspectRatioValue) {
              newCropArea.height = newCropArea.width / aspectRatioValue;
              newCropArea.y = cropArea.y + (cropArea.height - newCropArea.height) / 2;
            }
            break;
          case 'e':
            newCropArea.width = x - cropArea.x;
            if (aspectRatioValue) {
              newCropArea.height = newCropArea.width / aspectRatioValue;
              newCropArea.y = cropArea.y + (cropArea.height - newCropArea.height) / 2;
            }
            break;
        }
        
        // Apply minimum size constraints
        newCropArea.width = Math.max(minCropWidth, newCropArea.width);
        newCropArea.height = Math.max(minCropHeight, newCropArea.height);
        
        // Keep within canvas bounds
        newCropArea.x = Math.max(0, Math.min(newCropArea.x, rect.width - newCropArea.width));
        newCropArea.y = Math.max(0, Math.min(newCropArea.y, rect.height - newCropArea.height));
        
        setCropArea(newCropArea);
        onCropChange?.(newCropArea);
      }
    }, [isDragging, isResizing, dragStart, resizeHandle, cropArea, currentAspectRatio, minCropWidth, minCropHeight, onCropChange]);
    
    const handleMouseUp = useCallback(() => {
      if (isDragging || isResizing) {
        setIsDragging(false);
        setIsResizing(false);
        setDragStart(null);
        setResizeHandle(null);
        onCropEnd?.(cropArea);
        addToHistory();
      }
    }, [isDragging, isResizing, cropArea, onCropEnd, addToHistory]);
    
    // ============================================================================
    // Transform Functions
    // ============================================================================
    
    const rotate = useCallback((angle: number) => {
      const newTransform = {
        ...transform,
        rotation: (transform.rotation + angle) % 360
      };
      setTransform(newTransform);
      onTransformChange?.(newTransform);
      addToHistory();
    }, [transform, onTransformChange, addToHistory]);
    
    const flip = useCallback((axis: 'x' | 'y') => {
      const newTransform = {
        ...transform,
        flipX: axis === 'x' ? !transform.flipX : transform.flipX,
        flipY: axis === 'y' ? !transform.flipY : transform.flipY
      };
      setTransform(newTransform);
      onTransformChange?.(newTransform);
      addToHistory();
    }, [transform, onTransformChange, addToHistory]);
    
    const zoom = useCallback((level: number) => {
      const newZoom = Math.max(minZoom, Math.min(maxZoom, level));
      const newTransform = { ...transform, zoom: newZoom };
      setTransform(newTransform);
      onTransformChange?.(newTransform);
    }, [transform, minZoom, maxZoom, onTransformChange]);
    
    // ============================================================================
    // Filter Functions
    // ============================================================================
    
    const applyFilter = useCallback((filter: Filter) => {
      const newFilters = [...filters];
      const existingIndex = newFilters.findIndex(f => f.type === filter.type);
      
      if (existingIndex >= 0) {
        if (filter.value === 0) {
          newFilters.splice(existingIndex, 1);
        } else {
          newFilters[existingIndex] = filter;
        }
      } else if (filter.value !== 0) {
        newFilters.push(filter);
      }
      
      setFilters(newFilters);
      onFilterChange?.(newFilters);
      addToHistory();
    }, [filters, onFilterChange, addToHistory]);
    
    const clearFilters = useCallback(() => {
      setFilters([]);
      onFilterChange?.([]);
      addToHistory();
    }, [onFilterChange, addToHistory]);
    
    // ============================================================================
    // Reset Function
    // ============================================================================
    
    const reset = useCallback(() => {
      setCropArea(defaultCrop || { x: 0, y: 0, width: 200, height: 200 });
      setTransform({
        rotation: defaultTransform?.rotation || 0,
        flipX: defaultTransform?.flipX || false,
        flipY: defaultTransform?.flipY || false,
        zoom: defaultTransform?.zoom || 1
      });
      setFilters(defaultFilters);
      setHistory([]);
      setHistoryIndex(-1);
    }, [defaultCrop, defaultTransform, defaultFilters]);
    
    // ============================================================================
    // Save Function
    // ============================================================================
    
    const handleSave = useCallback(async (format: ExportFormat = 'png') => {
      try {
        const data = await exportImage(format);
        onSave?.(data, format);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        onError?.(error);
      }
    }, [exportImage, onSave, onError]);
    
    // ============================================================================
    // Imperative Handle
    // ============================================================================
    
    useImperativeHandle(ref, () => ({
      crop: () => handleSave('png'),
      reset,
      export: exportImage,
      undo,
      redo,
      rotate,
      zoom,
      flip,
      applyFilter,
      clearFilters,
      getState: () => ({
        cropArea,
        transform,
        filters
      }),
      setState: (state) => {
        if (state.cropArea) setCropArea(state.cropArea);
        if (state.transform) setTransform(state.transform);
        if (state.filters) setFilters(state.filters);
      }
    }), [handleSave, reset, exportImage, undo, redo, rotate, zoom, flip, applyFilter, clearFilters, cropArea, transform, filters]);
    
    // ============================================================================
    // Effects
    // ============================================================================
    
    useEffect(() => {
      if (src) {
        setImageSrc(src);
      }
    }, [src]);
    
    useEffect(() => {
      if (!imageSrc) return;
      
      setIsLoading(true);
      loadImage(imageSrc)
        .then(img => {
          imageRef.current = img;
          setImageLoaded(true);
          setIsLoading(false);
          onImageLoad?.(img);
          
          // Set canvas size
          if (canvasRef.current) {
            canvasRef.current.width = img.width;
            canvasRef.current.height = img.height;
          }
          
          // Set initial crop area
          if (!defaultCrop) {
            setCropArea({
              x: img.width * 0.1,
              y: img.height * 0.1,
              width: img.width * 0.8,
              height: img.height * 0.8
            });
          }
        })
        .catch(err => {
          setError('Failed to load image');
          setIsLoading(false);
          onError?.(err);
        });
    }, [imageSrc, defaultCrop, onImageLoad, onError]);
    
    useEffect(() => {
      if (imageLoaded) {
        drawImage();
      }
    }, [imageLoaded, drawImage]);
    
    useEffect(() => {
      if (autoSave && imageLoaded) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        
        autoSaveTimerRef.current = setTimeout(() => {
          handleSave('png');
        }, autoSaveInterval);
        
        return () => {
          if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
          }
        };
      }
    }, [autoSave, autoSaveInterval, imageLoaded, handleSave, cropArea, transform, filters]);
    
    // Keyboard shortcuts
    useEffect(() => {
      if (!enableKeyboard || disabled || readOnly) return;
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case 'z':
              e.preventDefault();
              if (e.shiftKey) {
                redo();
              } else {
                undo();
              }
              break;
            case 'y':
              e.preventDefault();
              redo();
              break;
            case 's':
              e.preventDefault();
              handleSave('png');
              break;
            case 'r':
              e.preventDefault();
              reset();
              break;
          }
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enableKeyboard, disabled, readOnly, undo, redo, handleSave, reset]);
    
    // ============================================================================
    // Render
    // ============================================================================
    
    return (
      <div className={cn('flex flex-col gap-4 p-4 bg-background rounded-lg', className)}>
        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md flex items-center gap-2">
            <X className="h-4 w-4" />
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto hover:opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {/* Toolbar */}
        {showToolbar && (
          <div className={cn(
            'flex flex-wrap items-center gap-2 p-3 bg-muted rounded-md',
            toolbarClassName
          )}>
            {/* File Upload */}
            {allowUpload && !imageLoaded && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedFormats.join(',')}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  Upload Image
                </button>
              </>
            )}
            
            {imageLoaded && (
              <>
                {/* History Controls */}
                {enableHistory && (
                  <div className="flex items-center gap-1 border-r pr-2">
                    <button
                      onClick={undo}
                      disabled={!canUndo || disabled}
                      className="p-1.5 rounded hover:bg-accent disabled:opacity-50"
                      title="Undo (Ctrl+Z)"
                    >
                      <Undo2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={redo}
                      disabled={!canRedo || disabled}
                      className="p-1.5 rounded hover:bg-accent disabled:opacity-50"
                      title="Redo (Ctrl+Y)"
                    >
                      <Redo2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                {/* Transform Controls */}
                <div className="flex items-center gap-1 border-r pr-2">
                  <button
                    onClick={() => rotate(-rotationStep)}
                    disabled={disabled || readOnly}
                    className="p-1.5 rounded hover:bg-accent disabled:opacity-50"
                    title="Rotate Left"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => rotate(rotationStep)}
                    disabled={disabled || readOnly}
                    className="p-1.5 rounded hover:bg-accent disabled:opacity-50"
                    title="Rotate Right"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => flip('x')}
                    disabled={disabled || readOnly}
                    className="p-1.5 rounded hover:bg-accent disabled:opacity-50"
                    title="Flip Horizontal"
                  >
                    <FlipHorizontal className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => flip('y')}
                    disabled={disabled || readOnly}
                    className="p-1.5 rounded hover:bg-accent disabled:opacity-50"
                    title="Flip Vertical"
                  >
                    <FlipVertical className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 border-r pr-2">
                  <button
                    onClick={() => zoom(transform.zoom - zoomStep)}
                    disabled={disabled || readOnly || transform.zoom <= minZoom}
                    className="p-1.5 rounded hover:bg-accent disabled:opacity-50"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-sm px-2 min-w-[50px] text-center">
                    {Math.round(transform.zoom * 100)}%
                  </span>
                  <button
                    onClick={() => zoom(transform.zoom + zoomStep)}
                    disabled={disabled || readOnly || transform.zoom >= maxZoom}
                    className="p-1.5 rounded hover:bg-accent disabled:opacity-50"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
                
                {/* View Controls */}
                <div className="flex items-center gap-1 border-r pr-2">
                  <button
                    onClick={() => setShowGridOverlay(!showGridOverlay)}
                    className={cn(
                      'p-1.5 rounded hover:bg-accent',
                      showGridOverlay && 'bg-accent'
                    )}
                    title="Toggle Grid"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowPreviewPanel(!showPreviewPanel)}
                    className={cn(
                      'p-1.5 rounded hover:bg-accent',
                      showPreviewPanel && 'bg-accent'
                    )}
                    title="Toggle Preview"
                  >
                    {showPreviewPanel ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Action Controls */}
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={reset}
                    disabled={disabled}
                    className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleSave('png')}
                    disabled={disabled}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Main Content */}
        <div className="flex gap-4">
          {/* Canvas Area */}
          <div className="flex-1" ref={containerRef}>
            {!imageLoaded && !isLoading && (
              <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {allowUpload ? 'Upload an image to start cropping' : 'No image loaded'}
                </p>
              </div>
            )}
            
            {isLoading && (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            
            {imageLoaded && (
              <canvas
                ref={canvasRef}
                className={cn(
                  'max-w-full h-auto border rounded-lg cursor-move',
                  canvasClassName,
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            )}
          </div>
          
          {/* Sidebar */}
          {showSidebar && imageLoaded && (
            <div className={cn(
              'w-72 p-4 bg-muted rounded-lg space-y-4',
              sidebarClassName
            )}>
              {/* Aspect Ratio */}
              <div>
                <label className="text-sm font-medium mb-2 block">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => {
                    // Would need to lift this state up or use a callback
                  }}
                  disabled={disabled || readOnly}
                  className="w-full px-3 py-1.5 bg-background border rounded-md text-sm"
                >
                  <option value="free">Free</option>
                  <option value="16:9">16:9</option>
                  <option value="4:3">4:3</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="9:16">9:16</option>
                  <option value="3:4">3:4</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              {/* Crop Shape */}
              <div>
                <label className="text-sm font-medium mb-2 block">Crop Shape</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['rect', 'circle', 'triangle', 'hexagon', 'star'] as CropShape[]).map((shape) => (
                    <button
                      key={shape}
                      onClick={() => {
                        // Would need to implement shape change
                      }}
                      disabled={disabled || readOnly}
                      className={cn(
                        'p-2 rounded border hover:bg-accent',
                        cropShape === shape && 'bg-accent border-primary'
                      )}
                      title={shape}
                    >
                      {shape === 'rect' && <Square className="h-4 w-4 mx-auto" />}
                      {shape === 'circle' && <Circle className="h-4 w-4 mx-auto" />}
                      {shape === 'triangle' && <Triangle className="h-4 w-4 mx-auto" />}
                      {shape === 'hexagon' && <Hexagon className="h-4 w-4 mx-auto" />}
                      {shape === 'star' && <Star className="h-4 w-4 mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Filters */}
              <div>
                <label className="text-sm font-medium mb-2 block">Filters</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-20">Brightness</span>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      defaultValue="100"
                      onChange={(e) => applyFilter({ type: 'brightness', value: parseInt(e.target.value) })}
                      disabled={disabled || readOnly}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-20">Contrast</span>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      defaultValue="100"
                      onChange={(e) => applyFilter({ type: 'contrast', value: parseInt(e.target.value) })}
                      disabled={disabled || readOnly}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-20">Saturate</span>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      defaultValue="100"
                      onChange={(e) => applyFilter({ type: 'saturate', value: parseInt(e.target.value) })}
                      disabled={disabled || readOnly}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-20">Grayscale</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="0"
                      onChange={(e) => applyFilter({ type: 'grayscale', value: parseInt(e.target.value) })}
                      disabled={disabled || readOnly}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-20">Sepia</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="0"
                      onChange={(e) => applyFilter({ type: 'sepia', value: parseInt(e.target.value) })}
                      disabled={disabled || readOnly}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-20">Blur</span>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      defaultValue="0"
                      onChange={(e) => applyFilter({ type: 'blur', value: parseInt(e.target.value) })}
                      disabled={disabled || readOnly}
                      className="flex-1"
                    />
                  </div>
                  {filters.length > 0 && (
                    <button
                      onClick={clearFilters}
                      disabled={disabled || readOnly}
                      className="w-full px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:opacity-50 text-sm"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
              
              {/* Preview */}
              {showPreviewPanel && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Preview</label>
                  <div className="border rounded-lg overflow-hidden bg-checkered">
                    <canvas
                      ref={previewCanvasRef}
                      className={cn('w-full h-auto', previewClassName)}
                    />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleSave('jpeg')}
                      disabled={disabled}
                      className="flex-1 px-2 py-1 text-xs bg-secondary rounded hover:bg-secondary/90"
                    >
                      Export JPEG
                    </button>
                    <button
                      onClick={() => handleSave('png')}
                      disabled={disabled}
                      className="flex-1 px-2 py-1 text-xs bg-secondary rounded hover:bg-secondary/90"
                    >
                      Export PNG
                    </button>
                    <button
                      onClick={() => handleSave('webp')}
                      disabled={disabled}
                      className="flex-1 px-2 py-1 text-xs bg-secondary rounded hover:bg-secondary/90"
                    >
                      Export WebP
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Auto-save indicator */}
        {autoSave && imageLoaded && (
          <div className="text-xs text-muted-foreground text-center">
            Auto-save enabled (every {autoSaveInterval / 1000}s)
          </div>
        )}
      </div>
    );
  }
);

ImageCropper.displayName = 'ImageCropper';

export default ImageCropper;