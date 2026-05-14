"use client"

import { useState, useMemo } from "react"
import { Search, MapPin, ChefHat, User, Menu } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { DishCard, Dish } from "@/components/restaurant-directory/DishCard"
import { DishSelectionDrawer } from "@/components/restaurant-directory/DishSelectionDrawer"
import { FloatingCart } from "@/components/restaurant-directory/FloatingCart"

const categories = [
  { id: "all", label: "Todos", icon: "🍽️" },
  { id: "mexican", label: "Mexicana", icon: "🌮" },
  { id: "italian", label: "Italiana", icon: "🍝" },
  { id: "asian", label: "Asiática", icon: "🍜" },
  { id: "desserts", label: "Postres", icon: "🍰" },
  { id: "drinks", label: "Bebidas", icon: "🥤" },
]

export function RestaurantDirectory({ initialDishes }: { initialDishes: any[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)

  // Transformamos los datos de Supabase al formato que la tarjeta necesita
 const realDishes = useMemo<Dish[]>(() => {
    return initialDishes.map((db) => ({
      id: db.id,
      name: db.nombre,
      description: db.descripcion || "Sin descripción",
      price: db.precio,
      image: db.imagen_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
      category: db.categoria || "mexican",
      rating: 4.9,
      restaurant: db.comercios?.nombre || "Negocio Local", 
      comercioId: db.comercio_id,
      restaurantLogo: "🍴",
      prepTime: "20 min",
      isPopular: true
    }))
  }, [initialDishes])

  const filteredDishes = useMemo(() => {
    return realDishes.filter((dish) => {
      const matchesSearch =
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.restaurant.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || dish.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory, realDishes])

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      newFavorites.has(id) ? newFavorites.delete(id) : newFavorites.add(id)
      return newFavorites
    })
  }

  // Extraer restaurantes únicos para el carrusel
  const featuredRestaurants = useMemo(() => {
    const map = new Map();
    realDishes.forEach(d => {
      if(!map.has(d.comercioId)) {
        map.set(d.comercioId, {
          id: d.comercioId,
          name: d.restaurant,
          image: d.image, // Usamos la foto del primer platillo como portada
          rating: (Math.random() * (5 - 4) + 4).toFixed(1) // Fake rating 4.0 - 5.0
        })
      }
    })
    return Array.from(map.values())
  }, [realDishes])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full items-center justify-between sm:w-auto">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                  <ChefHat className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Sabor Local</h1>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Mexicali, B.C.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:hidden">
                <Link href="/perfil" className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                  <User className="h-5 w-5" />
                </Link>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="flex w-full items-center gap-4 sm:max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar en Mexicali..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-xl border-border bg-secondary pl-10 pr-4"
                />
              </div>
              <Link href="/perfil" className="hidden h-11 px-4 items-center gap-2 rounded-xl bg-secondary font-semibold text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors sm:flex">
                <User className="h-5 w-5" />
                Mi Perfil
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-2 pb-24 sm:px-6 lg:px-8">
        <section className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter sm:text-3xl text-foreground drop-shadow-sm">Menú Real</h2>
        </section>

        {/* Carrusel de Categorías (Pills) */}
        <section className="mb-5">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "secondary"}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 h-9 rounded-full px-4 text-sm font-bold transition-all active:scale-95 ${selectedCategory === category.id ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20' : 'bg-secondary hover:bg-secondary/80 text-foreground/80'}`}
              >
                <span className="mr-1.5">{category.icon}</span>
                {category.label}
              </Button>
            ))}
          </div>
        </section>

        {/* Carrusel de Restaurantes Destacados */}
        {featuredRestaurants.length > 0 && (
          <section className="mb-6">
            <h3 className="mb-3 text-lg font-black uppercase tracking-tight text-foreground/90">Restaurantes Destacados</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {featuredRestaurants.map((rest) => (
                <div key={rest.id} className="min-w-[14rem] w-56 flex-shrink-0 rounded-[1.5rem] border border-border bg-card p-3 shadow-sm transition-transform active:scale-95">
                  <div className="h-28 w-full overflow-hidden rounded-[1rem] bg-secondary mb-3 relative">
                     <img src={rest.image} alt={rest.name} className="h-full w-full object-cover" />
                     <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                       <span className="text-[10px] text-orange-500 font-black">★ {rest.rating}</span>
                     </div>
                  </div>
                  <h4 className="font-bold text-sm leading-tight line-clamp-1">{rest.name}</h4>
                  <p className="text-[11px] text-muted-foreground mt-1">Envío gratis • 20-30 min</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {filteredDishes.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {filteredDishes.map((dish) => (
              <DishCard 
                key={dish.id} 
                dish={dish} 
                onFavorite={toggleFavorite} 
                isFavorite={favorites.has(dish.id)} 
                onClick={setSelectedDish}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-xl font-semibold">No hay platillos en la base de datos.</p>
            <p className="text-muted-foreground">Agrega datos en Supabase para verlos aquí.</p>
          </div>
        )}
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