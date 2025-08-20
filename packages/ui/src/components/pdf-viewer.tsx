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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  FileText,
  Hash,
  Loader2,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  Printer,
  RotateCw,
  RotateCcw,
  Search,
  X,
  ZoomIn,
  ZoomOut,
  Bookmark,
  BookmarkPlus,
  Edit,
  Highlighter,
  MessageSquare,
  Type,
  Square,
  Circle,
  Underline,
  Copy,
  Eye,
  EyeOff,
  Grid3x3,
  List,
  FileDown,
  Share2,
  Settings,
  ChevronUp,
  ChevronDown,
  Sun,
  Moon,
  Palette,
  Hand,
  MousePointer,
  PenTool,
  Eraser,
  Save,
  MoreVertical,
  Info,
  HelpCircle
} from 'lucide-react';
import { cn } from '../utils/cn';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type ViewMode = 'single' | 'continuous' | 'two-page';
export type ZoomMode = 'auto' | 'page-fit' | 'page-width' | 'custom';
export type Theme = 'light' | 'dark' | 'sepia';
export type AnnotationType = 'highlight' | 'underline' | 'strikethrough' | 'text' | 'drawing' | 'shape';
export type ToolMode = 'select' | 'hand' | 'text' | 'draw' | 'highlight' | 'comment';

interface PDFPageInfo {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
}

interface PDFAnnotation {
  id: string;
  type: AnnotationType;
  page: number;
  position: { x: number; y: number; width: number; height: number };
  content?: string;
  color?: string;
  author?: string;
  timestamp: Date;
  replies?: PDFAnnotation[];
}

interface PDFBookmark {
  id: string;
  title: string;
  page: number;
  level: number;
  children?: PDFBookmark[];
}

interface PDFSearchResult {
  page: number;
  text: string;
  position: { x: number; y: number };
  context: string;
}

// ✅ FIXED: Added export keyword to PDFViewerProps
export interface PDFViewerProps {
  src?: string | ArrayBuffer | Uint8Array;
  defaultPage?: number;
  defaultZoom?: number;
  defaultRotation?: number;
  viewMode?: ViewMode;
  zoomMode?: ZoomMode;
  theme?: Theme;
  toolMode?: ToolMode;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  rotationStep?: number;
  showToolbar?: boolean;
  showSidebar?: boolean;
  showThumbnails?: boolean;
  showOutline?: boolean;
  showAnnotations?: boolean;
  enableSearch?: boolean;
  enablePrint?: boolean;
  enableDownload?: boolean;
  enableRotation?: boolean;
  enableZoom?: boolean;
  enableFullscreen?: boolean;
  enableAnnotations?: boolean;
  enableTextSelection?: boolean;
  enableNavigation?: boolean;
  enableKeyboardShortcuts?: boolean;
  annotations?: PDFAnnotation[];
  bookmarks?: PDFBookmark[];
  password?: string;
  watermark?: {
    text?: string;
    image?: string;
    opacity?: number;
    position?: 'center' | 'diagonal';
  };
  onPageChange?: (page: number) => void;
  onZoomChange?: (zoom: number) => void;
  onRotationChange?: (rotation: number) => void;
  onAnnotationAdd?: (annotation: PDFAnnotation) => void;
  onAnnotationUpdate?: (annotation: PDFAnnotation) => void;
  onAnnotationDelete?: (id: string) => void;
  onBookmarkAdd?: (bookmark: PDFBookmark) => void;
  onBookmarkDelete?: (id: string) => void;
  onSearch?: (query: string) => void;
  onPrint?: () => void;
  onDownload?: () => void;
  onError?: (error: Error) => void;
  onLoad?: (numPages: number) => void;
  className?: string;
  toolbarClassName?: string;
  sidebarClassName?: string;
  pageClassName?: string;
  disabled?: boolean;
  readOnly?: boolean;
  customToolbarItems?: React.ReactNode;
  renderCustomPage?: (page: number) => React.ReactNode;
  renderCustomAnnotation?: (annotation: PDFAnnotation) => React.ReactNode;
}

export interface PDFViewerRef {
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  zoom: (level: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToPage: () => void;
  fitToWidth: () => void;
  rotate: (angle: number) => void;
  search: (query: string) => Promise<PDFSearchResult[]>;
  clearSearch: () => void;
  print: () => void;
  download: () => void;
  addAnnotation: (annotation: Omit<PDFAnnotation, 'id' | 'timestamp'>) => void;
  removeAnnotation: (id: string) => void;
  getAnnotations: () => PDFAnnotation[];
  addBookmark: (bookmark: Omit<PDFBookmark, 'id'>) => void;
  removeBookmark: (id: string) => void;
  getBookmarks: () => PDFBookmark[];
  getPageInfo: () => PDFPageInfo;
  setTheme: (theme: Theme) => void;
  setViewMode: (mode: ViewMode) => void;
  setToolMode: (mode: ToolMode) => void;
  toggleFullscreen: () => void;
}

// ============================================================================
// Mock PDF.js Implementation (simplified for demo)
// ============================================================================

class MockPDFDocument {
  numPages: number;
  pages: MockPDFPage[];

  constructor(numPages: number = 10) {
    this.numPages = numPages;
    this.pages = Array.from({ length: numPages }, (_, i) => new MockPDFPage(i + 1));
  }

  getPage(pageNum: number): Promise<MockPDFPage> {
    return Promise.resolve(this.pages[pageNum - 1]);
  }

  getOutline(): Promise<PDFBookmark[]> {
    return Promise.resolve([
      {
        id: '1',
        title: 'Chapter 1: Introduction',
        page: 1,
        level: 0,
        children: [
          { id: '1.1', title: 'Section 1.1', page: 2, level: 1 },
          { id: '1.2', title: 'Section 1.2', page: 3, level: 1 }
        ]
      },
      {
        id: '2',
        title: 'Chapter 2: Content',
        page: 4,
        level: 0,
        children: [
          { id: '2.1', title: 'Section 2.1', page: 5, level: 1 },
          { id: '2.2', title: 'Section 2.2', page: 6, level: 1 }
        ]
      }
    ]);
  }
}

class MockPDFPage {
  pageNumber: number;
  viewport: { width: number; height: number; scale: number };

  constructor(pageNumber: number) {
    this.pageNumber = pageNumber;
    this.viewport = { width: 612, height: 792, scale: 1 }; // Letter size
  }

  render(context: { canvasContext: CanvasRenderingContext2D; viewport: any }): Promise<void> {
    const ctx = context.canvasContext;
    const { width, height } = context.viewport;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw page background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw page content (mock)
    ctx.fillStyle = '#000000';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Page ${this.pageNumber}`, width / 2, 50);
    
    // Draw mock content
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    const lines = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
      'Duis aute irure dolor in reprehenderit in voluptate velit.',
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa.'
    ];
    
    lines.forEach((line, index) => {
      ctx.fillText(line, 50, 100 + index * 25);
    });
    
    // Draw page border
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
    
    return Promise.resolve();
  }

  getTextContent(): Promise<{ items: Array<{ str: string }> }> {
    return Promise.resolve({
      items: [
        { str: `Page ${this.pageNumber}` },
        { str: 'Lorem ipsum dolor sit amet' },
        { str: 'consectetur adipiscing elit' }
      ]
    });
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

const loadPDF = async (src: string | ArrayBuffer | Uint8Array): Promise<MockPDFDocument> => {
  // Simulate PDF loading
  await new Promise(resolve => setTimeout(resolve, 500));
  return new MockPDFDocument(10);
};

const generateAnnotationId = (): string => {
  return `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const generateBookmarkId = (): string => {
  return `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const applyTheme = (theme: Theme): React.CSSProperties => {
  switch (theme) {
    case 'dark':
      return {
        backgroundColor: '#1a1a1a',
        color: '#ffffff'
      };
    case 'sepia':
      return {
        backgroundColor: '#f4ecd8',
        color: '#5c4b37'
      };
    default:
      return {
        backgroundColor: '#ffffff',
        color: '#000000'
      };
  }
};

// ============================================================================
// Main Component
// ============================================================================

export const PDFViewer = forwardRef<PDFViewerRef, PDFViewerProps>(
  (
    {
      src,
      defaultPage = 1,
      defaultZoom = 1,
      defaultRotation = 0,
      viewMode = 'single',
      zoomMode = 'auto',
      theme = 'light',
      toolMode = 'select',
      minZoom = 0.5,
      maxZoom = 5,
      zoomStep = 0.25,
      rotationStep = 90,
      showToolbar = true,
      showSidebar = true,
      showThumbnails = true,
      showOutline = true,
      showAnnotations = true,
      enableSearch = true,
      enablePrint = true,
      enableDownload = true,
      enableRotation = true,
      enableZoom = true,
      enableFullscreen = true,
      enableAnnotations = true,
      enableTextSelection = true,
      enableNavigation = true,
      enableKeyboardShortcuts = true,
      annotations: initialAnnotations = [],
      bookmarks: initialBookmarks = [],
      password,
      watermark,
      onPageChange,
      onZoomChange,
      onRotationChange,
      onAnnotationAdd,
      onAnnotationUpdate,
      onAnnotationDelete,
      onBookmarkAdd,
      onBookmarkDelete,
      onSearch,
      onPrint,
      onDownload,
      onError,
      onLoad,
      className,
      toolbarClassName,
      sidebarClassName,
      pageClassName,
      disabled = false,
      readOnly = false,
      customToolbarItems,
      renderCustomPage,
      renderCustomAnnotation
    },
    ref
  ) => {
    // State
    const [pdfDocument, setPdfDocument] = useState<MockPDFDocument | null>(null);
    const [currentPage, setCurrentPage] = useState(defaultPage);
    const [totalPages, setTotalPages] = useState(0);
    const [zoom, setZoom] = useState(defaultZoom);
    const [rotation, setRotation] = useState(defaultRotation);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<PDFSearchResult[]>([]);
    const [currentSearchResult, setCurrentSearchResult] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const [annotations, setAnnotations] = useState<PDFAnnotation[]>(initialAnnotations);
    const [bookmarks, setBookmarks] = useState<PDFBookmark[]>(initialBookmarks);
    const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [sidebarTab, setSidebarTab] = useState<'thumbnails' | 'outline' | 'annotations' | 'bookmarks'>('thumbnails');
    const [currentTheme, setCurrentTheme] = useState(theme);
    const [currentViewMode, setCurrentViewMode] = useState(viewMode);
    const [currentToolMode, setCurrentToolMode] = useState(toolMode);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingPath, setDrawingPath] = useState<{ x: number; y: number }[]>([]);
    const [showPageInput, setShowPageInput] = useState(false);
    const [pageInputValue, setPageInputValue] = useState(String(currentPage));
    
    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textLayerRef = useRef<HTMLDivElement>(null);
    const annotationLayerRef = useRef<HTMLDivElement>(null);
    const thumbnailRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
    
    // Computed values
    const canGoBack = currentPage > 1;
    const canGoForward = currentPage < totalPages;
    const currentZoomPercent = Math.round(zoom * 100);
    
    const zoomLevels = useMemo(() => [
      { value: 0.5, label: '50%' },
      { value: 0.75, label: '75%' },
      { value: 1, label: '100%' },
      { value: 1.25, label: '125%' },
      { value: 1.5, label: '150%' },
      { value: 2, label: '200%' },
      { value: 3, label: '300%' },
      { value: 4, label: '400%' }
    ], []);
    
    // ============================================================================
    // PDF Loading and Rendering
    // ============================================================================
    
    const renderPage = useCallback(async (pageNum: number) => {
      if (!pdfDocument || !canvasRef.current) return;
      
      try {
        const page = await pdfDocument.getPage(pageNum);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;
        
        // Calculate viewport
        const viewport = {
          width: page.viewport.width * zoom,
          height: page.viewport.height * zoom,
          scale: zoom
        };
        
        // Set canvas dimensions
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Apply rotation
        context.save();
        if (rotation !== 0) {
          context.translate(canvas.width / 2, canvas.height / 2);
          context.rotate((rotation * Math.PI) / 180);
          context.translate(-canvas.width / 2, -canvas.height / 2);
        }
        
        // Render page
        await page.render({ canvasContext: context, viewport });
        
        // Apply watermark
        if (watermark) {
          context.globalAlpha = watermark.opacity || 0.3;
          context.font = '48px Arial';
          context.fillStyle = 'gray';
          
          if (watermark.text) {
            if (watermark.position === 'diagonal') {
              context.save();
              context.translate(canvas.width / 2, canvas.height / 2);
              context.rotate(-45 * Math.PI / 180);
              context.textAlign = 'center';
              context.fillText(watermark.text, 0, 0);
              context.restore();
            } else {
              context.textAlign = 'center';
              context.fillText(watermark.text, canvas.width / 2, canvas.height / 2);
            }
          }
          
          context.globalAlpha = 1;
        }
        
        context.restore();
        
        // Render text layer for selection
        if (enableTextSelection && textLayerRef.current) {
          const textContent = await page.getTextContent();
          textLayerRef.current.innerHTML = '';
          
          textContent.items.forEach((item: any) => {
            const span = document.createElement('span');
            span.textContent = item.str;
            span.style.position = 'absolute';
            span.style.left = `${item.transform?.[4] || 0}px`;
            span.style.top = `${item.transform?.[5] || 0}px`;
            span.style.fontSize = `${item.height || 12}px`;
            span.style.fontFamily = item.fontName || 'sans-serif';
            span.style.color = 'transparent';
            span.style.cursor = 'text';
            span.style.userSelect = 'text';
            textLayerRef.current?.appendChild(span);
          });
        }
        
        // Render annotations
        renderAnnotations();
        
      } catch (err) {
        console.error('Error rendering page:', err);
        setError('Failed to render page');
      }
    }, [pdfDocument, zoom, rotation, watermark, enableTextSelection]);
    
    const renderThumbnail = useCallback(async (pageNum: number) => {
      if (!pdfDocument) return;
      
      const canvas = thumbnailRefs.current.get(pageNum);
      if (!canvas) return;
      
      try {
        const page = await pdfDocument.getPage(pageNum);
        const context = canvas.getContext('2d');
        if (!context) return;
        
        const scale = 0.2;
        const viewport = {
          width: page.viewport.width * scale,
          height: page.viewport.height * scale,
          scale
        };
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({ canvasContext: context, viewport });
        
      } catch (err) {
        console.error('Error rendering thumbnail:', err);
      }
    }, [pdfDocument]);
    
    const renderAnnotations = useCallback(() => {
      if (!annotationLayerRef.current) return;
      
      annotationLayerRef.current.innerHTML = '';
      
      const pageAnnotations = annotations.filter(a => a.page === currentPage);
      
      pageAnnotations.forEach(annotation => {
        const div = document.createElement('div');
        div.id = annotation.id;
        div.className = 'absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 cursor-pointer hover:bg-opacity-30';
        div.style.left = `${annotation.position.x}px`;
        div.style.top = `${annotation.position.y}px`;
        div.style.width = `${annotation.position.width}px`;
        div.style.height = `${annotation.position.height}px`;
        
        if (annotation.type === 'highlight') {
          div.style.backgroundColor = annotation.color || 'yellow';
          div.style.opacity = '0.4';
        } else if (annotation.type === 'text') {
          div.textContent = annotation.content || '';
          div.style.padding = '4px';
          div.style.fontSize = '12px';
        }
        
        div.addEventListener('click', () => {
          setSelectedAnnotation(annotation.id);
        });
        
        if (renderCustomAnnotation) {
          const customContent = renderCustomAnnotation(annotation);
          if (customContent) {
            // Would need to use ReactDOM.render or portal here
          }
        }
        
        annotationLayerRef.current?.appendChild(div);
      });
    }, [annotations, currentPage, renderCustomAnnotation]);
    
    // ============================================================================
    // Navigation Functions
    // ============================================================================
    
    const goToPage = useCallback((page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
      setPageInputValue(String(validPage));
      onPageChange?.(validPage);
    }, [totalPages, onPageChange]);
    
    const nextPage = useCallback(() => {
      if (canGoForward) {
        goToPage(currentPage + 1);
      }
    }, [canGoForward, currentPage, goToPage]);
    
    const previousPage = useCallback(() => {
      if (canGoBack) {
        goToPage(currentPage - 1);
      }
    }, [canGoBack, currentPage, goToPage]);
    
    const firstPage = useCallback(() => {
      goToPage(1);
    }, [goToPage]);
    
    const lastPage = useCallback(() => {
      goToPage(totalPages);
    }, [totalPages, goToPage]);
    
    // ============================================================================
    // Zoom Functions
    // ============================================================================
    
    const setZoomLevel = useCallback((level: number) => {
      const validZoom = Math.max(minZoom, Math.min(maxZoom, level));
      setZoom(validZoom);
      onZoomChange?.(validZoom);
    }, [minZoom, maxZoom, onZoomChange]);
    
    const zoomIn = useCallback(() => {
      setZoomLevel(zoom + zoomStep);
    }, [zoom, zoomStep, setZoomLevel]);
    
    const zoomOut = useCallback(() => {
      setZoomLevel(zoom - zoomStep);
    }, [zoom, zoomStep, setZoomLevel]);
    
    const fitToPage = useCallback(() => {
      if (!containerRef.current || !pdfDocument) return;
      
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const pageWidth = 612; // Default page width
      const pageHeight = 792; // Default page height
      
      const scaleX = containerWidth / pageWidth;
      const scaleY = containerHeight / pageHeight;
      const scale = Math.min(scaleX, scaleY) * 0.9;
      
      setZoomLevel(scale);
    }, [pdfDocument, setZoomLevel]);
    
    const fitToWidth = useCallback(() => {
      if (!containerRef.current || !pdfDocument) return;
      
      const containerWidth = containerRef.current.clientWidth;
      const pageWidth = 612; // Default page width
      const scale = (containerWidth / pageWidth) * 0.9;
      
      setZoomLevel(scale);
    }, [pdfDocument, setZoomLevel]);
    
    // ============================================================================
    // Rotation Functions
    // ============================================================================
    
    const rotate = useCallback((angle: number) => {
      const newRotation = (rotation + angle) % 360;
      setRotation(newRotation);
      onRotationChange?.(newRotation);
    }, [rotation, onRotationChange]);
    
    // ============================================================================
    // Search Functions
    // ============================================================================
    
    const search = useCallback(async (query: string): Promise<PDFSearchResult[]> => {
      if (!pdfDocument || !query) return [];
      
      setIsSearching(true);
      const results: PDFSearchResult[] = [];
      
      try {
        for (let i = 1; i <= totalPages; i++) {
          const page = await pdfDocument.getPage(i);
          const textContent = await page.getTextContent();
          
          textContent.items.forEach((item: any) => {
            if (item.str.toLowerCase().includes(query.toLowerCase())) {
              results.push({
                page: i,
                text: item.str,
                position: { x: 0, y: 0 },
                context: item.str
              });
            }
          });
        }
        
        setSearchResults(results);
        onSearch?.(query);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
      
      return results;
    }, [pdfDocument, totalPages, onSearch]);
    
    const clearSearch = useCallback(() => {
      setSearchQuery('');
      setSearchResults([]);
      setCurrentSearchResult(0);
    }, []);
    
    const nextSearchResult = useCallback(() => {
      if (searchResults.length === 0) return;
      
      const next = (currentSearchResult + 1) % searchResults.length;
      setCurrentSearchResult(next);
      goToPage(searchResults[next].page);
    }, [searchResults, currentSearchResult, goToPage]);
    
    const previousSearchResult = useCallback(() => {
      if (searchResults.length === 0) return;
      
      const prev = currentSearchResult === 0 ? searchResults.length - 1 : currentSearchResult - 1;
      setCurrentSearchResult(prev);
      goToPage(searchResults[prev].page);
    }, [searchResults, currentSearchResult, goToPage]);
    
    // ============================================================================
    // Print and Download Functions
    // ============================================================================
    
    const print = useCallback(() => {
      if (!canvasRef.current) return;
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/png');
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Print PDF</title>
            <style>
              body { margin: 0; padding: 0; }
              img { width: 100%; height: auto; }
              @media print {
                body { margin: 0; }
                img { page-break-after: always; }
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" />
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
      
      onPrint?.();
    }, [onPrint]);
    
    const download = useCallback(() => {
      if (!src || typeof src !== 'string') return;
      
      const link = document.createElement('a');
      link.href = src;
      link.download = `document-page-${currentPage}.pdf`;
      link.click();
      
      onDownload?.();
    }, [src, currentPage, onDownload]);
    
    // ============================================================================
    // Annotation Functions
    // ============================================================================
    
    const addAnnotation = useCallback((annotation: Omit<PDFAnnotation, 'id' | 'timestamp'>) => {
      const newAnnotation: PDFAnnotation = {
        ...annotation,
        id: generateAnnotationId(),
        timestamp: new Date()
      };
      
      setAnnotations(prev => [...prev, newAnnotation]);
      onAnnotationAdd?.(newAnnotation);
    }, [onAnnotationAdd]);
    
    const removeAnnotation = useCallback((id: string) => {
      setAnnotations(prev => prev.filter(a => a.id !== id));
      onAnnotationDelete?.(id);
    }, [onAnnotationDelete]);
    
    const updateAnnotation = useCallback((annotation: PDFAnnotation) => {
      setAnnotations(prev => prev.map(a => a.id === annotation.id ? annotation : a));
      onAnnotationUpdate?.(annotation);
    }, [onAnnotationUpdate]);
    
    // ============================================================================
    // Bookmark Functions
    // ============================================================================
    
    const addBookmark = useCallback((bookmark: Omit<PDFBookmark, 'id'>) => {
      const newBookmark: PDFBookmark = {
        ...bookmark,
        id: generateBookmarkId()
      };
      
      setBookmarks(prev => [...prev, newBookmark]);
      onBookmarkAdd?.(newBookmark);
    }, [onBookmarkAdd]);
    
    const removeBookmark = useCallback((id: string) => {
      setBookmarks(prev => prev.filter(b => b.id !== id));
      onBookmarkDelete?.(id);
    }, [onBookmarkDelete]);
    
    // ============================================================================
    // Fullscreen Functions
    // ============================================================================
    
    const toggleFullscreen = useCallback(() => {
      if (!containerRef.current) return;
      
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      
      setIsFullscreen(!isFullscreen);
    }, [isFullscreen]);
    
    // ============================================================================
    // Tool Mode Handlers
    // ============================================================================
    
    const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || disabled || readOnly) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      switch (currentToolMode) {
        case 'text':
          addAnnotation({
            type: 'text',
            page: currentPage,
            position: { x, y, width: 100, height: 30 },
            content: 'New text',
            author: 'User'
          });
          break;
        
        case 'highlight':
          // Would need text selection logic here
          break;
        
        case 'comment':
          addAnnotation({
            type: 'text',
            page: currentPage,
            position: { x, y, width: 200, height: 100 },
            content: 'New comment',
            author: 'User'
          });
          break;
      }
    }, [currentToolMode, currentPage, disabled, readOnly, addAnnotation]);
    
    const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || currentToolMode !== 'draw') return;
      
      setIsDrawing(true);
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setDrawingPath([{ x, y }]);
    }, [currentToolMode]);
    
    const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || !isDrawing || currentToolMode !== 'draw') return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setDrawingPath(prev => [...prev, { x, y }]);
    }, [isDrawing, currentToolMode]);
    
    const handleCanvasMouseUp = useCallback(() => {
      if (!isDrawing || drawingPath.length < 2) return;
      
      setIsDrawing(false);
      
      // Create drawing annotation
      const minX = Math.min(...drawingPath.map(p => p.x));
      const minY = Math.min(...drawingPath.map(p => p.y));
      const maxX = Math.max(...drawingPath.map(p => p.x));
      const maxY = Math.max(...drawingPath.map(p => p.y));
      
      addAnnotation({
        type: 'drawing',
        page: currentPage,
        position: {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        },
        content: JSON.stringify(drawingPath),
        author: 'User'
      });
      
      setDrawingPath([]);
    }, [isDrawing, drawingPath, currentPage, addAnnotation]);
    
    // ============================================================================
    // Imperative Handle
    // ============================================================================
    
    useImperativeHandle(ref, () => ({
      goToPage,
      nextPage,
      previousPage,
      firstPage,
      lastPage,
      zoom: setZoomLevel,
      zoomIn,
      zoomOut,
      fitToPage,
      fitToWidth,
      rotate,
      search,
      clearSearch,
      print,
      download,
      addAnnotation,
      removeAnnotation,
      getAnnotations: () => annotations,
      addBookmark,
      removeBookmark,
      getBookmarks: () => bookmarks,
      getPageInfo: () => ({
        pageNumber: currentPage,
        width: canvasRef.current?.width || 0,
        height: canvasRef.current?.height || 0,
        rotation,
        scale: zoom
      }),
      setTheme: setCurrentTheme,
      setViewMode: setCurrentViewMode,
      setToolMode: setCurrentToolMode,
      toggleFullscreen
    }), [
      goToPage, nextPage, previousPage, firstPage, lastPage,
      setZoomLevel, zoomIn, zoomOut, fitToPage, fitToWidth,
      rotate, search, clearSearch, print, download,
      addAnnotation, removeAnnotation, annotations,
      addBookmark, removeBookmark, bookmarks,
      currentPage, rotation, zoom, toggleFullscreen
    ]);
    
    // ============================================================================
    // Effects
    // ============================================================================
    
    useEffect(() => {
      if (!src) return;
      
      setIsLoading(true);
      setError(null);
      
      loadPDF(src)
        .then(doc => {
          setPdfDocument(doc);
          setTotalPages(doc.numPages);
          onLoad?.(doc.numPages);
        })
        .catch(err => {
          setError('Failed to load PDF');
          onError?.(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, [src, onLoad, onError]);
    
    useEffect(() => {
      if (pdfDocument && currentPage) {
        renderPage(currentPage);
      }
    }, [pdfDocument, currentPage, renderPage]);
    
    useEffect(() => {
      if (pdfDocument && showThumbnails) {
        for (let i = 1; i <= totalPages; i++) {
          renderThumbnail(i);
        }
      }
    }, [pdfDocument, totalPages, showThumbnails, renderThumbnail]);
    
    // Keyboard shortcuts
    useEffect(() => {
      if (!enableKeyboardShortcuts || disabled) return;
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case 'p':
              e.preventDefault();
              print();
              break;
            case 's':
              e.preventDefault();
              download();
              break;
            case 'f':
              e.preventDefault();
              document.getElementById('pdf-search-input')?.focus();
              break;
            case '+':
            case '=':
              e.preventDefault();
              zoomIn();
              break;
            case '-':
              e.preventDefault();
              zoomOut();
              break;
            case '0':
              e.preventDefault();
              setZoomLevel(1);
              break;
          }
        } else {
          switch (e.key) {
            case 'ArrowLeft':
              previousPage();
              break;
            case 'ArrowRight':
              nextPage();
              break;
            case 'Home':
              firstPage();
              break;
            case 'End':
              lastPage();
              break;
            case 'r':
              rotate(rotationStep);
              break;
            case 'R':
              rotate(-rotationStep);
              break;
          }
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
      enableKeyboardShortcuts, disabled,
      print, download, zoomIn, zoomOut, setZoomLevel,
      previousPage, nextPage, firstPage, lastPage,
      rotate, rotationStep
    ]);
    
    // ============================================================================
    // Render
    // ============================================================================
    
    return (
      <div
        ref={containerRef}
        className={cn(
          'flex h-full bg-background',
          className
        )}
        style={applyTheme(currentTheme)}
      >
        {/* Sidebar */}
        {showSidebar && (
          <div className={cn(
            'w-64 border-r bg-muted/50 flex flex-col',
            sidebarClassName
          )}>
            {/* Sidebar Tabs */}
            <div className="flex border-b">
              {showThumbnails && (
                <button
                  onClick={() => setSidebarTab('thumbnails')}
                  className={cn(
                    'flex-1 px-3 py-2 text-sm font-medium',
                    sidebarTab === 'thumbnails' && 'bg-background border-b-2 border-primary'
                  )}
                >
                  <Grid3x3 className="h-4 w-4 inline mr-1" />
                  Pages
                </button>
              )}
              {showOutline && (
                <button
                  onClick={() => setSidebarTab('outline')}
                  className={cn(
                    'flex-1 px-3 py-2 text-sm font-medium',
                    sidebarTab === 'outline' && 'bg-background border-b-2 border-primary'
                  )}
                >
                  <List className="h-4 w-4 inline mr-1" />
                  Outline
                </button>
              )}
              {showAnnotations && (
                <button
                  onClick={() => setSidebarTab('annotations')}
                  className={cn(
                    'flex-1 px-3 py-2 text-sm font-medium',
                    sidebarTab === 'annotations' && 'bg-background border-b-2 border-primary'
                  )}
                >
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  Notes
                </button>
              )}
            </div>
            
            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {/* Thumbnails */}
              {sidebarTab === 'thumbnails' && showThumbnails && (
                <div className="space-y-3">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <div
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={cn(
                        'cursor-pointer border-2 rounded-lg p-2 hover:bg-accent',
                        currentPage === pageNum && 'border-primary bg-accent'
                      )}
                    >
                      <canvas
                        ref={el => {
                          if (el) thumbnailRefs.current.set(pageNum, el);
                        }}
                        className="w-full h-auto"
                      />
                      <div className="text-center mt-1 text-sm">Page {pageNum}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Outline */}
              {sidebarTab === 'outline' && showOutline && (
                <div className="space-y-2">
                  {bookmarks.map(bookmark => (
                    <div
                      key={bookmark.id}
                      className="cursor-pointer hover:bg-accent p-2 rounded"
                      onClick={() => goToPage(bookmark.page)}
                      style={{ paddingLeft: `${bookmark.level * 16 + 8}px` }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{bookmark.title}</span>
                        <span className="text-xs text-muted-foreground">p.{bookmark.page}</span>
                      </div>
                      {bookmark.children && (
                        <div className="ml-4 mt-1">
                          {bookmark.children.map(child => (
                            <div
                              key={child.id}
                              className="text-xs py-1 hover:bg-accent cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                goToPage(child.page);
                              }}
                            >
                              {child.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Annotations */}
              {sidebarTab === 'annotations' && showAnnotations && (
                <div className="space-y-2">
                  {annotations.map(annotation => (
                    <div
                      key={annotation.id}
                      className={cn(
                        'p-2 border rounded cursor-pointer hover:bg-accent',
                        selectedAnnotation === annotation.id && 'border-primary bg-accent'
                      )}
                      onClick={() => {
                        goToPage(annotation.page);
                        setSelectedAnnotation(annotation.id);
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium capitalize">{annotation.type}</span>
                        <span className="text-xs text-muted-foreground">p.{annotation.page}</span>
                      </div>
                      {annotation.content && (
                        <div className="text-sm">{annotation.content}</div>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">{annotation.author}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAnnotation(annotation.id);
                          }}
                          className="text-xs text-destructive hover:text-destructive/80"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          {showToolbar && (
            <div className={cn(
              'flex items-center gap-2 px-4 py-2 border-b bg-background',
              toolbarClassName
            )}>
              {/* Navigation */}
              {enableNavigation && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={firstPage}
                    disabled={!canGoBack || disabled}
                    className="p-1.5 rounded hover:bg-accent disabled:opacity-50"
                    title="First Page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={previousPage}
                    disabled={!canGoBack || disabled}
                    className="p-1.5 rounded hover:bg-accent disabled:opacity-50"
                    title="Previous Page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-center gap-1 mx-2">
                    {showPageInput ? (
                      <input
                        type="number"
                        value={pageInputValue}
                        onChange={(e) => setPageInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            goToPage(parseInt(pageInputValue));
                            setShowPageInput(false);
                          } else if (e.key === 'Escape') {
                            setPageInputValue(String(currentPage));
                            setShowPageInput(false);
                          }
                        }}
                        onBlur={() => {
                          goToPage(parseInt(pageInputValue));
                          setShowPageInput(false);
                        }}
                        className="w-12 px-1 py-0.5 text-center border rounded"
                        min={1}
                        max={totalPages}
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => setShowPageInput(true)}
                        className="px-2 py-0.5 hover:bg-accent rounded"
                      >
                        {currentPage}
                      </button>
                    )}
                    <span className="text-muted-foreground">/</span>
                    <span>{totalPages}</span>
                  </div>
                  
                  <button
                    onClick={nextPage}
                    disabled={!canGoForward || disabled}
                    className="p-1.5 rounded hover:bg-accent disabled:opacity-50"
                    title="Next Page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={lastPage}
                    disabled={!canGoForward || disabled}
                    className="p-1.5 rounded hover:bg-accent disabled:opacity-50"
                    title="Last Page"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              <div className="h-6 w-px bg-border" />
              
              {/* Zoom Controls */}
              {enableZoom && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={zoomOut}
                    disabled={zoom <= minZoom || disabled}
                    className="p-1.5 rounded hover:bg-accent disabled:opacity-50"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  
                  <select
                    value={zoom}
                    onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                    disabled={disabled}
                    className="px-2 py-1 text-sm border rounded"
                  >
                    <option value="auto">Auto</option>
                    <option value="page-fit">Fit Page</option>
                    <option value="page-width">Fit Width</option>
                    {zoomLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={zoomIn}
                    disabled={zoom >= maxZoom || disabled}
                    className="p-1.5 rounded hover:bg-accent disabled:opacity-50"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              <div className="h-6 w-px bg-border" />
              
              {/* Rotation Controls */}
              {enableRotation && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => rotate(-rotationStep)}
                    disabled={disabled}
                    className="p-1.5 rounded hover:bg-accent disabled:opacity-50"
                    title="Rotate Left"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => rotate(rotationStep)}
                    disabled={disabled}
                    className="p-1.5 rounded hover:bg-accent disabled:opacity-50"
                    title="Rotate Right"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              <div className="h-6 w-px bg-border" />
              
              {/* Tool Mode */}
              {enableAnnotations && !readOnly && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentToolMode('select')}
                    className={cn(
                      'p-1.5 rounded hover:bg-accent',
                      currentToolMode === 'select' && 'bg-accent'
                    )}
                    title="Select"
                  >
                    <MousePointer className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentToolMode('hand')}
                    className={cn(
                      'p-1.5 rounded hover:bg-accent',
                      currentToolMode === 'hand' && 'bg-accent'
                    )}
                    title="Hand Tool"
                  >
                    <Hand className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentToolMode('text')}
                    className={cn(
                      'p-1.5 rounded hover:bg-accent',
                      currentToolMode === 'text' && 'bg-accent'
                    )}
                    title="Add Text"
                  >
                    <Type className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentToolMode('highlight')}
                    className={cn(
                      'p-1.5 rounded hover:bg-accent',
                      currentToolMode === 'highlight' && 'bg-accent'
                    )}
                    title="Highlight"
                  >
                    <Highlighter className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentToolMode('draw')}
                    className={cn(
                      'p-1.5 rounded hover:bg-accent',
                      currentToolMode === 'draw' && 'bg-accent'
                    )}
                    title="Draw"
                  >
                    <PenTool className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentToolMode('comment')}
                    className={cn(
                      'p-1.5 rounded hover:bg-accent',
                      currentToolMode === 'comment' && 'bg-accent'
                    )}
                    title="Add Comment"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              <div className="flex-1" />
              
              {/* Search */}
              {enableSearch && (
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <input
                      id="pdf-search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          search(searchQuery);
                        }
                      }}
                      placeholder="Search..."
                      className="pl-8 pr-8 py-1 text-sm border rounded w-48"
                      disabled={disabled}
                    />
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {searchResults.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">
                        {currentSearchResult + 1}/{searchResults.length}
                      </span>
                      <button
                        onClick={previousSearchResult}
                        className="p-1 rounded hover:bg-accent"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={nextSearchResult}
                        className="p-1 rounded hover:bg-accent"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <div className="h-6 w-px bg-border" />
              
              {/* Actions */}
              <div className="flex items-center gap-1">
                {/* Theme Selector */}
                <select
                  value={currentTheme}
                  onChange={(e) => setCurrentTheme(e.target.value as Theme)}
                  className="px-2 py-1 text-sm border rounded"
                  title="Theme"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="sepia">Sepia</option>
                </select>
                
                {enablePrint && (
                  <button
                    onClick={print}
                    disabled={disabled}
                    className="p-1.5 rounded hover:bg-accent disabled:opacity-50"
                    title="Print (Ctrl+P)"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                )}
                
                {enableDownload && (
                  <button
                    onClick={download}
                    disabled={disabled}
                    className="p-1.5 rounded hover:bg-accent disabled:opacity-50"
                    title="Download (Ctrl+S)"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                )}
                
                {enableFullscreen && (
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded hover:bg-accent"
                    title="Fullscreen"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </button>
                )}
                
                {customToolbarItems}
              </div>
            </div>
          )}
          
          {/* PDF Viewer Area */}
          <div className="flex-1 overflow-auto relative bg-muted/20">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Loading PDF...</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-destructive">{error}</p>
                </div>
              </div>
            )}
            
            {!isLoading && !error && pdfDocument && (
              <div className="flex justify-center py-8">
                <div className="relative shadow-xl">
                  {/* Main Canvas */}
                  <canvas
                    ref={canvasRef}
                    className={cn(
                      'bg-white',
                      pageClassName,
                      currentToolMode === 'hand' && 'cursor-grab',
                      currentToolMode === 'text' && 'cursor-text',
                      currentToolMode === 'draw' && 'cursor-crosshair',
                      disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    onClick={handleCanvasClick}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                  />
                  
                  {/* Text Layer */}
                  {enableTextSelection && (
                    <div
                      ref={textLayerRef}
                      className="absolute inset-0 pointer-events-none"
                      style={{ mixBlendMode: 'multiply' }}
                    />
                  )}
                  
                  {/* Annotation Layer */}
                  <div
                    ref={annotationLayerRef}
                    className="absolute inset-0"
                  />
                  
                  {/* Drawing Layer */}
                  {isDrawing && drawingPath.length > 0 && (
                    <svg
                      className="absolute inset-0 pointer-events-none"
                      style={{ width: '100%', height: '100%' }}
                    >
                      <polyline
                        points={drawingPath.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="red"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                  
                  {/* Custom Page Render */}
                  {renderCustomPage && renderCustomPage(currentPage)}
                </div>
              </div>
            )}
            
            {!src && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No PDF loaded</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

PDFViewer.displayName = 'PDFViewer';

export default PDFViewer;