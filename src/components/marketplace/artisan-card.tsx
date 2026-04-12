import Link from "next/link";
import Image from "next/image";
import { Star, MapPin } from "lucide-react";
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
  };
}

export function ArtisanCard({ artisan }: ArtisanCardProps) {
  return (
    <Link
      href={`/artesao/${artisan.slug}`}
      className="group flex flex-col rounded-xl overflow-hidden border border-border bg-white hover:shadow-md transition-shadow"
    >
      {/* Banner */}
      <div className="relative h-28 bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden">
        {artisan.bannerImage && (
          <Image
            src={artisan.bannerImage}
            alt={artisan.storeName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        )}
        {artisan.featured && (
          <Badge className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-500 text-xs">
            ✦ Destaque
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex gap-3">
        <Avatar className="size-12 -mt-6 border-2 border-white shadow-sm shrink-0">
          <AvatarImage src={artisan.logoImage ?? undefined} />
          <AvatarFallback className="text-sm bg-amber-100 text-amber-700">
            {getInitials(artisan.storeName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 truncate">
            {artisan.storeName}
          </h3>
          {(artisan.city || artisan.state) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="size-3" />
              <span>{[artisan.city, artisan.state].filter(Boolean).join(", ")}</span>
            </div>
          )}
          {artisan.bio && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
              {artisan.bio}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            {artisan.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                <span className="text-xs text-muted-foreground">{artisan.rating.toFixed(1)}</span>
              </div>
            )}
            {artisan.totalSales > 0 && (
              <span className="text-xs text-muted-foreground">
                {artisan.totalSales} vendas
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
