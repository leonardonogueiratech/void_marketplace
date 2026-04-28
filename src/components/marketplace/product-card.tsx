"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag, Star, Heart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

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
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [wishlisted, setWishlisted] = useState(false);
  const imageUrl = product.images[0]?.url ?? "/placeholder-product.jpg";
  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;
  const outOfStock = product.stock === 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
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

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    setWishlisted((v) => !v);
    toast.success(wishlisted ? "Removido dos favoritos" : "Salvo nos favoritos");
  }

  return (
    <div
      onClick={() => router.push(`/produto/${product.slug}`)}
      className="group relative flex flex-col rounded-2xl overflow-hidden border border-[#1e3a5f]/10 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-250 cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#f7f3ed]">
        <Image
          src={imageUrl}
          alt={product.images[0]?.alt ?? product.name}
          fill
          className={`object-cover transition-transform duration-400 group-hover:scale-105 ${outOfStock ? "opacity-50" : ""}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40">
            <span className="text-xs font-semibold text-neutral-500 bg-white/90 px-2 py-1 rounded-full">
              Esgotado
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && (
            <Badge className="bg-[#e07b2a] hover:bg-[#e07b2a] text-white text-xs px-1.5 py-0.5">
              -{discount}%
            </Badge>
          )}
          {product.featured && !discount && (
            <Badge className="bg-[#27ae60] hover:bg-[#27ae60] text-white text-xs px-1.5 py-0.5">
              Destaque
            </Badge>
          )}
        </div>

        {/* Action buttons — appear on hover */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleWishlist}
            className={`size-8 rounded-full shadow-md flex items-center justify-center transition-colors ${
              wishlisted
                ? "bg-rose-500 text-white"
                : "bg-white text-neutral-400 hover:text-rose-500"
            }`}
            title="Salvar nos favoritos"
          >
            <Heart className={`size-3.5 ${wishlisted ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Add to cart button */}
        {!outOfStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-[#1e3a5f] text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#162d4a]"
          >
            <ShoppingBag className="size-3.5" />
            Adicionar
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1">
        <Link
          href={`/artesao/${product.artisan.slug}`}
          className="text-xs text-[#27ae60] font-medium hover:underline truncate"
          onClick={(e) => e.stopPropagation()}
        >
          {product.artisan.storeName}
        </Link>
        <h3 className="text-sm font-medium text-[#1e3a5f] leading-snug line-clamp-2">
          {product.name}
        </h3>

        {product.rating > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`size-3 ${
                    star <= Math.round(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-neutral-200 text-neutral-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{product.rating.toFixed(1)}</span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold text-[#1e3a5f]">
            {formatCurrency(product.price)}
          </span>
          {product.comparePrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
