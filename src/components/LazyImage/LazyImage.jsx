import { useState, useRef, useEffect } from 'react'

/**
 * LazyImage component for lazy loading images
 * Improves performance by loading images only when they enter the viewport
 * Supports responsive images with srcset for better performance
 * 
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for accessibility
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 * @param {string} placeholder - Placeholder image (data URI or URL)
 * @param {boolean} useSrcset - Whether to generate srcset for responsive images (default: true for TMDB images)
 * @param {object} sizes - Sizes attribute for responsive images
 */
const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  style = {},
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%231a1a1a" width="400" height="300"/%3E%3C/svg%3E',
  useSrcset = true,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current)
      }
    }
  }, [])

  /**
   * Generate srcset for TMDB images or other responsive image sources
   * @param {string} imageSrc - Original image URL
   * @returns {string|null} Srcset string or null
   */
  const generateSrcset = (imageSrc) => {
    if (!useSrcset || !imageSrc) return null;
    
    // Check if it's a TMDB image
    if (imageSrc.includes('image.tmdb.org')) {
      // Extract base path (remove size prefix like /w500, /w342, etc.)
      const basePath = imageSrc.replace(/\/w\d+\//, '/');
      const baseUrl = basePath.split('/').slice(0, -1).join('/');
      const filename = basePath.split('/').pop();
      
      // Generate srcset with different sizes for responsive loading
      const sizes = ['w342', 'w500', 'w780'];
      return sizes.map(size => `${baseUrl}/${size}/${filename} ${size.replace('w', '')}w`).join(', ');
    }
    
    return null;
  };

  useEffect(() => {
    if (isInView && src) {
      // Use window.Image to avoid conflicts with React Bootstrap Image component
      const img = new window.Image()
      img.src = src
      img.onload = () => {
        setImageSrc(src)
        setIsLoaded(true)
      }
      img.onerror = () => {
        // Keep placeholder on error
        setIsLoaded(false)
      }
    }
  }, [isInView, src])
  
  const srcset = generateSrcset(src);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      srcSet={srcset || undefined}
      sizes={srcset ? sizes : undefined}
      alt={alt}
      className={`${className} ${isLoaded ? 'lazy-image-loaded' : 'lazy-image-loading'}`}
      style={{
        ...style,
        transition: 'opacity 0.3s ease-in-out',
        opacity: isLoaded ? 1 : 0.5,
      }}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )
}

export default LazyImage

