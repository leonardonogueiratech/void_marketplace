"use client";

import { useState } from "react";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import Link from "next/link";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    artisanId: string;
    images: { url: string }[];
    artisan: { storeName: string };
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [qty, setQty] = useState(1);
  const { addItem, items } = useCartStore();
  const cartItem = items.find((i) => i.productId === product.id);
  const inCart = !!cartItem;

  function handleAdd() {
    addItem({
      id: product.id,
      productId: product.id,
      artisanId: product.artisanId,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url ?? "",
      stock: product.stock,
      artisanName: product.artisan.storeName,
    }, qty);
    toast.success("Adicionado ao carrinho!", {
      action: { label: "Ver carrinho", onClick: () => (window.location.href = "/carrinho") },
    });
  }

  if (product.stock === 0) {
    return (
      <Button disabled className="w-full" size="lg">
        Produto esgotado
      </Button>
    );
  }

  if (inCart) {
    return (
      <div className="flex gap-3">
        <Button size="lg" className="flex-1" variant="outline" asChild>
          <Link href="/carrinho">Ver no carrinho ({cartItem.quantity})</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex items-center border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => setQty(Math.max(1, qty - 1))}
          className="px-3 py-2 hover:bg-neutral-50 transition-colors"
        >
          <Minus className="size-4" />
        </button>
        <span className="px-4 py-2 font-medium min-w-10 text-center">{qty}</span>
        <button
          onClick={() => setQty(Math.min(product.stock, qty + 1))}
          className="px-3 py-2 hover:bg-neutral-50 transition-colors"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <Button size="lg" className="flex-1" onClick={handleAdd}>
        <ShoppingBag className="mr-2 size-5" />
        Adicionar ao carrinho
      </Button>
    </div>
  );
}
