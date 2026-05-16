import { Star } from "lucide-react"
import Link from "next/link"

export interface FeedCommerce {
  id: string
  name: string
  image: string
  logo?: string
  rating: number
  deliveryTime: string
  deliveryFee: number
  // Mock fields as requested
  ordersMock?: string
  promoActive?: boolean
}

interface RestaurantCardProps {
  commerce: FeedCommerce
}

export function RestaurantCard({ commerce }: RestaurantCardProps) {
  return (
    <Link href={`/restaurante/${commerce.id}`} className="block group relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-orange-500/50 hover:shadow-md active:scale-[0.99] cursor-pointer">
      <div className="relative h-40 w-full sm:h-48">
        <img
          src={commerce.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"}
          alt={commerce.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Promo tag */}
        {commerce.promoActive && (
          <div className="absolute left-3 top-3 rounded-full bg-orange-500 px-2 py-1 text-xs font-bold text-white shadow-sm">
            Promoción activa
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold leading-tight line-clamp-1">{commerce.name}</h3>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-1">
            <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
            <span className="text-sm font-bold">{commerce.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{commerce.deliveryTime}</span>
          <span>•</span>
          <span>
            {commerce.deliveryFee === 0 ? "Envío gratis" : `$${commerce.deliveryFee.toFixed(2)}`}
          </span>
          <span>•</span>
          <span>400 pedidos</span>
        </div>
      </div>
    </Link>
  )
}
