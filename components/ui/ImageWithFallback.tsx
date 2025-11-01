"use client";

import Image, { ImageProps } from "next/image";
import React, { useState } from "react";

interface ImageWithFallbackProps extends Omit<ImageProps, "src" | "alt"> {
  src?: string;
  fallbackSrc?: string;
  alt: string;
}

export function ImageWithFallback({
  src,
  fallbackSrc = "/placeholder.png",
  alt,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
      }}
    />
  );
}
