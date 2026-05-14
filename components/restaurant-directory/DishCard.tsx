import { Heart, Star, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface Dish {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  rating: number
  restaurant: string
  comercioId?: string
  restaurantLogo: string
  prepTime: string
  isPopular?: boolean
  isNew?: boolean
}

interface DishCardProps {
  dish: Dish
  onFavorite: (id: string) => void
  isFavorite: boolean
  onClick?: (dish: Dish) => void
}

export function DishCard({ dish, onFavorite, isFavorite, onClick }: DishCardProps) {
  return (
    <div 
      className="group relative overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
      onClick={() => onClick && onClick(dish)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={dish.image}
          alt={dish.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {dish.isPopular && <Badge className="bg-primary text-primary-foreground border-0">Popular</Badge>}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(dish.id);
          }}
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all duration-200 hover:bg-background",
            isFavorite && "text-primary"
          )}
        >
          <Heart className={cn("h-5 w-5", isFavorite && "fill-primary")} />
        </button>
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex items-center gap-1.5 sm:gap-2 rounded-full bg-background/90 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5">
          <span className="text-sm sm:text-lg hidden sm:inline">🏠</span>
          <span className="text-[10px] sm:text-xs font-bold sm:font-medium text-foreground truncate max-w-[80px] sm:max-w-[120px]">{dish.restaurant}</span>
        </div>
      </div>

      <div className="p-3 sm:p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="mb-1 sm:mb-2 flex items-start justify-between gap-1 sm:gap-2">
            <h3 className="font-bold text-foreground text-sm sm:text-lg leading-tight line-clamp-2 sm:line-clamp-1">{dish.name}</h3>
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-1.5 sm:px-2 py-0.5">
              <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-[10px] sm:text-xs font-bold text-foreground">{dish.rating}</span>
            </div>
          </div>
          <p className="mb-3 sm:mb-4 line-clamp-2 text-[11px] sm:text-sm text-muted-foreground leading-snug sm:leading-relaxed">{dish.description}</p>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">{dish.prepTime}</span>
          </div>
          <p className="text-base sm:text-xl font-black text-orange-500">${dish.price}</p>
        </div>
      </div>
    </div>
  )
}
