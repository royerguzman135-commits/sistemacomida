"use client"

import { useState, useMemo } from "react"
import { MapPin, X, Clock, Flame, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CategoriaNav } from "./categoria-nav"
import { PlatilloCard, type Platillo } from "./platillo-card"

const TODAS = "Todas"

// Definimos la estructura exacta que esperamos recibir
interface MenuPublicoProps {
  comercio: any      // Datos del negocio desde Supabase
  platillos: Platillo[] // Lista de platillos desde Supabase
}

export function MenuPublico({
  comercio,
  platillos = [],
}: MenuPublicoProps) {
  const [categoriaActiva, setCategoriaActiva] = useState(TODAS)
  const [platilloSeleccionado, setPlatilloSeleccionado] = useState<Platillo | null>(null)

  // Extraemos los datos del comercio o usamos valores por defecto si vienen vacíos
  const nombreComercio = comercio?.nombre || "Tacos El Job"
  const logoUrl = comercio?.logo_url || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop"
  const ubicacionComercio = comercio?.ubicacion || "Mexicali, B.C."

  // Extraer categorías únicas de los platillos reales
  const categorias = useMemo(() => {
    if (!platillos) return [TODAS]
    const uniqueCategorias = [...new Set(platillos.map((p) => p.categoria))]
    return [TODAS, ...uniqueCategorias]
  }, [platillos])

  // Filtrar platillos por categoría
  const platillosFiltrados = useMemo(() => {
    if (!platillos) return []
    if (categoriaActiva === TODAS) return platillos
    return platillos.filter((p) => p.categoria === categoriaActiva)
  }, [platillos, categoriaActiva])

  const handleVerMas = (platillo: Platillo) => {
    setPlatilloSeleccionado(platillo)
  }

  const closeDrawer = () => {
    setPlatilloSeleccionado(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={logoUrl}
                  alt={nombreComercio}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-primary shadow-lg shadow-primary/20"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  {nombreComercio}
                </h1>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{ubicacionComercio}</span>
                </div>
              </div>
            </div>

            <Badge className="bg-green-500/20 text-green-400 border-0 rounded-2xl px-4 py-2 hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Abierto ahora
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Categorías
          </h2>
          <CategoriaNav
            categorias={categorias}
            categoriaActiva={categoriaActiva}
            onCategoriaChange={setCategoriaActiva}
          />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {categoriaActiva === TODAS ? "Todos los platillos" : categoriaActiva}
            </h2>
            <span className="text-muted-foreground text-sm">
              {platillosFiltrados.length} platillo{platillosFiltrados.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {platillosFiltrados.map((platillo) => (
              <PlatilloCard
                key={platillo.id}
                platillo={platillo}
                onVerMas={handleVerMas}
              />
            ))}
          </div>

          {platillosFiltrados.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No hay platillos en esta categoría
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Drawer/Modal for Dish Details */}
      {platilloSeleccionado && (
        <>
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={closeDrawer}
          />

          <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:right-0 sm:top-0 sm:bottom-0 sm:w-full sm:max-w-lg">
            <div className="bg-card border-t sm:border-l border-border h-[85vh] sm:h-full overflow-hidden flex flex-col rounded-t-3xl sm:rounded-none animate-in slide-in-from-bottom sm:slide-in-from-right duration-300">
              <div className="relative flex-shrink-0">
                <div className="sm:hidden w-12 h-1.5 bg-muted rounded-full mx-auto mt-3" />
                <button
                  onClick={closeDrawer}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-background/90 backdrop-blur-md rounded-full flex items-center justify-center text-foreground hover:bg-secondary transition-colors shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="aspect-[16/10] sm:aspect-[4/3] overflow-hidden">
                  <img
                    src={platilloSeleccionado.imagen_url}
                    alt={platilloSeleccionado.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="bg-secondary text-secondary-foreground rounded-xl">
                    {platilloSeleccionado.categoria}
                  </Badge>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {platilloSeleccionado.nombre}
                </h2>
                <p className="text-3xl font-bold text-primary mb-6">
                  ${platilloSeleccionado.precio}
                </p>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Descripción
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {platilloSeleccionado.descripcion}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-secondary rounded-2xl p-4 text-center">
                    <Clock className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <p className="text-xs text-muted-foreground">Tiempo</p>
                    <p className="text-sm font-semibold text-foreground">15-20 min</p>
                  </div>
                  <div className="bg-secondary rounded-2xl p-4 text-center">
                    <Flame className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <p className="text-xs text-muted-foreground">Picante</p>
                    <p className="text-sm font-semibold text-foreground">Medio</p>
                  </div>
                  <div className="bg-secondary rounded-2xl p-4 text-center">
                    <Leaf className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <p className="text-xs text-muted-foreground">Tipo</p>
                    <p className="text-sm font-semibold text-foreground">Tradicional</p>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 p-6 border-t border-border bg-card">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl py-6 text-lg font-semibold shadow-lg shadow-primary/25 transition-all">
                  Cerrar Detalles
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}