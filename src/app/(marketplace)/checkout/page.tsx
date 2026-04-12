"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { Loader2, CreditCard, QrCode, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type PaymentMethod = "CREDIT_CARD" | "PIX" | "BOLETO";

interface OrderResult {
  orderId: string;
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  boletoUrl?: string;
  boletoBarcode?: string;
  method: PaymentMethod;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("PIX");
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  const [address, setAddress] = useState({
    street: "", number: "", complement: "", district: "", city: "", state: "", zipCode: "",
  });

  const [card, setCard] = useState({
    number: "", name: "", expiry: "", cvv: "", installments: "1",
  });

  if (items.length === 0 && !orderResult) {
    router.push("/carrinho");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            artisanId: i.artisanId,
            quantity: i.quantity,
            unitPrice: i.price,
          })),
          address,
          paymentMethod: method,
          cardData: method === "CREDIT_CARD" ? card : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erro ao processar pedido.");
        return;
      }

      clearCart();
      setOrderResult({ ...data, method });
    } catch {
      toast.error("Erro ao processar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (orderResult) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle2 className="size-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Pedido realizado!</h1>
        <p className="text-muted-foreground mb-8">
          Pedido #{orderResult.orderId.slice(-8).toUpperCase()}
        </p>

        {orderResult.method === "PIX" && orderResult.pixQrCode && (
          <Card className="text-left">
            <CardHeader><CardTitle className="flex items-center gap-2"><QrCode className="size-5" /> Pagar com PIX</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {orderResult.pixQrCodeBase64 && (
                <div className="flex justify-center">
                  <Image
                    src={`data:image/png;base64,${orderResult.pixQrCodeBase64}`}
                    alt="QR Code PIX"
                    width={192}
                    height={192}
                    unoptimized
                    className="size-48"
                  />
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Código copia e cola:</p>
                <div className="bg-neutral-50 rounded p-3 text-xs font-mono break-all border">
                  {orderResult.pixQrCode}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(orderResult.pixQrCode!);
                    toast.success("Código copiado!");
                  }}
                >
                  Copiar código
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {orderResult.method === "BOLETO" && orderResult.boletoUrl && (
          <Card className="text-left">
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="size-5" /> Boleto Bancário</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {orderResult.boletoBarcode && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Linha digitável:</p>
                  <div className="bg-neutral-50 rounded p-3 text-xs font-mono break-all border">
                    {orderResult.boletoBarcode}
                  </div>
                </div>
              )}
              <Button asChild className="w-full">
                <a href={orderResult.boletoUrl} target="_blank" rel="noopener noreferrer">
                  Visualizar boleto
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {orderResult.method === "CREDIT_CARD" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 font-medium">Pagamento aprovado!</p>
            <p className="text-sm text-green-600 mt-1">Seu pedido está sendo processado.</p>
          </div>
        )}

        <Button className="mt-8 w-full" onClick={() => router.push("/conta/pedidos")}>
          Ver meus pedidos
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            {/* Address */}
            <Card>
              <CardHeader><CardTitle>Endereço de entrega</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>CEP</Label>
                  <Input required placeholder="00000-000" value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Rua / Avenida</Label>
                  <Input required value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Número</Label>
                  <Input required value={address.number} onChange={(e) => setAddress({ ...address, number: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Complemento</Label>
                  <Input value={address.complement} onChange={(e) => setAddress({ ...address, complement: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Bairro</Label>
                  <Input required value={address.district} onChange={(e) => setAddress({ ...address, district: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Cidade</Label>
                  <Input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Estado (UF)</Label>
                  <Input required maxLength={2} placeholder="SP" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })} />
                </div>
              </CardContent>
            </Card>

            {/* Payment method */}
            <Card>
              <CardHeader><CardTitle>Forma de pagamento</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  {([
                    { id: "PIX", icon: QrCode, label: "PIX" },
                    { id: "CREDIT_CARD", icon: CreditCard, label: "Cartão" },
                    { id: "BOLETO", icon: FileText, label: "Boleto" },
                  ] as const).map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setMethod(id)}
                      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        method === id ? "border-primary bg-primary/5" : "border-border hover:border-neutral-300"
                      }`}
                    >
                      <Icon className="size-6" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>

                {method === "PIX" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
                    ⚡ PIX tem confirmação instantânea! O QR code será exibido após confirmar o pedido.
                  </div>
                )}

                {method === "BOLETO" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
                    📄 Boleto vence em 3 dias úteis. Pedido confirmado após compensação.
                  </div>
                )}

                {method === "CREDIT_CARD" && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Número do cartão</Label>
                      <Input
                        required
                        placeholder="0000 0000 0000 0000"
                        value={card.number}
                        onChange={(e) => setCard({ ...card, number: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Nome no cartão</Label>
                      <Input
                        required
                        placeholder="Como está no cartão"
                        value={card.name}
                        onChange={(e) => setCard({ ...card, name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5 col-span-1">
                        <Label>Validade</Label>
                        <Input required placeholder="MM/AA" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
                      </div>
                      <div className="space-y-1.5 col-span-1">
                        <Label>CVV</Label>
                        <Input required placeholder="123" maxLength={4} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
                      </div>
                      <div className="space-y-1.5 col-span-1">
                        <Label>Parcelas</Label>
                        <select
                          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                          value={card.installments}
                          onChange={(e) => setCard({ ...card, installments: e.target.value })}
                        >
                          {[1, 2, 3, 6, 12].map((n) => (
                            <option key={n} value={n}>
                              {n}x {n === 1 ? "(sem juros)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order summary */}
          <div className="lg:w-80">
            <Card className="sticky top-24">
              <CardHeader><CardTitle>Resumo</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="relative size-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                      <Image src={item.image || "/placeholder-product.jpg"} alt={item.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total())}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Frete</span>
                  <span>A combinar com o artesão</span>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(total())}</span>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Confirmar pedido
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
