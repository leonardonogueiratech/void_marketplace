"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: {
    id: string;
    artisanId: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    rating: number;
    images: { url: string; alt?: string | null }[];
    artisan: { storeName: string; slug: string };
    featured?: boolean;
    stock: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const imageUrl = product.images[0]?.url ?? "/placeholder-product.jpg";
  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem({
      id: product.id,
      productId: product.id,
      artisanId: product.artisanId,
      name: product.name,
      price: product.price,
      image: imageUrl,
      stock: product.stock,
      artisanName: product.artisan.storeName,
    });
    toast.success("Adicionado ao carrinho!");
  }

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group relative flex flex-col rounded-xl overflow-hidden border border-border bg-white hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <Image
          src={imageUrl}
          alt={product.images[0]?.alt ?? product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {discount && (
          <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-500">
            -{discount}%
          </Badge>
        )}
        {product.featured && (
          <Badge className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-500">
            Destaque
          </Badge>
        )}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-2 right-2 size-9 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white"
        >
          <ShoppingBag className="size-4" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs text-muted-foreground truncate">{product.artisan.storeName}</p>
        <h3 className="text-sm font-medium text-neutral-900 leading-tight line-clamp-2">
          {product.name}
        </h3>

        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span className="text-xs text-muted-foreground">{product.rating.toFixed(1)}</span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-auto pt-1">
          <span className="font-semibold text-neutral-900">
            {formatCurrency(product.price)}
          </span>
          {product.comparePrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
