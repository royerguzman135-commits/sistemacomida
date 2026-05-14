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

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-8">
          <h2 className="mb-2 text-3xl font-bold sm:text-4xl">Menú Real</h2>
          <p className="text-muted-foreground">Datos cargados directamente desde Supabase.</p>
        </section>

        <section className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "secondary"}
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full px-4"
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </Button>
            ))}
          </div>
        </section>

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