
/**
 * Performance utility functions for monitoring and optimizing app performance
 */

/**
 * Reports web vitals metrics
 */
export const reportWebVitals = (metric: any) => {
  // You can send to an analytics service here
  console.log(metric);
};

/**
 * Lazy loads images when they enter the viewport
 */
export const lazyLoadImage = (imageElement: HTMLImageElement) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.getAttribute('data-src');
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });

  observer.observe(imageElement);
};

/**
 * Creates an image loader component for optimized image loading
 */
export const createImageLoader = (url: string, width?: number, quality?: number) => {
  return `${url}${width ? `?w=${width}` : ''}${quality ? `&q=${quality}` : ''}`;
};

/**
 * Preloads critical resources for routes
 */
export const preloadResources = (resources: string[]) => {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.js') ? 'script' : 'style';
    document.head.appendChild(link);
  });
};

/**
 * Registers performance observer to monitor long tasks
 */
export const monitorLongTasks = () => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          console.log('Long task detected:', entry.duration, 'ms');
        });
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      return observer;
    } catch (e) {
      console.error('PerformanceObserver for longtasks not supported', e);
    }
  }
  return null;
};
