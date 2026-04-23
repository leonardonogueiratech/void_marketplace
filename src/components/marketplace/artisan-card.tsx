import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Package } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ArtisanCardProps {
  artisan: {
    id: string;
    storeName: string;
    slug: string;
    bio?: string | null;
    logoImage?: string | null;
    bannerImage?: string | null;
    city?: string | null;
    state?: string | null;
    rating: number;
    totalSales: number;
    featured?: boolean;
    user: { name?: string | null };
    _count?: { products: number };
  };
}

export function ArtisanCard({ artisan }: ArtisanCardProps) {
  return (
    <Link
      href={`/artesao/${artisan.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-[#1e3a5f]/10 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-250"
    >
      {/* Banner */}
      <div className="relative h-28 bg-gradient-to-br from-[#4a7c3f]/20 to-[#1e3a5f]/20 overflow-hidden">
        {artisan.bannerImage ? (
          <Image
            src={artisan.bannerImage}
            alt={artisan.storeName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-400"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#4a7c3f]/30 via-[#1e3a5f]/20 to-[#e07b2a]/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {artisan.featured && (
          <Badge className="absolute top-2 right-2 bg-[#e07b2a] hover:bg-[#e07b2a] text-white text-xs">
            ✦ Destaque
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex gap-3">
        <Avatar className="size-14 -mt-8 border-2 border-white shadow-md shrink-0 ring-2 ring-[#f7f3ed]">
          <AvatarImage src={artisan.logoImage ?? undefined} />
          <AvatarFallback className="text-sm bg-[#4a7c3f]/15 text-[#4a7c3f] font-semibold">
            {getInitials(artisan.storeName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 pt-1">
          <h3 className="font-bold text-[#1e3a5f] truncate leading-tight">
            {artisan.storeName}
          </h3>
          <p className="text-xs text-muted-foreground truncate">{artisan.user.name}</p>
        </div>
      </div>

      <div className="px-4 pb-4 flex flex-col gap-2">
        {(artisan.city || artisan.state) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3 text-[#4a7c3f]" />
            <span>{[artisan.city, artisan.state].filter(Boolean).join(", ")}</span>
          </div>
        )}

        {artisan.bio && (
          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
            {artisan.bio}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 pt-1 border-t border-[#1e3a5f]/6">
          {artisan.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-neutral-600">{artisan.rating.toFixed(1)}</span>
            </div>
          )}
          {artisan.totalSales > 0 && (
            <span className="text-xs text-muted-foreground">{artisan.totalSales} vendas</span>
          )}
          {artisan._count && artisan._count.products > 0 && (
            <div className="flex items-center gap-1 ml-auto">
              <Package className="size-3 text-[#4a7c3f]" />
              <span className="text-xs text-[#4a7c3f] font-medium">{artisan._count.products}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
