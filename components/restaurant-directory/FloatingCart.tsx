"use client"
import { useState, useEffect } from "react"
import { useCartStore } from "@/store/cartStore"
import { Trash2, ChevronUp, ChevronLeft, Minus, Plus, Utensils, FileText, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer"
import { CheckoutDrawer } from "@/components/restaurant-directory/CheckoutDrawer"

export function FloatingCart() {
  const { items, updateQuantity, removeItem } = useCartStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [cubiertos, setCubiertos] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null
  if (items.length === 0) return null

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalSavings = items.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + (item.originalPrice - item.price) * item.quantity
    }
    return sum
  }, 0)

  return (
    <>
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <div className={`fixed bottom-0 left-0 w-full z-[60] bg-zinc-950 border-t border-zinc-900 transition-transform duration-300 ${isOpen || isCheckoutOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
          {totalSavings > 0 && (
            <div className="bg-orange-500/10 py-1.5 text-center text-[11px] font-semibold text-orange-500 tracking-wide uppercase">
              Descuento máximo aplicado
            </div>
          )}
          
          <div className="flex justify-between items-center px-4 py-3">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white leading-none tracking-tight">
                ${totalPrice.toFixed(2)}
              </span>
              {totalSavings > 0 && (
                <div className="text-[11px] font-bold text-orange-500 flex items-center gap-0.5 mt-1">
                  Ahorraste ${totalSavings.toFixed(2)}
                  <ChevronUp className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
            
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-black px-6 py-6 rounded-2xl flex items-center gap-3 shadow-lg shadow-orange-500/10 active:scale-95 transition-all">
              <span className="uppercase tracking-wide text-[15px]">Carrito</span>
              <div className="bg-white text-orange-600 rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center text-[11px] font-black">
                {totalItems}
              </div>
            </Button>
          </div>
        </div>
      </DrawerTrigger>
      
      <DrawerContent className="max-h-[95vh] h-[95vh] bg-zinc-950 text-white border-zinc-900 flex flex-col rounded-t-[2rem]">
        <DrawerTitle className="sr-only">Tu Pedido</DrawerTitle>
        {/* Header Compacto */}
        <div className="flex items-center justify-center relative py-4 border-b border-zinc-900 shrink-0">
          <button onClick={() => setIsOpen(false)} className="absolute left-4 p-2 text-white hover:bg-zinc-900 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-sm font-black tracking-wide text-white uppercase">TU PEDIDO</span>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-32 hide-scrollbar">
          {/* Lista de Platillos */}
          <div className="space-y-2 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center w-full border-b border-zinc-800/60 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                <div className="flex gap-3 flex-1 min-w-0 pr-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-zinc-800">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                     <h4 className="text-base font-bold text-white truncate">
                       {item.name}
                     </h4>
                     {item.resumen_opciones && (
                       <p className="text-xs text-zinc-500 truncate mt-0.5">
                         {item.resumen_opciones}
                       </p>
                     )}
                     <div className="flex items-center mt-1">
                       <span className={`text-sm font-semibold ${item.originalPrice && item.originalPrice > item.price ? 'text-orange-500' : 'text-zinc-300'}`}>
                         ${item.price.toFixed(2)}
                       </span>
                       {item.originalPrice && item.originalPrice > item.price && (
                         <span className="text-xs line-through text-zinc-500 ml-2">
                           ${item.originalPrice.toFixed(2)}
                         </span>
                       )}
                     </div>
                  </div>
                </div>

                {/* Control de Cantidad Inline */}
                <div className="flex items-center shrink-0">
                  <button 
                    onClick={() => {
                      if (item.quantity > 1) {
                        updateQuantity(item.id, item.quantity - 1)
                      } else {
                        removeItem(item.id)
                      }
                    }}
                    className="border border-zinc-700 text-white rounded-full p-1 hover:bg-zinc-800 active:scale-95 transition-all flex items-center justify-center w-8 h-8"
                  >
                    {item.quantity === 1 ? <Trash2 className="w-4 h-4 text-zinc-400" /> : <Minus className="w-4 h-4" />}
                  </button>
                  <span className="text-sm font-bold text-white w-8 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="border border-zinc-700 text-white rounded-full p-1 hover:bg-zinc-800 active:scale-95 transition-all flex items-center justify-center w-8 h-8"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Opciones Generales */}
          <div className="space-y-3 mt-6">
            <button 
              onClick={() => setCubiertos(!cubiertos)}
              className="w-full flex justify-between items-center bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/60 hover:bg-zinc-900/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Utensils className="w-5 h-5 text-zinc-400" />
                <span className="text-base font-medium text-white">Cubiertos</span>
              </div>
              <div className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${cubiertos ? 'bg-orange-500 justify-end' : 'bg-zinc-700 justify-start'}`}>
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </button>

            <button className="w-full flex justify-between items-center bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/60 hover:bg-zinc-900/80 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-zinc-400" />
                <span className="text-base font-medium text-white">Agregar una nota</span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500" />
            </button>
          </div>

          {/* Sección de Recomendados */}
          <div className="mt-8 mb-4">
            <h3 className="text-lg font-black text-white mb-4">Comprado habitualmente con:</h3>
            <div className="flex overflow-x-auto gap-3 pb-4 snap-x hide-scrollbar">
              <div className="min-w-[140px] p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col gap-2 snap-start">
                 <div className="w-full h-20 bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
                   <span className="text-xs text-zinc-500">Sin imagen</span>
                 </div>
                 <span className="text-sm font-bold text-white line-clamp-2 leading-tight">Papas Fritas</span>
                 <span className="text-xs text-orange-500 font-bold mt-auto">+$45.00</span>
              </div>
              <div className="min-w-[140px] p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col gap-2 snap-start">
                 <div className="w-full h-20 bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
                   <span className="text-xs text-zinc-500">Sin imagen</span>
                 </div>
                 <span className="text-sm font-bold text-white line-clamp-2 leading-tight">Refresco 600ml</span>
                 <span className="text-xs text-orange-500 font-bold mt-auto">+$35.00</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Sticky de Pago */}
        <div className="absolute bottom-0 left-0 w-full bg-zinc-950 border-t border-zinc-900 px-4 py-3 z-50">
          <div className="flex justify-between items-center max-w-md mx-auto w-full">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">${totalPrice.toFixed(2)}</span>
              {totalSavings > 0 && (
                <span className="text-xs text-orange-500 font-medium">Ahorraste ${totalSavings.toFixed(2)} ⌃</span>
              )}
            </div>
            <button 
              onClick={() => {
                setIsOpen(false)
                setTimeout(() => setIsCheckoutOpen(true), 300)
              }}
              className="bg-orange-500 hover:bg-orange-600 transition-colors text-white font-black px-6 py-3 rounded-full flex items-center gap-3 text-base shadow-lg shadow-orange-500/10 active:scale-95"
            >
              Pagar
              <div className="bg-white text-orange-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-black">
                {totalItems}
              </div>
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>

    <CheckoutDrawer 
      isOpen={isCheckoutOpen} 
      onClose={() => setIsCheckoutOpen(false)} 
    />
    </>
  )
}
