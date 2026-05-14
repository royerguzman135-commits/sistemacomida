"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Upload, MapPin, Store } from "lucide-react"

interface ComercioSettingsProps {
  comercio: any
  onSuccess: () => void
}

export function ComercioSettings({ comercio, onSuccess }: ComercioSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMensaje("")
    
    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      let logoUrl = comercio?.logo_url

      // Subir la imagen si se seleccionó una
      const file = formData.get("logo") as File
      if (file && file.size > 0) {
        const fileExt = file.name.split('.').pop()
        const fileName = `logo-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from("fotos-platillos")
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from("fotos-platillos")
          .getPublicUrl(fileName)
        
        logoUrl = urlData.publicUrl
      }

      // Actualizar el perfil del comercio
      const { error } = await supabase
        .from('comercios')
        .update({
          nombre: formData.get("nombre"),
          ubicacion: formData.get("ubicacion"),
          direccion: formData.get("direccion"),
          telefono: formData.get("telefono"),
          logo_url: logoUrl
        })
        .eq('id', comercio.id)

      if (error) throw error

      setMensaje("✅ ¡Perfil actualizado correctamente!")
      onSuccess() // Para actualizar el estado principal del Dashboard

    } catch (error: any) {
      setMensaje("❌ Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 fade-in">
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl text-white">
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
          <div className="p-4 bg-orange-500/20 rounded-2xl">
            <Store className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Ajustes del Local</h2>
            <p className="text-slate-400 font-medium text-sm mt-1">Personaliza tu marca para que los clientes te reconozcan</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Componente visual del Logo Actual */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-dashed border-orange-500/30 bg-black/40 flex items-center justify-center relative group">
                {comercio?.logo_url ? (
                   <img src={comercio.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                   <Store className="w-10 h-10 text-white/20" />
                )}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <Input 
                  name="logo" 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Subir nuevo (Opcional)</p>
            </div>

            {/* Resto del formulario */}
            <div className="flex-1 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-orange-500 ml-2">Nombre Comercial</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input 
                    name="nombre" 
                    defaultValue={comercio?.nombre} 
                    placeholder="Ej. Tacos el Job" 
                    className="h-14 bg-black/40 border-white/10 rounded-2xl pl-12 font-bold text-white focus:border-orange-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-orange-500 ml-2">Dirección a mostrar</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input 
                    name="direccion" 
                    defaultValue={comercio?.direccion} 
                    placeholder="Ej. Calle 123, Colonia Centro, Mexicali" 
                    className="h-14 bg-black/40 border-white/10 rounded-2xl pl-12 font-bold text-white focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-orange-500 ml-2">Enlace de Ubicación (Google Maps)</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input 
                    name="ubicacion" 
                    defaultValue={comercio?.ubicacion} 
                    placeholder="Ej. https://maps.app.goo.gl/..." 
                    className="h-14 bg-black/40 border-white/10 rounded-2xl pl-12 font-bold text-white focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-orange-500 ml-2">Teléfono de Contacto</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input 
                    name="telefono" 
                    defaultValue={comercio?.telefono} 
                    placeholder="Ej. +52 686 123 4567" 
                    className="h-14 bg-black/40 border-white/10 rounded-2xl pl-12 font-bold text-white focus:border-orange-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-orange-500 hover:bg-orange-600 h-16 rounded-2xl font-black text-lg shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all"
          >
            {loading ? "GUARDANDO..." : "GUARDAR CAMBIOS"} <Save className="ml-2 w-5 h-5 drop-shadow-md" />
          </Button>

          {mensaje && (
            <p className={`text-center font-bold text-sm p-4 rounded-2xl ${mensaje.includes('✅') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {mensaje}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
