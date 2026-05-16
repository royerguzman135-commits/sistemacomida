"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, ClipboardList, Utensils, LayoutDashboard, User } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { useEffect, useState } from "react"

export function BottomNav() {
  const pathname = usePathname()
  const items = useCartStore((state) => state.items)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Si hay productos en el carrito, ocultamos el menú inferior desplazándolo hacia abajo
  const hasItems = isMounted && items.length > 0

  return (
    <nav className={`fixed bottom-0 w-full z-50 bg-background/80 backdrop-blur-md border-t border-border shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)] transition-transform duration-300 ${hasItems ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
      <div className="max-w-md mx-auto px-6 h-20 flex items-center justify-between pb-2">
        <Link 
          href="/explorar" 
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${pathname === '/explorar' ? 'text-orange-500' : 'text-muted-foreground hover:text-orange-500'}`}
        >
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Explorar</span>
        </Link>
        
        <Link 
          href="/pedidos" 
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${pathname === '/pedidos' ? 'text-orange-500' : 'text-muted-foreground hover:text-orange-500'}`}
        >
          <ClipboardList className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Pedidos</span>
        </Link>

        {/* Botón Central Flotante */}
        <div className="relative -top-6">
          <Link 
            href="/" 
            className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-transform active:scale-95 ${pathname === '/' ? 'bg-orange-600 shadow-orange-600/40 text-white' : 'bg-orange-500 shadow-orange-500/30 text-white'}`}
          >
            <Utensils className="w-7 h-7" />
          </Link>
        </div>

        <Link 
          href="/dashboard" 
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${pathname.startsWith('/dashboard') ? 'text-orange-500' : 'text-muted-foreground hover:text-orange-500'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Panel</span>
        </Link>

        <Link 
          href="/perfil" 
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${pathname === '/perfil' ? 'text-orange-500' : 'text-muted-foreground hover:text-orange-500'}`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Perfil</span>
        </Link>
      </div>
    </nav>
  )
}
