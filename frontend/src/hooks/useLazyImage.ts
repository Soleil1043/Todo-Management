import { useState, useEffect } from 'react';

/**
 * 延迟加载图片的钩子
 * @param src 图片源地址
 * @param placeholder 占位图地址（可选）
 * @returns { src: string, isLoaded: boolean, error: any }
 */
export function useLazyImage(src: string | null, placeholder: string = '') {
  const [loadedSrc, setLoadedSrc] = useState<string>(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!src) {
      setLoadedSrc(placeholder);
      setIsLoaded(false);
      return;
    }

    setIsLoaded(false);
    setError(null);

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setLoadedSrc(src);
      setIsLoaded(true);
    };

    img.onerror = (err) => {
      setError(err);
      setIsLoaded(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, placeholder]);

  return { src: loadedSrc, isLoaded, error };
}
