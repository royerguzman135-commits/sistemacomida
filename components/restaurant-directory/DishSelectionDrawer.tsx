"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Check } from "lucide-react"
import { Dish } from "./DishCard"
import { useCartStore } from "@/store/cartStore"

interface OpcionItem {
  id: string
  nombre: string
  precio_adicional: number
  disponible: boolean
}

interface GrupoOpciones {
  id: string
  titulo: string
  es_obligatorio: boolean
  es_multi_seleccion: boolean
  limite_maximo: number
  opciones_items: OpcionItem[]
}

interface DishSelectionDrawerProps {
  dish: Dish | null
  isOpen: boolean
  onClose: () => void
}

export function DishSelectionDrawer({ dish, isOpen, onClose }: DishSelectionDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [grupos, setGrupos] = useState<GrupoOpciones[]>([])
  const [selections, setSelections] = useState<Record<string, string[]>>({})

  // Limpiar selecciones cuando se abre un nuevo platillo
  useEffect(() => {
    if (isOpen) {
      setSelections({})
    }
  }, [isOpen, dish?.id])

  useEffect(() => {
    if (isOpen && dish) {
      setLoading(true)
      const fetchOptions = async () => {
        const { data, error } = await supabase
          .from('grupos_opciones')
          .select('*, opciones_items(*)')
          .eq('platillo_id', dish.id)
          .order('id', { ascending: true })

        if (!error && data) {
          setGrupos(data as any[])
        }
        setLoading(false)
      }
      fetchOptions()
    } else {
      setGrupos([])
    }
  }, [isOpen, dish])

  // Lógica de Manejo de Selecciones
  const handleSelection = (grupoId: string, itemId: string, isMulti: boolean, limite: number) => {
    setSelections(prev => {
      const current = prev[grupoId] || []
      
      // Si es Radio Button (Single Selection)
      if (!isMulti) {
        return { ...prev, [grupoId]: [itemId] }
      }
      
      // Si es Checkbox (Multi Selection)
      if (current.includes(itemId)) {
        // Desmarcar
        return { ...prev, [grupoId]: current.filter(id => id !== itemId) }
      }
      
      // Marcar nuevo (Verificar Límite)
      if (limite > 0 && current.length >= limite) {
        return prev // Bloqueado, no se puede añadir más
      }
      
      return { ...prev, [grupoId]: [...current, itemId] }
    })
  }

  // Calculadora en Tiempo Real
  const totalPrice = useMemo(() => {
    if (!dish) return 0
    let total = dish.price
    
    grupos.forEach(grupo => {
      const selectedIds = selections[grupo.id] || []
      grupo.opciones_items.forEach(item => {
        if (selectedIds.includes(item.id)) {
          total += item.precio_adicional
        }
      })
    })
    
    return total
  }, [dish, grupos, selections])

  // Validación de Completitud
  const isValid = useMemo(() => {
    for (const grupo of grupos) {
      if (grupo.es_obligatorio) {
        const selectedIds = selections[grupo.id] || []
        if (selectedIds.length === 0) return false
      }
    }
    return true
  }, [grupos, selections])

  // Generador de Resumen y Agregado al Carrito
  const handleAddToCart = () => {
    if (!dish || !isValid) return
    
    const summaryParts: string[] = []
    grupos.forEach(grupo => {
      const selectedIds = selections[grupo.id] || []
      if (selectedIds.length > 0) {
        const names = grupo.opciones_items
          .filter(i => selectedIds.includes(i.id))
          .map(i => i.nombre)
        summaryParts.push(`${grupo.titulo}: ${names.join(', ')}`)
      }
    })
    
    const resumen = summaryParts.join(' | ') || 'Original (Sin modificaciones)'
    
    // Instanciar item para Zustand
    useCartStore.getState().addItem({
      id: Math.random().toString(36).substring(2, 10),
      dishId: dish.id,
      name: dish.name,
      price: totalPrice,
      quantity: 1,
      resumen_opciones: resumen,
      image: dish.image,
      comercioId: dish.comercioId,
    })
    
    alert(`✅ ¡Añadido al Carrito!\n\n${dish.name}\n${resumen}\nTotal: $${totalPrice}`)
    onClose()
  }

  // Estado para el Sticky Header Pro
  const [isScrolled, setIsScrolled] = useState(false)

  if (!dish) return null

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh] flex flex-col bg-background text-foreground border-border overflow-hidden">
        {/* Título oculto para accesibilidad de lectores de pantalla */}
        <DrawerTitle className="sr-only">{dish.name}</DrawerTitle>
        
        {/* Sticky Header "Pro" - Aparece cuando la imagen principal sale de vista */}
        <div className={`absolute top-0 left-0 right-0 bg-background/95 backdrop-blur-md z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 border-b border-border shadow-sm ${isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col flex-1 truncate pr-4">
            <span className="font-black italic uppercase truncate leading-none text-foreground">{dish.name}</span>
            <span className="font-bold text-orange-500 text-sm mt-0.5">${totalPrice.toFixed(2)}</span>
          </div>
          <DrawerClose asChild>
            <button className="h-8 w-8 flex items-center justify-center bg-secondary rounded-full text-muted-foreground hover:text-foreground">✕</button>
          </DrawerClose>
        </div>

        <div 
          className="flex-1 overflow-y-auto"
          onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 180)}
        >
          {/* Imagen Full Width dentro del Scroll */}
          <div className="relative w-full aspect-video sm:h-64 bg-secondary">
            <img 
              src={dish.image} 
              alt={dish.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <DrawerClose asChild>
              <Button variant="outline" size="icon" className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/40 backdrop-blur-md border-white/20 text-white hover:bg-black/60 shadow-lg transition-transform active:scale-95 z-10">
                ✕
              </Button>
            </DrawerClose>
          </div>

          <div className="px-6 pt-6 pb-2">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter drop-shadow-sm text-foreground">{dish.name}</h2>
            <p className="text-[15px] text-muted-foreground mt-2 leading-relaxed">
              {dish.description}
            </p>
          </div>

          <div className="px-4 py-4 space-y-6">
            {loading ? (
              <div className="space-y-6 px-2">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-1/2 rounded-md" />
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-14 w-full rounded-2xl" />
                    <Skeleton className="h-14 w-full rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : grupos.length > 0 ? (
              grupos.map((grupo) => {
                const selectedIds = selections[grupo.id] || []
                const reachedLimit = grupo.es_multi_seleccion && grupo.limite_maximo > 0 && selectedIds.length >= grupo.limite_maximo

                return (
                  <div key={grupo.id} className="space-y-3 px-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-foreground uppercase italic tracking-wide">{grupo.titulo}</h4>
                      <div className="flex items-center gap-2">
                        {grupo.es_multi_seleccion && grupo.limite_maximo > 0 && (
                          <span className="text-[10px] font-bold text-muted-foreground">
                            Max {grupo.limite_maximo}
                          </span>
                        )}
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${grupo.es_obligatorio && selectedIds.length === 0 ? 'bg-red-500/10 text-red-500' : 'bg-secondary text-muted-foreground'}`}>
                          {grupo.es_obligatorio ? 'Requerido' : 'Opcional'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {grupo.opciones_items?.filter(item => item.disponible).map((item) => {
                        const isSelected = selectedIds.includes(item.id)
                        const isDisabled = !isSelected && reachedLimit

                        return (
                          <label 
                            key={item.id} 
                            className={`relative flex items-center justify-between p-4 rounded-[1.25rem] border-2 transition-all cursor-pointer ${isSelected ? 'border-orange-500 bg-orange-500/5 shadow-md shadow-orange-500/10' : 'border-transparent bg-secondary/60'} ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-orange-500/30 active:scale-[0.98]'}`}
                          >
                            <input 
                              type={grupo.es_multi_seleccion ? "checkbox" : "radio"} 
                              name={`grupo-${grupo.id}`}
                              checked={isSelected}
                              disabled={isDisabled}
                              onChange={() => {
                                if (navigator.vibrate) navigator.vibrate(20);
                                handleSelection(grupo.id, item.id, grupo.es_multi_seleccion, grupo.limite_maximo);
                              }}
                              className="sr-only"
                            />
                            <div className="flex items-center gap-4">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all border-2 ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-muted-foreground/30 bg-background'}`}>
                                {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                              </div>
                              <span className={`font-bold text-[15px] ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>{item.nombre}</span>
                            </div>
                            {item.precio_adicional > 0 && (
                              <span className={`text-[15px] font-black ${isSelected ? 'text-orange-500' : 'text-muted-foreground'}`}>+${item.precio_adicional.toFixed(2)}</span>
                            )}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            ) : (
               <div className="text-center py-6 text-muted-foreground italic text-sm">
                 Este platillo no requiere configuración adicional.
               </div>
            )}
          </div>
        </div>

        <DrawerFooter className="border-t border-border/50 pt-4 pb-8 px-6 bg-background z-10">
          <Button 
            onClick={() => {
               if (navigator.vibrate) navigator.vibrate(50);
               handleAddToCart();
            }}
            disabled={!isValid}
            className={`w-full h-16 rounded-[2rem] font-black text-xl shadow-xl transition-all uppercase tracking-tight ${isValid ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30 active:scale-[0.97]' : 'bg-secondary text-muted-foreground opacity-50'}`}
          >
            {isValid ? `Agregar • $${totalPrice.toFixed(2)}` : 'Completa las opciones'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
