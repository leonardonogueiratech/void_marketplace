import Link from "next/link";
import Image from "next/image";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
    description?: string | null;
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categorias/${category.slug}`}
      className="group relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-[#4a7c3f]/20 to-[#3a6b35]/30 border border-[#1e3a5f]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {category.image && (
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white font-semibold text-sm">{category.name}</p>
      </div>
    </Link>
  );
}
