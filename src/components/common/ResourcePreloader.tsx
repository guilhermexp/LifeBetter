import { memo, useEffect, useState } from 'react';

interface ResourcePreloaderProps {
  /** URLs of resources to preload */
  resources?: string[];
  /** Font families to preload */
  fonts?: {
    family: string;
    weight?: string;
    style?: string;
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  }[];
  /** Whether to show a loading indicator */
  showIndicator?: boolean;
  /** Callback when all resources are loaded */
  onLoaded?: () => void;
}

/**
 * Component for preloading resources like images, fonts, and icons
 * 
 * Features:
 * - Preloads images, fonts, and other resources
 * - Improves initial load performance
 * - Prevents layout shifts
 */
const ResourcePreloaderComponent = ({
  resources = [],
  fonts = [],
  showIndicator = false,
  onLoaded,
}: ResourcePreloaderProps) => {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Skip if no resources to load
    if (resources.length === 0 && fonts.length === 0) {
      setLoaded(true);
      onLoaded?.();
      return;
    }

    // Preload fonts
    const fontPromises = fonts.map((font) => {
      return new Promise<void>((resolve) => {
        const fontFace = new FontFace(
          font.family,
          `url(${font.family})`,
          {
            weight: font.weight || 'normal',
            style: font.style || 'normal',
            display: font.display || 'swap',
          }
        );

        fontFace.load()
          .then((loadedFace) => {
            // Add font to document
            document.fonts.add(loadedFace);
            resolve();
          })
          .catch((error) => {
            console.error(`Failed to load font: ${font.family}`, error);
            resolve(); // Resolve anyway to continue loading other resources
          });
      });
    });

    // Preload other resources (images, etc.)
    const resourcePromises = resources.map((url) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve();
        img.onerror = () => {
          console.error(`Failed to load resource: ${url}`);
          resolve(); // Resolve anyway to continue loading other resources
        };
      });
    });

    // Combine all promises
    const allPromises = [...fontPromises, ...resourcePromises];
    const totalCount = allPromises.length;
    let loadedCount = 0;

    // Track progress
    allPromises.forEach((promise) => {
      promise.then(() => {
        loadedCount++;
        const newProgress = Math.round((loadedCount / totalCount) * 100);
        setProgress(newProgress);
        
        if (loadedCount === totalCount) {
          setLoaded(true);
          onLoaded?.();
        }
      });
    });

    // If all promises resolve immediately (e.g. cached resources)
    Promise.all(allPromises).then(() => {
      setLoaded(true);
      onLoaded?.();
    });
  }, [resources, fonts, onLoaded]);

  // Only render indicator if requested
  if (!showIndicator) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-full shadow-md transition-opacity duration-300 ${
        loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ zIndex: 9999 }}
    >
      <div className="relative h-8 w-8 flex items-center justify-center">
        {/* Circular progress indicator */}
        <svg className="absolute inset-0" viewBox="0 0 32 32">
          <circle
            className="text-gray-200 dark:text-gray-700"
            strokeWidth="2"
            stroke="currentColor"
            fill="transparent"
            r="14"
            cx="16"
            cy="16"
          />
          <circle
            className="text-primary"
            strokeWidth="2"
            strokeDasharray={88}
            strokeDashoffset={88 - (progress / 100) * 88}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="14"
            cx="16"
            cy="16"
          />
        </svg>
        <span className="text-xs font-medium">{progress}%</span>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const ResourcePreloader = memo(ResourcePreloaderComponent);
