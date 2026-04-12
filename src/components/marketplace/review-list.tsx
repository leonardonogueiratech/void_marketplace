import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, getInitials } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
  user: { name?: string | null; image?: string | null };
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="flex gap-4">
          <Avatar className="size-9 shrink-0">
            <AvatarImage src={review.user.image ?? undefined} />
            <AvatarFallback className="text-xs">
              {getInitials(review.user.name ?? "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-sm">{review.user.name ?? "Cliente"}</span>
              <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
            </div>
            <div className="flex mt-1 mb-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-3.5 ${
                    i < review.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-neutral-200"
                  }`}
                />
              ))}
            </div>
            {review.comment && (
              <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
