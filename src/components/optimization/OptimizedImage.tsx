import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // Pour les images above-the-fold
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Composant d'image optimisé avec lazy loading intelligent
 * - Lazy loading uniquement pour les images below-the-fold
 * - Support WebP avec fallback
 * - Placeholder blur pour une meilleure UX
 * - Responsive images avec srcSet
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  sizes = '100vw',
  quality = 80,
  loading = 'lazy',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer pour le lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Charger 50px avant d'être visible
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, loading]);

  // Génération du srcSet pour les images responsives
  const generateSrcSet = (baseSrc: string) => {
    if (!width) return baseSrc;
    
    const widths = [320, 640, 768, 1024, 1280, 1536];
    return widths
      .filter(w => w <= width * 2) // Limiter aux tailles raisonnables
      .map(w => `${baseSrc}?w=${w}&q=${quality} ${w}w`)
      .join(', ');
  };

  // Conversion WebP avec fallback
  const getWebPSrc = (originalSrc: string) => {
    if (originalSrc.includes('data:') || originalSrc.includes('blob:')) {
      return originalSrc;
    }
    
    // Ajouter les paramètres d'optimisation
    const url = new URL(originalSrc, window.location.origin);
    url.searchParams.set('f', 'webp');
    url.searchParams.set('q', quality.toString());
    
    return url.toString();
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Placeholder blur
  const blurStyle = {
    backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(10px)',
    transform: 'scale(1.1)',
  };

  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
        style={{ width, height }}
        role="img"
        aria-label={`Erreur de chargement: ${alt}`}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {/* Placeholder blur */}
      {!isLoaded && placeholder === 'blur' && (
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={blurStyle}
          aria-hidden="true"
        />
      )}

      {/* Image principale */}
      {isInView && (
        <picture>
          {/* WebP source pour les navigateurs supportés */}
          <source
            srcSet={generateSrcSet(getWebPSrc(src))}
            sizes={sizes}
            type="image/webp"
          />
          
          {/* Image de fallback */}
          <img
            src={src}
            srcSet={generateSrcSet(src)}
            sizes={sizes}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            decoding="async"
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              // Éviter le layout shift
              aspectRatio: width && height ? `${width}/${height}` : undefined,
            }}
          />
        </picture>
      )}

      {/* Skeleton loader pour les images sans placeholder */}
      {!isLoaded && placeholder === 'empty' && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default OptimizedImage;
