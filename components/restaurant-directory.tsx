"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, ChevronRight, ShoppingCart, ArrowLeft, UtensilsCrossed } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { PromoDishCard } from "@/components/restaurant-directory/PromoDishCard"
import { RestaurantCard } from "@/components/restaurant-directory/RestaurantCard"
import { SaborSelectCard } from "@/components/restaurant-directory/SaborSelectCard"
import { FloatingCart } from "@/components/restaurant-directory/FloatingCart"
import { DishSelectionDrawer } from "@/components/restaurant-directory/DishSelectionDrawer"
import { useCartStore } from "@/store/cartStore"

export function RestaurantDirectory({ 
  initialCategorias, 
  initialComercios, 
  initialPlatillos 
}: { 
  initialCategorias: any[], 
  initialComercios: any[], 
  initialPlatillos: any[] 
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDish, setSelectedDish] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)
  const items = useCartStore((state) => state.items)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  // 1. Categorías
  const categories = useMemo(() => {
    const base = [{ id: "all", nombre: "Todos", imagen_url: null }]
    return [...base, ...initialCategorias]
  }, [initialCategorias])

  // 2. Sabor Select (Carrusel de Comercios Destacados)
  const saborSelectCommerces = useMemo(() => {
    return initialComercios
      .filter(c => c.es_destacado)
      .map(c => ({
        id: c.id,
        name: c.nombre,
        image: c.imagen_url,
        logo: c.logo_url,
        rating: c.rating || 4.5,
        deliveryTime: c.tiempo_entrega || "20-30 min",
        deliveryFee: c.costo_envio || 0
      }))
  }, [initialComercios])

  // 3. Deliofertas (Platillos populares o con descuento)
  const promoDishes = useMemo(() => {
    return initialPlatillos
      .filter(p => p.es_popular || (p.precio_original && p.precio_original > p.precio))
      .map(p => ({
        id: p.id,
        name: p.nombre,
        price: p.precio,
        originalPrice: p.precio_original,
        image: p.imagen_url,
        description: p.descripcion,
        comercioId: p.comercio_id
      }))
  }, [initialPlatillos])

  // 4. Feed Vertical (Todos los restaurantes)
  const feedCommerces = useMemo(() => {
    return initialComercios.map(c => ({
      id: c.id,
      name: c.nombre,
      image: c.imagen_url,
      logo: c.logo_url,
      rating: c.rating || 4.5,
      deliveryTime: c.tiempo_entrega || "20-30 min",
      deliveryFee: c.costo_envio || 0,
      // Mock data para UI
      promoActive: true
    }))
  }, [initialComercios])

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* 1. Header Persistente (Sticky) */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full active:scale-95">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            
            <div className="relative flex-1 flex items-center">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="¿Qué se te antoja hoy?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-l-full rounded-r-none border-border bg-secondary pl-10 pr-4 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Button className="h-11 rounded-l-none rounded-r-full bg-orange-500 hover:bg-orange-600 px-4 text-sm font-bold text-white shadow-sm transition-all active:scale-95">
                Buscar
              </Button>
            </div>

            <div className="relative shrink-0">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full active:scale-95">
                <ShoppingCart className="h-6 w-6" />
              </Button>
              {isMounted && totalItems > 0 && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white shadow-sm ring-2 ring-background">
                  {totalItems}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 2. Sección de Categorías (Circle Chips) */}
        <section>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="flex shrink-0 snap-start flex-col items-center gap-2 outline-none group"
              >
                <div className={`flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all group-active:scale-95 ${
                  selectedCategory === category.id || (selectedCategory === "all" && category.id === "all")
                    ? "border-orange-500 bg-orange-50"
                    : "border-border bg-secondary hover:border-orange-500/50"
                }`}>
                  {category.imagen_url ? (
                    <img src={category.imagen_url} alt={category.nombre} className="h-8 w-8 object-contain" />
                  ) : (
                    <UtensilsCrossed className={`h-6 w-6 ${selectedCategory === category.id ? "text-orange-500" : "text-muted-foreground"}`} />
                  )}
                </div>
                <span className={`text-[11px] font-bold ${
                  selectedCategory === category.id ? "text-orange-500" : "text-foreground/80"
                }`}>
                  {category.nombre}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 3. Sección 'Deliofertas' (Carrusel de Productos) */}
        {promoDishes.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-black italic tracking-tight text-foreground flex items-center gap-1">
                Deliofertas <ChevronRight className="h-5 w-5 text-orange-500" />
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x px-1">
              {promoDishes.map((dish) => (
                <PromoDishCard 
                  key={dish.id} 
                  dish={dish} 
                  onClick={(d) => setSelectedDish(d)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 4. Sección 'Sabor Select' (Carrusel de Negocios) */}
        {saborSelectCommerces.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-black italic tracking-tight text-foreground flex items-center gap-1">
                Sabor Select <ChevronRight className="h-5 w-5 text-orange-500" />
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x px-1">
              {saborSelectCommerces.map((commerce) => (
                <SaborSelectCard key={commerce.id} commerce={commerce} />
              ))}
            </div>
          </section>
        )}

        {/* 5. Barra de Filtros Dinámica */}
        <section className="sticky top-[73px] z-40 -mx-4 bg-background/95 px-4 py-3 backdrop-blur-md sm:mx-0 sm:px-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Button variant="outline" className="h-8 shrink-0 rounded-full border-border bg-card px-4 text-xs font-bold shadow-sm">
              Filtros
            </Button>
            <Button variant="outline" className="h-8 shrink-0 rounded-full border-border bg-card px-4 text-xs font-bold shadow-sm">
              Ordenar
            </Button>
            <Button variant="outline" className="h-8 shrink-0 rounded-full border-border bg-card px-4 text-xs font-bold shadow-sm">
              Más Populares
            </Button>
            <Button variant="outline" className="h-8 shrink-0 rounded-full border-border bg-card px-4 text-xs font-bold shadow-sm">
              Envío Gratis
            </Button>
          </div>
        </section>

        {/* 6. Feed Vertical (Lista de Restaurantes) */}
        <section>
          <h2 className="mb-4 text-xl font-black italic tracking-tight text-foreground">
            Todos los negocios
          </h2>
          <div className="flex flex-col gap-6">
            {feedCommerces.map((commerce) => (
              <RestaurantCard key={commerce.id} commerce={commerce} />
            ))}
          </div>
        </section>

      </main>

      <DishSelectionDrawer 
        dish={selectedDish} 
        isOpen={!!selectedDish} 
        onClose={() => setSelectedDish(null)} 
      />

      <FloatingCart />
    </div>
  )
}