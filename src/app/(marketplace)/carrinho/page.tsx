"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="size-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h1>
        <p className="text-muted-foreground mb-6">
          Explore nossos produtos artesanais e adicione o que gostar!
        </p>
        <Button asChild>
          <Link href="/produtos">Explorar produtos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Carrinho ({items.length})</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 p-4 border border-border rounded-xl bg-white">
              <div className="relative size-20 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                <Image
                  src={item.image || "/placeholder-product.jpg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-amber-600 mb-0.5">{item.artisanName}</p>
                <h3 className="font-medium text-neutral-900 truncate">{item.name}</h3>
                <p className="text-sm font-semibold mt-1">{formatCurrency(item.price)}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-2 py-1.5 hover:bg-neutral-50 transition-colors"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium min-w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2 py-1.5 hover:bg-neutral-50 transition-colors"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:w-80">
          <div className="border border-border rounded-xl p-6 bg-white sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Resumo do pedido</h2>

            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-muted-foreground">
                  <span className="truncate flex-1 mr-2">
                    {item.name} x{item.quantity}
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(total())}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mb-4">
              <span>Frete</span>
              <span>Calculado no checkout</span>
            </div>

            <Separator className="mb-4" />

            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span>{formatCurrency(total())}</span>
            </div>

            <Button className="w-full" size="lg" asChild>
              <Link href="/checkout">
                Finalizar compra <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>

            <Button variant="ghost" className="w-full mt-2" asChild>
              <Link href="/produtos">Continuar comprando</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
