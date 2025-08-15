// PDF Viewer Component - Heavy component for lazy loading
import React from 'react';

export interface PDFViewerProps {
  src: string;
  className?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ src, className }) => {
  return (
    <div className={className}>
      <iframe src={src} width="100%" height="100%" />
    </div>
  );
};

export default PDFViewer;
