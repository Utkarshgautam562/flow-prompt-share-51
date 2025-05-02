
import React, { useEffect, useRef } from 'react';
import { createImageLoader, lazyLoadImage } from '@/utils/performance';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  priority = false,
  quality = 75
}) => {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!priority && imgRef.current) {
      lazyLoadImage(imgRef.current);
    }
  }, [priority]);

  // Process image URL for optimization if needed
  const processedSrc = src.startsWith('http') 
    ? createImageLoader(src, width, quality)
    : src;

  return (
    <img
      ref={imgRef}
      src={priority ? processedSrc : undefined}
      data-src={!priority ? processedSrc : undefined}
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${!priority ? 'transition-opacity duration-300 opacity-0 loaded:opacity-100' : ''}`}
      loading={priority ? "eager" : "lazy"}
      onLoad={(e) => {
        if (!priority) {
          (e.target as HTMLImageElement).classList.add('loaded');
        }
      }}
    />
  );
};

export default React.memo(OptimizedImage);
