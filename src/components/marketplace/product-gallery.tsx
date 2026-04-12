"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: { url: string; alt?: string | null }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-xl bg-neutral-100 flex items-center justify-center text-muted-foreground">
        Sem imagem
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100">
        <Image
          src={images[active].url}
          alt={images[active].alt ?? productName}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative size-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                i === active ? "border-primary" : "border-transparent hover:border-neutral-300"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${productName} ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
