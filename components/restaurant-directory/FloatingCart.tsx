"use client"
import { useState, useEffect } from "react"
import { useCartStore } from "@/store/cartStore"
import { ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerTrigger,
  DrawerClose
} from "@/components/ui/drawer"
import { CheckoutDrawer } from "@/components/restaurant-directory/CheckoutDrawer"

export function FloatingCart() {
  const { items, removeItem } = useCartStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Prevenir hidratación incorrecta al leer de localStorage
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null
  if (items.length === 0) return null

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <>
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <Button className="w-full h-16 rounded-[2rem] bg-orange-500 hover:bg-orange-600 text-white shadow-2xl shadow-orange-500/40 flex items-center justify-between px-6 font-black text-lg active:scale-95 transition-all">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
                <span className="absolute -top-2 -right-3 bg-white text-orange-600 font-black text-[11px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm border border-orange-100">
                  {totalItems}
                </span>
              </div>
              <span className="ml-2 uppercase tracking-wide">Ver Pedido</span>
            </div>
            <span className="text-xl tracking-tighter">${totalPrice.toFixed(2)}</span>
          </Button>
        </div>
      </DrawerTrigger>
      
      <DrawerContent className="max-h-[90vh] bg-background text-foreground border-border flex flex-col">
        <DrawerHeader className="border-b border-border pb-4">
          <DrawerTitle className="text-3xl font-black italic uppercase tracking-tighter text-center">Tu Pedido</DrawerTitle>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 rounded-[1.5rem] border border-border bg-card relative shadow-sm">
              <div className="w-20 h-20 rounded-[1rem] overflow-hidden bg-secondary flex-shrink-0 border border-border">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-center pr-2">
                <div className="flex justify-between items-start gap-2">
                   <h4 className="font-bold text-foreground leading-tight text-lg">
                     <span className="text-orange-500 mr-1">{item.quantity}x</span> 
                     {item.name}
                   </h4>
                   <span className="font-black text-orange-500 text-lg tracking-tighter">
                     ${(item.price * item.quantity).toFixed(2)}
                   </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-snug">
                  {item.resumen_opciones}
                </p>
              </div>
              <button 
                onClick={() => removeItem(item.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 active:scale-95 transition-transform"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        
        <DrawerFooter className="border-t border-border pt-6 pb-8 space-y-4 bg-background z-10">
           <div className="flex justify-between items-end px-2 mb-2">
             <span className="font-bold text-muted-foreground uppercase text-sm tracking-wider">Total a pagar</span>
             <span className="text-4xl font-black text-foreground tracking-tighter">
               ${totalPrice.toFixed(2)}
             </span>
           </div>
           <Button 
             className="w-full h-16 rounded-[2rem] font-black text-xl bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-transform uppercase tracking-tight"
             onClick={() => {
               setIsOpen(false) // Cerrar el carrito
               setTimeout(() => setIsCheckoutOpen(true), 300) // Abrir checkout después de la animación
             }}
           >
             Proceder al Pago
           </Button>
           <DrawerClose asChild>
             <Button variant="ghost" className="w-full font-bold text-muted-foreground hover:text-foreground h-12 rounded-xl">
               Seguir Comprando
             </Button>
           </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>

    <CheckoutDrawer 
      isOpen={isCheckoutOpen} 
      onClose={() => setIsCheckoutOpen(false)} 
    />
    </>
  )
}
