"use client"

import { Plus } from "lucide-react"

interface Dish {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  image: string
  comercioId?: string
}

interface DishRowProps {
  dish: Dish
  onClick?: (dish: Dish) => void
}

export function DishRow({ dish, onClick }: DishRowProps) {

  return (
    <div 
      onClick={() => onClick && onClick(dish)}
      className="flex justify-between items-center py-4 border-b border-border/50 group hover:bg-secondary/20 transition-colors cursor-pointer"
    >
      <div className="flex-1 pr-4">
        <h4 className="font-bold text-foreground text-sm sm:text-base leading-tight mb-1">
          {dish.name}
        </h4>
        {dish.description && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-snug mb-2">
            {dish.description}
          </p>
        )}
        <div className="flex items-center gap-2">
          <span className="font-black text-orange-500 text-sm sm:text-base">
            ${dish.price.toFixed(2)}
          </span>
          {dish.originalPrice && dish.originalPrice > dish.price && (
            <span className="text-xs font-semibold text-muted-foreground line-through">
              ${dish.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      <div className="relative shrink-0">
        <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden bg-secondary border border-border/50">
          <img
            src={dish.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"}
            alt={dish.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick && onClick(dish);
          }}
          className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border shadow-sm text-orange-500 hover:bg-orange-500 hover:text-white transition-colors active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
