import { Plus } from "lucide-react"

interface PromoDish {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  description?: string
  comercioId?: string
}

interface PromoDishCardProps {
  dish: PromoDish
  onClick?: (dish: PromoDish) => void
}

export function PromoDishCard({ dish, onClick }: PromoDishCardProps) {

  // Calculate discount percentage if original price exists
  const discountPercentage = dish.originalPrice && dish.originalPrice > dish.price
    ? Math.round(((dish.originalPrice - dish.price) / dish.originalPrice) * 100)
    : 0

  return (
    <div 
      onClick={() => onClick && onClick(dish)}
      className="group relative min-w-[16rem] w-64 flex-shrink-0 snap-start overflow-hidden rounded-[1.5rem] bg-card border border-border shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
        <img
          src={dish.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"}
          alt={dish.name}
          className="h-full w-full object-cover"
        />
        {/* Description Hover Overlay */}
        {dish.description && (
          <div className="absolute inset-0 bg-black/60 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
            <p className="text-white text-xs text-center line-clamp-4 font-medium drop-shadow-md">
              {dish.description}
            </p>
          </div>
        )}
        
        {discountPercentage > 0 && (
          <div className="absolute left-2 top-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-black text-white shadow-sm z-10">
            {discountPercentage}% OFF
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="mb-1 text-sm font-bold leading-tight line-clamp-2">{dish.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-orange-500">${dish.price.toFixed(2)}</span>
          {dish.originalPrice && dish.originalPrice > dish.price && (
            <span className="text-xs font-semibold text-muted-foreground line-through">
              ${dish.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick && onClick(dish);
        }}
        className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-md shadow-orange-500/30 transition-transform hover:scale-105 active:scale-95 z-10"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  )
}
