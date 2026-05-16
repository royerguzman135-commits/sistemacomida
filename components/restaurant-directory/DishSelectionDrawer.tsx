"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, X, Minus, Plus } from "lucide-react"
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
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [quantity, setQuantity] = useState(1)

  // Limpiar selecciones cuando se abre un nuevo platillo
  useEffect(() => {
    if (isOpen) {
      setSelections({})
      setSpecialInstructions("")
      setQuantity(1)
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

  // Calculadora en Tiempo Real (precio unitario)
  const unitPrice = useMemo(() => {
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

  const totalPrice = unitPrice * quantity

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
    
    let resumen = summaryParts.join(' | ') || 'Original (Sin modificaciones)'
    
    if (specialInstructions.trim() !== '') {
      resumen += ` | Notas: ${specialInstructions.trim()}`
    }
    
    // Instanciar item para Zustand
    useCartStore.getState().addItem({
      id: Math.random().toString(36).substring(2, 10),
      dishId: dish.id,
      name: dish.name,
      price: unitPrice,
      originalPrice: dish.originalPrice,
      quantity: quantity,
      resumen_opciones: resumen,
      image: dish.image,
      comercioId: dish.comercioId,
    })
    
    if (navigator.vibrate) navigator.vibrate([30, 50, 30])
    onClose()
  }

  if (!dish) return null

  const discountPercentage = dish.originalPrice && dish.originalPrice > dish.price
    ? Math.round(((dish.originalPrice - dish.price) / dish.originalPrice) * 100)
    : 0

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="h-[95vh] flex flex-col bg-zinc-950 text-white border-zinc-900 rounded-t-[2rem] overflow-hidden">
        <DrawerTitle className="sr-only">{dish.name}</DrawerTitle>
        
        <div className="flex-1 overflow-y-auto pb-[100px] bg-zinc-950">
          {/* Hero Header */}
          <div className="relative w-full aspect-square sm:h-72 bg-zinc-900">
            <img 
              src={dish.image} 
              alt={dish.name} 
              className="w-full h-full object-cover"
            />
            {/* Gradiente sutil superior para que se vea bien el botón X */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
            
            <DrawerClose asChild>
              <button className="absolute top-4 left-4 h-10 w-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-sm hover:bg-black/60 transition-all active:scale-95 z-10">
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </DrawerClose>
          </div>

          {/* Cuerpo de Información */}
          <div className="px-5 py-5">
            <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-2">
              {dish.name}
            </h2>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-green-900/30 text-green-500 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                👍 82%
              </span>
            </div>
            
            {/* Bloque de Precios */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-black text-orange-500">${dish.price.toFixed(2)}</span>
              {dish.originalPrice && dish.originalPrice > dish.price && (
                <>
                  <span className="text-sm font-semibold line-through text-zinc-500">
                    ${dish.originalPrice.toFixed(2)}
                  </span>
                  <span className="bg-orange-900/30 text-orange-500 px-2 py-0.5 rounded-md text-xs font-black">
                    {discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>

            {dish.description && (
              <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                {dish.description}
              </p>
            )}
          </div>

          {/* Complementos (Modificadores) */}
          <div className="px-4 pb-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-1/2 rounded-md bg-zinc-800" />
                      <Skeleton className="h-4 w-16 rounded-full bg-zinc-800" />
                    </div>
                    <Skeleton className="h-12 w-full rounded-xl bg-zinc-800" />
                    <Skeleton className="h-12 w-full rounded-xl bg-zinc-800" />
                  </div>
                ))}
              </div>
            ) : grupos.length > 0 ? (
              grupos.map((grupo) => {
                const selectedIds = selections[grupo.id] || []
                const reachedLimit = grupo.es_multi_seleccion && grupo.limite_maximo > 0 && selectedIds.length >= grupo.limite_maximo

                return (
                  <div key={grupo.id} className="bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-2xl mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-base font-bold text-white">
                        {grupo.titulo}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${grupo.es_obligatorio ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                        {grupo.es_obligatorio ? 'Obligatorio' : 'Opcional'}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 mb-4">
                      {grupo.es_multi_seleccion 
                        ? (grupo.limite_maximo > 0 ? `Selecciona hasta ${grupo.limite_maximo}` : 'Selecciona múltiples opciones') 
                        : 'Selecciona 1'}
                    </p>
                    
                    <div className="space-y-0.5">
                      {grupo.opciones_items?.filter(item => item.disponible).map((item, index, arr) => {
                        const isSelected = selectedIds.includes(item.id)
                        const isDisabled = !isSelected && reachedLimit

                        return (
                          <label 
                            key={item.id} 
                            className={`flex items-center justify-between py-3 cursor-pointer transition-opacity ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'active:opacity-70'} ${index !== arr.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
                          >
                            <input 
                              type={grupo.es_multi_seleccion ? "checkbox" : "radio"} 
                              name={`grupo-${grupo.id}`}
                              checked={isSelected}
                              disabled={isDisabled}
                              onChange={() => {
                                if (navigator.vibrate) navigator.vibrate(10);
                                handleSelection(grupo.id, item.id, grupo.es_multi_seleccion, grupo.limite_maximo);
                              }}
                              className="sr-only"
                            />
                            <div className="flex-1 pr-4">
                              <span className={`text-[15px] font-medium ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                                {item.nombre}
                              </span>
                              {item.precio_adicional > 0 && (
                                <span className="text-sm text-orange-500 ml-2">
                                  +${item.precio_adicional.toFixed(2)}
                                </span>
                              )}
                            </div>
                            
                            {/* Checkbox/Radio UI Didi Style */}
                            <div className={`w-[22px] h-[22px] shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-zinc-700 bg-transparent'}`}>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />}
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            ) : null}
            
            {/* Campo de Instrucciones Especiales */}
            {!loading && (
              <div className="bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-2xl mb-4">
                <h4 className="text-base font-bold text-white mb-3">Instrucciones Especiales</h4>
                <textarea 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-[15px] text-white resize-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-zinc-500"
                  rows={2}
                  placeholder="Ej. Sin cebolla, aderezo aparte..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Barra de Acción Fija */}
        <div className="absolute bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-900 p-4 flex gap-3 z-20">
          {/* Selector de Cantidad */}
          <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl flex items-center justify-between p-1.5 w-32 shrink-0">
            <button 
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10)
                setQuantity(Math.max(1, quantity - 1))
              }}
              className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 shadow-sm flex items-center justify-center active:scale-95 transition-all text-white"
            >
              <Minus className="w-4 h-4" strokeWidth={3} />
            </button>
            <span className="font-bold text-white text-[15px]">
              {quantity}
            </span>
            <button 
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10)
                setQuantity(quantity + 1)
              }}
              className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 shadow-sm flex items-center justify-center active:scale-95 transition-all text-white"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>

          {/* Botón Agregar */}
          <Button 
            onClick={() => {
               if (navigator.vibrate) navigator.vibrate(50);
               handleAddToCart();
            }}
            disabled={!isValid || loading}
            className={`flex-1 h-[52px] rounded-2xl font-bold text-[17px] transition-all shadow-none ${isValid ? 'bg-orange-500 hover:bg-orange-600 text-white active:scale-[0.98]' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
          >
            Agregar • ${totalPrice.toFixed(2)}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
