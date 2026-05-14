"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoriaNavProps {
  categorias: string[]
  categoriaActiva: string
  onCategoriaChange: (categoria: string) => void
}

export function CategoriaNav({
  categorias,
  categoriaActiva,
  onCategoriaChange,
}: CategoriaNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="relative group">
      {/* Left Scroll Button */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background/90 backdrop-blur-md border border-border rounded-full shadow-lg flex items-center justify-center text-foreground hover:bg-secondary transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 hidden sm:flex"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Categories Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-1 scroll-smooth"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {categorias.map((categoria) => (
          <Button
            key={categoria}
            onClick={() => onCategoriaChange(categoria)}
            variant={categoriaActiva === categoria ? "default" : "outline"}
            className={cn(
              "flex-shrink-0 rounded-2xl px-6 py-5 font-medium transition-all duration-300 whitespace-nowrap",
              categoriaActiva === categoria
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                : "bg-card border-border text-foreground hover:bg-secondary hover:border-primary/30"
            )}
          >
            {categoria}
          </Button>
        ))}
      </div>

      {/* Right Scroll Button */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background/90 backdrop-blur-md border border-border rounded-full shadow-lg flex items-center justify-center text-foreground hover:bg-secondary transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 hidden sm:flex"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
