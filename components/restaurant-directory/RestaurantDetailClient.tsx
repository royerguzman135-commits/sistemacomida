"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { ArrowLeft, Star, Clock, Info } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FloatingCart } from "@/components/restaurant-directory/FloatingCart"
import { DishRow } from "@/components/restaurant-directory/DishRow"
import { DishSelectionDrawer } from "@/components/restaurant-directory/DishSelectionDrawer"

interface ComercioDetail {
  id: string
  nombre: string
  imagen_url: string
  logo_url?: string
  rating: number
  tiempo_entrega: string
  costo_envio?: number
}

interface DishDetail {
  id: string
  nombre: string
  descripcion: string
  precio: number
  precio_original: number
  imagen_url: string
  categoria: string
  comercio_id: string
}

export function RestaurantDetailClient({ 
  comercio, 
  platillos 
}: { 
  comercio: ComercioDetail
  platillos: DishDetail[]
}) {
  const [activeCategory, setActiveCategory] = useState<string>("")
  const [selectedDish, setSelectedDish] = useState<any>(null)
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({})

  // Agrupar platillos por categoría
  const groupedDishes = useMemo(() => {
    const groups: Record<string, DishDetail[]> = {}
    platillos.forEach(dish => {
      const cat = dish.categoria || "Otros"
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(dish)
    })
    return groups
  }, [platillos])

  const categories = Object.keys(groupedDishes)

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0])
    }
  }, [categories, activeCategory])

  const scrollToCategory = (category: string) => {
    setActiveCategory(category)
    const element = categoryRefs.current[category]
    if (element) {
      // Ajuste por el header sticky y la barra de navegación sticky (aprox 120px)
      const offset = 130
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
  }

  // Opcional: IntersectionObserver para actualizar la categoría activa durante el scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-130px 0px -60% 0px" // Ajustar márgenes para detectar qué sección está "activa"
      }
    )

    categories.forEach(cat => {
      const el = categoryRefs.current[cat]
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [categories])

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 relative">
      {/* 1. Header Fijo (Boton volver) */}
      <div className="fixed top-3 left-3 sm:top-6 sm:left-6 z-50">
        <Link href="/">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md border-border shadow-sm text-foreground active:scale-95 transition-transform hover:bg-background">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* 2. Hero Section */}
      <div className="relative h-48 sm:h-64 w-full bg-secondary">
        <img 
          src={comercio.imagen_url || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000"} 
          alt={comercio.nombre}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <main className="mx-auto max-w-3xl -mt-6 relative z-10 px-4 sm:px-0">
        {/* 3. Info Card */}
        <div className="bg-card rounded-[1.5rem] p-5 shadow-lg border border-border/50 mb-6 relative">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-3">
            {comercio.nombre}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-1 text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-bold">{comercio.rating ? comercio.rating.toFixed(1) : "Nuevo"}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{comercio.tiempo_entrega || "20-30 min"}</span>
            </div>
            {comercio.costo_envio !== undefined && (
              <>
                <span>•</span>
                <span>{comercio.costo_envio === 0 ? "Envío Gratis" : `$${comercio.costo_envio.toFixed(2)} envío`}</span>
              </>
            )}
          </div>
        </div>

        {/* 4. Navegación Horizontal Sticky */}
        {categories.length > 0 && (
          <div className="sticky top-0 z-40 -mx-4 px-4 py-3 bg-background/95 backdrop-blur-md border-b border-border sm:mx-0 mb-6 shadow-sm">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => scrollToCategory(cat)}
                  className={`shrink-0 snap-start px-4 py-1.5 rounded-full text-sm font-bold transition-colors border ${
                    activeCategory === cat 
                      ? "bg-foreground text-background border-foreground" 
                      : "bg-card text-muted-foreground border-transparent hover:bg-secondary/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. Listado de Platillos Agrupados */}
        <div className="space-y-8">
          {categories.map((cat) => (
            <section 
              key={cat} 
              id={cat}
              ref={(el) => { categoryRefs.current[cat] = el }}
              className="scroll-mt-[130px]"
            >
              <h2 className="text-xl font-black italic tracking-tight mb-4">{cat}</h2>
              <div className="flex flex-col gap-2">
                {groupedDishes[cat].map((dish) => (
                  <DishRow 
                    key={dish.id} 
                    dish={{
                      id: dish.id,
                      name: dish.nombre,
                      description: dish.descripcion,
                      price: dish.precio,
                      originalPrice: dish.precio_original,
                      image: dish.imagen_url,
                      comercioId: dish.comercio_id
                    }} 
                    onClick={(d) => setSelectedDish(d)}
                  />
                ))}
              </div>
            </section>
          ))}

          {categories.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Info className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>Este negocio aún no tiene platillos en su menú.</p>
            </div>
          )}
        </div>
      </main>

      <DishSelectionDrawer 
        dish={selectedDish} 
        isOpen={!!selectedDish} 
        onClose={() => setSelectedDish(null)} 
      />

      {/* 6. Carrito Flotante */}
      <FloatingCart />
    </div>
  )
}
