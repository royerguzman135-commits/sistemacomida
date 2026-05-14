"use client"

import { Store, ArrowRight, LogOut } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface CreateComercioFormProps {
  nuevoNombre: string
  setNuevoNombre: (nombre: string) => void
  creando: boolean
  onSubmit: (e: React.FormEvent) => void
  onLogout: () => void
}

export function CreateComercioForm({
  nuevoNombre,
  setNuevoNombre,
  creando,
  onSubmit,
  onLogout
}: CreateComercioFormProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 font-sans">
      <Card className="max-w-md w-full p-10 border-orange-500/30 bg-slate-900 text-white shadow-2xl rounded-[3rem]">
        <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Store className="w-10 h-10 text-orange-500" />
        </div>
        <h2 className="text-3xl font-black text-center mb-2 italic uppercase tracking-tighter">Nuevo Comercio</h2>
        <p className="text-slate-400 text-center text-sm mb-8 font-medium">Registra tu negocio para empezar a publicar platillos.</p>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 ml-2">Nombre del Negocio</label>
            <Input 
              placeholder="Ej: Tacos El Job" 
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="h-14 bg-black/40 border-white/10 rounded-2xl px-6 font-bold focus:border-orange-500 transition-all text-white"
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={creando}
            className="w-full bg-orange-500 hover:bg-orange-600 h-14 rounded-2xl font-black text-lg group text-white"
          >
            {creando ? "REGISTRANDO..." : "CREAR COMERCIO"}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>

        <button 
          onClick={onLogout} 
          className="w-full mt-8 text-slate-500 text-xs font-bold hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> CERRAR SESIÓN
        </button>
      </Card>
    </div>
  )
}
