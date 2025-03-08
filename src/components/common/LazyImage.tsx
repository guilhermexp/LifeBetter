import React, { useState, useEffect, useRef, memo } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/home/SkeletonLoaders';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Source URL of the image */
  src: string;
  /** Alternative text for the image */
  alt: string;
  /** Placeholder image to show while loading */
  placeholder?: string;
  /** Whether to blur the image while loading */
  blur?: boolean;
  /** Whether to fade in the image when loaded */
  fadeIn?: boolean;
  /** Whether to use a skeleton while loading */
  skeleton?: boolean;
  /** Whether to lazy load the image */
  lazy?: boolean;
  /** Whether to use native lazy loading */
  nativeLazy?: boolean;
  /** Whether to use low quality image placeholder */
  lqip?: boolean;
  /** Low quality image placeholder URL */
  lqipSrc?: string;
  /** Whether to use progressive loading */
  progressive?: boolean;
  /** Whether to use WebP format if supported */
  webp?: boolean;
  /** Whether to use AVIF format if supported */
  avif?: boolean;
  /** Callback when image is loaded */
  onLoaded?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
  /** CSS class name for the container */
  containerClassName?: string;
  /** CSS class name for the image */
  imageClassName?: string;
  /** CSS class name for the placeholder */
  placeholderClassName?: string;
}

/**
 * Optimized image component with lazy loading and progressive enhancement
 * 
 * Features:
 * - Lazy loading with IntersectionObserver
 * - Progressive loading with low quality placeholders
 * - Skeleton loading state
 * - Blur-up effect
 * - Fade-in animation
 * - WebP and AVIF support
 * - Fallback for older browsers
 */
const LazyImageComponent: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = '/placeholder.svg',
  blur = true,
  fadeIn = true,
  skeleton = true,
  lazy = true,
  nativeLazy = true,
  lqip = false,
  lqipSrc,
  progressive = true,
  webp = true,
  avif = true,
  onLoaded,
  onError,
  containerClassName,
  imageClassName,
  placeholderClassName,
  width,
  height,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Load images 200px before they come into view
        threshold: 0.01,
      }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [lazy, isInView]);
  
  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoaded) onLoaded();
  };
  
  // Handle image error
  const handleError = () => {
    setError(true);
    if (onError) onError();
  };
  
  // Determine the best image format based on browser support
  const getSrcSet = () => {
    if (!progressive) return undefined;
    
    const formats = [];
    
    // Add AVIF format if enabled
    if (avif) {
      const avifSrc = src.replace(/\.(jpe?g|png|gif|webp)$/i, '.avif');
      formats.push(`${avifSrc} 1x`);
    }
    
    // Add WebP format if enabled
    if (webp) {
      const webpSrc = src.replace(/\.(jpe?g|png|gif)$/i, '.webp');
      formats.push(`${webpSrc} 1x`);
    }
    
    // Add original format
    formats.push(`${src} 1x`);
    
    return formats.join(', ');
  };
  
  // Determine the image sizes for responsive images
  const getSizes = () => {
    if (!progressive) return undefined;
    
    return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw';
  };
  
  // Render the component
  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        containerClassName
      )}
      style={{
        width: width,
        height: height,
      }}
    >
      {/* Skeleton loader */}
      {!isLoaded && skeleton && (
        <Skeleton
          className={cn(
            'absolute inset-0 z-10',
            placeholderClassName
          )}
        />
      )}
      
      {/* Low quality image placeholder */}
      {!isLoaded && lqip && lqipSrc && (
        <img
          src={lqipSrc}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full object-cover',
            blur && 'blur-md',
            placeholderClassName
          )}
          aria-hidden="true"
        />
      )}
      
      {/* Placeholder image */}
      {!isLoaded && !lqip && placeholder && (
        <img
          src={placeholder}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full object-cover',
            blur && 'blur-sm',
            placeholderClassName
          )}
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      {(isInView || !lazy) && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          srcSet={getSrcSet()}
          sizes={getSizes()}
          loading={nativeLazy ? 'lazy' : undefined}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover',
            !isLoaded && 'opacity-0',
            isLoaded && fadeIn && 'transition-opacity duration-500 opacity-100',
            error && 'hidden',
            imageClassName
          )}
          {...props}
        />
      )}
      
      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-sm text-muted-foreground">
            Failed to load image
          </span>
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const LazyImage = memo(LazyImageComponent);
