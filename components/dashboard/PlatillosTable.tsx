"use client"

import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

export function PlatillosTable({ items, onEdit, onRefresh }: any) {
  
  async function handleBorrar(id: string) {
    console.log("🗑️ Intentando borrar platillo ID:", id);
    if (!confirm("¿Seguro que quieres eliminar este platillo?")) return

    const { error } = await supabase.from('platillos').delete().eq('id', id)

    if (error) {
      alert("Error al borrar: " + error.message)
    } else {
      console.log("✅ Platillo eliminado con éxito");
      onRefresh(); 
    }
  }

  return (
    <>
      {/* Vista Desktop: Tabla Original */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-secondary/40 text-[11px] font-black uppercase text-muted-foreground border-b border-border">
            <tr>
              <th className="p-8 w-24">Imagen</th>
              <th className="p-8">Platillo</th>
              <th className="p-8">Precio</th>
              <th className="p-8 text-right px-8">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y border-border">
            {items.map((item: any) => (
              <tr key={item.id} className="hover:bg-orange-500/[0.02]">
                <td className="p-6 px-8">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-secondary border border-border shadow-sm flex-shrink-0">
                    <img 
                      src={item.imagen_url || "https://placehold.co/150x150/e2e8f0/1e293b?text=Sin+Foto"} 
                      alt={item.nombre}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/150x150/e2e8f0/1e293b?text=Sin+Foto";
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td className="p-6 px-8 font-black text-xl italic uppercase">{item.nombre}</td>
                <td className="p-6 text-3xl font-black text-orange-500 tracking-tighter">${item.precio}</td>
                <td className="p-6 text-right space-x-3 px-8">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      console.log("✏️ Botón Editar presionado para:", item.nombre);
                      onEdit(item); 
                    }}
                    className="rounded-xl h-12 px-6 font-bold"
                  >
                    <Pencil className="w-4 h-4 mr-2" /> Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleBorrar(item.id)}
                    className="rounded-xl h-12 px-6 text-red-400 border-red-500/10 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista Móvil: Tarjetas Verticales */}
      <div className="md:hidden flex flex-col divide-y divide-border">
        {items.map((item: any) => (
          <div key={item.id} className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-secondary border border-border shadow-sm flex-shrink-0">
                <img 
                  src={item.imagen_url || "https://placehold.co/150x150/e2e8f0/1e293b?text=Sin+Foto"} 
                  alt={item.nombre}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/150x150/e2e8f0/1e293b?text=Sin+Foto";
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-black text-xl italic uppercase leading-tight line-clamp-2">{item.nombre}</h3>
                <p className="text-3xl font-black text-orange-500 tracking-tighter mt-1">${item.precio}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-1">
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log("✏️ Botón Editar presionado para:", item.nombre);
                  onEdit(item); 
                }}
                className="rounded-2xl h-14 font-bold border-border shadow-sm text-base hover:bg-secondary active:scale-95 transition-all"
              >
                <Pencil className="w-5 h-5 mr-2 text-muted-foreground" /> Editar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleBorrar(item.id)}
                className="rounded-2xl h-14 font-bold text-red-500 border-red-500/20 bg-red-500/5 hover:bg-red-500 hover:text-white active:scale-95 transition-all text-base"
              >
                <Trash2 className="w-5 h-5 mr-2" /> Borrar
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="p-10 text-center text-muted-foreground font-bold italic">
            No hay platillos en el menú.
          </div>
        )}
      </div>
    </>
  )
}