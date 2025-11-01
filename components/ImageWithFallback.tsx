import Image from 'next/image';
import React, { useState } from 'react';

interface ImageWithFallbackProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> {
  src: string;
  width?: number;
  height?: number;
  fallback?: React.ReactNode;
}

export function ImageWithFallback({ src, alt = "", fallback, width = 1080, height = 1080, className }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return <>{fallback}</>;
  }

  return <Image src={src} alt={alt} width={width} height={height} onError={() => setError(true)} className={className} />;
}