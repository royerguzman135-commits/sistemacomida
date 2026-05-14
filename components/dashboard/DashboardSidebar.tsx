"use client"

import { LogOut, ChefHat } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"

interface SidebarLink {
  icon: any
  label: string
}

interface DashboardSidebarProps {
  sidebarOpen: boolean
  activeLink: string
  setActiveLink: (link: string) => void
  sidebarLinks: SidebarLink[]
  onLogout: () => void
  setSidebarOpen: (open: boolean) => void
}

export function DashboardSidebar({ 
  sidebarOpen, 
  activeLink, 
  setActiveLink, 
  sidebarLinks, 
  onLogout,
  setSidebarOpen
}: DashboardSidebarProps) {
  
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-8 border-b border-border text-center font-black text-2xl italic tracking-tighter">
        <ChefHat className="inline mr-2 text-orange-500" /> Sabor Local
      </div>
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        {sidebarLinks.map((link) => (
          <button 
            key={link.label} 
            onClick={() => {
              setActiveLink(link.label);
              setSidebarOpen(false);
            }}
            className={cn("w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] font-bold transition-all",
              activeLink === link.label ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-muted-foreground hover:bg-secondary")}
          >
            <link.icon className="w-5 h-5" /> <span>{link.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-6 border-t border-border mt-auto">
        <button 
          onClick={onLogout} 
          className="w-full flex items-center gap-4 px-5 py-4 text-red-400 font-bold hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" /> <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Vista Mobile (Sheet) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-card border-r-border">
          <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Vista Desktop (Aside Fijo) */}
      <aside className="hidden lg:flex sticky top-0 left-0 z-40 h-screen w-72 bg-card border-r border-border flex-col shrink-0">
        <SidebarContent />
      </aside>
    </>
  )
}
