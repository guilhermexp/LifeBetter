import { memo, useMemo } from 'react';
import { LazyImage } from './LazyImage';

interface ImageFormat {
  format: 'webp' | 'avif' | 'jpeg' | 'png' | 'original';
  quality?: number;
}

interface ResponsiveBreakpoint {
  width: number;
  src: string;
}

interface OptimizedImageProps {
  /** Main image source */
  src: string;
  /** Alt text for the image */
  alt: string;
  /** CSS class name */
  className?: string;
  /** Placeholder image to show while loading */
  placeholderSrc?: string;
  /** Width of the image */
  width?: number | string;
  /** Height of the image */
  height?: number | string;
  /** Callback when image is loaded */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
  /** Whether to blur the image while loading */
  blurEffect?: boolean;
  /** Responsive breakpoints for different screen sizes */
  breakpoints?: ResponsiveBreakpoint[];
  /** Image formats to try (in order of preference) */
  formats?: ImageFormat[];
  /** Whether to lazy load the image */
  lazy?: boolean;
  /** Loading strategy */
  loading?: 'lazy' | 'eager';
  /** Whether to use native lazy loading */
  useNativeLazy?: boolean;
}

/**
 * OptimizedImage component for advanced image optimization
 * 
 * Features:
 * - All LazyImage features (lazy loading, placeholders, etc.)
 * - Responsive images with different sources for different screen sizes
 * - Modern image format support (WebP, AVIF)
 * - Automatic quality optimization
 * - Blur-up effect
 */
const OptimizedImageComponent = ({
  src,
  alt,
  className = '',
  placeholderSrc = '/placeholder.svg',
  width,
  height,
  onLoad,
  onError,
  blurEffect = false,
  breakpoints = [],
  formats = [{ format: 'original' }],
  lazy = true,
  loading = 'lazy',
  useNativeLazy = false,
}: OptimizedImageProps) => {
  // Generate srcset for responsive images
  const srcSet = useMemo(() => {
    if (breakpoints.length === 0) return undefined;
    
    return breakpoints
      .map((bp) => `${bp.src} ${bp.width}w`)
      .join(', ');
  }, [breakpoints]);
  
  // Generate sizes attribute for responsive images
  const sizes = useMemo(() => {
    if (breakpoints.length === 0) return undefined;
    
    return breakpoints
      .map((bp, index) => {
        // For the last breakpoint, don't add a media query
        if (index === breakpoints.length - 1) {
          return `${bp.width}px`;
        }
        
        const nextBreakpoint = breakpoints[index + 1];
        return `(max-width: ${nextBreakpoint.width}px) ${bp.width}px`;
      })
      .join(', ');
  }, [breakpoints]);
  
  // Generate picture element with source elements for different formats
  if (formats.length > 1) {
    return (
      <picture>
        {formats.map((format, index) => {
          if (format.format === 'original') return null;
          
          // Skip original format as it will be handled by the img element
          return (
            <source
              key={format.format}
              type={`image/${format.format}`}
              srcSet={srcSet}
              sizes={sizes}
            />
          );
        })}
        
        {/* Fallback image using LazyImage */}
        <LazyImage
          src={src}
          alt={alt}
          className={`${className} ${blurEffect ? 'filter blur-sm animate-unblur' : ''}`}
          placeholder={placeholderSrc}
          width={width}
          height={height}
          onLoaded={onLoad}
          onError={onError}
          lazy={lazy}
          nativeLazy={useNativeLazy}
          blur={blurEffect}
          fadeIn={true}
        />
      </picture>
    );
  }
  
  // If no multiple formats, just use LazyImage directly
  return (
    <LazyImage
      src={src}
      alt={alt}
      className={`${className} ${blurEffect ? 'filter blur-sm animate-unblur' : ''}`}
      placeholder={placeholderSrc}
      width={width}
      height={height}
      onLoaded={onLoad}
      onError={onError}
      lazy={lazy}
      nativeLazy={useNativeLazy}
      blur={blurEffect}
      fadeIn={true}
    />
  );
};

// Memoize the component to prevent unnecessary re-renders
export const OptimizedImage = memo(OptimizedImageComponent);
