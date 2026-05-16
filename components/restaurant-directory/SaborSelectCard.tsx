import { Star } from "lucide-react"
import Link from "next/link"

export interface SaborSelectCommerce {
  id: string
  name: string
  image: string
  logo: string
  rating: number
  deliveryTime: string
  deliveryFee: number
}

interface SaborSelectCardProps {
  commerce: SaborSelectCommerce
}

export function SaborSelectCard({ commerce }: SaborSelectCardProps) {
  return (
    <Link href={`/restaurante/${commerce.id}`} className="block relative min-w-[14rem] w-56 flex-shrink-0 snap-start overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm transition-transform active:scale-[0.98]">
      <div className="relative h-28 w-full bg-secondary">
        <img
          src={commerce.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400"}
          alt={commerce.name}
          className="h-full w-full object-cover"
        />
        {/* Logo overlay */}
        <div className="absolute -bottom-4 left-3 h-10 w-10 overflow-hidden rounded-full border-2 border-card bg-background shadow-sm">
          <img
            src={commerce.logo || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100"}
            alt={`${commerce.name} logo`}
            className="h-full w-full object-cover"
          />
        </div>
        {/* Rating overlay */}
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-xs font-bold shadow-sm backdrop-blur-sm">
          <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
          <span>{commerce.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="px-3 pb-3 pt-6">
        <h4 className="mb-1 text-sm font-bold leading-tight line-clamp-1">{commerce.name}</h4>
        <p className="text-[11px] text-muted-foreground">
          {commerce.deliveryTime} • {commerce.deliveryFee === 0 ? "Envío gratis" : `$${commerce.deliveryFee.toFixed(2)} envío`}
        </p>
      </div>
    </Link>
  )
}
