import React, { useState, useEffect, useRef } from 'react';
import '../styles/LazyImage.css';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholder?: string;
}

/**
 * 延迟加载图片组件
 * 支持占位图和渐入效果
 */
const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // 透明占位图
  alt, 
  className, 
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            setCurrentSrc(src);
            setIsLoaded(true);
          };
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px', // 提前 50px 开始加载
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [src]);

  return (
    <div className={`lazy-image-container ${isLoaded ? 'loaded' : 'loading'} ${className || ''}`}>
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={`lazy-image ${isLoaded ? 'visible' : 'hidden'}`}
        {...props}
      />
      {!isLoaded && <div className="lazy-image-placeholder-shimmer" />}
    </div>
  );
};

export default LazyImage;
