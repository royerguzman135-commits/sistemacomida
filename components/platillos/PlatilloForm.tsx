"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Save, X, Plus, Trash2, Loader2 } from "lucide-react"

// Interfaces de Tipo para el Gestor
interface OpcionItem {
  id: string; 
  nombre: string;
  precio_adicional: number;
  disponible: boolean;
}

interface GrupoOpciones {
  id: string; 
  titulo: string;
  es_obligatorio: boolean;
  es_multi_seleccion: boolean;
  limite_maximo: number;
  items: OpcionItem[];
}

const generateId = () => Math.random().toString(36).substring(2, 10);

export function PlatilloForm({ platillo, comercioId, onCancel, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [loadingCarga, setLoadingCarga] = useState(false)
  const [estaAgotado, setEstaAgotado] = useState(platillo?.esta_agotado || false)
  
  // Estado Complejo Dinámico
  const [grupos, setGrupos] = useState<GrupoOpciones[]>([])

  // Efecto para recuperar información al EDITAR
  useEffect(() => {
    if (platillo?.id) {
       const fetchConfig = async () => {
           setLoadingCarga(true);
           const { data, error } = await supabase
             .from('grupos_opciones')
             .select('*, opciones_items(*)')
             .eq('platillo_id', platillo.id);
             
           if (data && !error) {
               setGrupos(data.map((g: any) => ({
                   id: g.id.toString(),
                   titulo: g.titulo || "",
                   es_obligatorio: g.es_obligatorio || false,
                   es_multi_seleccion: g.es_multi_seleccion || false,
                   limite_maximo: g.limite_maximo || 0,
                   items: (g.opciones_items || []).map((i: any) => ({
                       id: i.id.toString(),
                       nombre: i.nombre || "",
                       precio_adicional: i.precio_adicional || 0,
                       disponible: i.disponible !== false 
                   }))
               })));
           }
           setLoadingCarga(false);
       }
       fetchConfig();
    }
  }, [platillo?.id])

  // --- HANDLERS DYNAMIC UI ---
  const addGrupo = () => {
    setGrupos([...grupos, { id: generateId(), titulo: "", es_obligatorio: false, es_multi_seleccion: false, limite_maximo: 0, items: [] }]);
  }
  const removeGrupo = (gId: string) => setGrupos(grupos.filter(g => g.id !== gId))
  const updateGrupo = (gId: string, field: keyof GrupoOpciones, value: any) => {
    setGrupos(grupos.map(g => g.id === gId ? { ...g, [field]: value } : g))
  }

  const addItem = (gId: string) => {
    setGrupos(grupos.map(g => g.id === gId ? { ...g, items: [...g.items, { id: generateId(), nombre: "", precio_adicional: 0, disponible: true }] } : g))
  }
  const removeItem = (gId: string, itemId: string) => {
    setGrupos(grupos.map(g => g.id === gId ? { ...g, items: g.items.filter(i => i.id !== itemId) } : g))
  }
  const updateItem = (gId: string, itemId: string, field: keyof OpcionItem, value: any) => {
    setGrupos(grupos.map(g => g.id === gId ? { ...g, items: g.items.map(i => i.id === itemId ? { ...i, [field]: value } : i) } : g))
  }

  // --- GUARDADO A BASE DE DATOS ---
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      let imagenUrl = platillo?.imagen_url || null;
      const file = formData.get("imagen") as File;

      if (file && file.name && file.size > 0) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `comercios/${comercioId}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('fotos-platillos').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('fotos-platillos').getPublicUrl(filePath);
        imagenUrl = urlData.publicUrl;
      }

      const datos = {
        nombre: formData.get("nombre"),
        precio: parseFloat(formData.get("precio") as string),
        descripcion: formData.get("descripcion"),
        comercio_id: comercioId,
        esta_agotado: estaAgotado,
        ...(imagenUrl && { imagen_url: imagenUrl })
      }

      let platilloId = platillo?.id;

      // PASO 1: Platillo Principal
      if (platillo) {
        const { error } = await supabase.from('platillos').update(datos).eq('id', platillo.id)
        if (error) throw error
      } else {
        const { data: newPlatillo, error } = await supabase.from('platillos').insert([datos]).select().single()
        if (error) throw error
        platilloId = newPlatillo.id
      }

      // PASO 2: Inserciones Relacionales (Delete & Insert)
      if (platilloId) {
         if (platillo) {
           // Purgar viejos settings para aplicar los nuevos sin romper pedidos viejos (snapshots protegen)
           await supabase.from('grupos_opciones').delete().eq('platillo_id', platilloId);
         }

         // Iteramos estructuradamente
         for (const grupo of grupos) {
            // Evitamos grupos vacíos o sin título
            if (!grupo.titulo.trim()) continue;

            const { data: gData, error: gError } = await supabase.from('grupos_opciones').insert({
                platillo_id: platilloId,
                titulo: grupo.titulo,
                es_obligatorio: grupo.es_obligatorio,
                es_multi_seleccion: grupo.es_multi_seleccion,
                limite_maximo: grupo.es_multi_seleccion ? (grupo.limite_maximo || null) : 1
            }).select().single();

            if (gData && !gError) {
                // Preparamos Sub Opciones
                const itemsAInsertar = grupo.items.filter(i => i.nombre.trim() !== "").map(item => ({
                   grupo_id: gData.id,
                   nombre: item.nombre,
                   precio_adicional: Number(item.precio_adicional) || 0,
                   disponible: item.disponible
                }));

                if (itemsAInsertar.length > 0) {
                   await supabase.from('opciones_items').insert(itemsAInsertar);
                }
            }
         }
      }

      onSuccess()
    } catch (error: any) {
      console.error("Error completo:", error);
      alert("Error al guardar: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl text-white">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
           <h2 className="text-2xl font-black italic uppercase">{platillo ? 'Editar Platillo' : 'Nuevo Platillo'}</h2>
           {loadingCarga && <Loader2 className="w-5 h-5 animate-spin text-orange-500" />}
        </div>
        <Button variant="ghost" type="button" onClick={onCancel} className="text-white hover:bg-white/10 rounded-full"><X /></Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input name="nombre" defaultValue={platillo?.nombre} placeholder="Nombre (Ej. Burrito Mix)" required className="h-14 bg-black/40 border-white/10 rounded-2xl font-bold w-full" />
        
        <div className="flex gap-4">
          <Input name="precio" type="number" step="0.01" min="0" defaultValue={platillo?.precio} placeholder="Precio Base ($)" required className="h-14 bg-black/40 border-white/10 rounded-2xl font-bold w-1/2" />
          
          <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-2xl px-4 w-1/2 h-14">
            <Switch 
              id="esta-agotado"
              checked={estaAgotado} 
              onCheckedChange={setEstaAgotado}
            />
            <Label htmlFor="esta-agotado" className="font-bold cursor-pointer text-white">Platillo Agotado</Label>
          </div>
        </div>

        <div>
          <Label className="mb-2 block text-sm font-bold text-gray-400">Imagen del Platillo</Label>
          <Input 
            type="file" 
            name="imagen" 
            accept="image/*" 
            className="h-14 bg-black/40 border-white/10 rounded-2xl font-bold text-white pt-3 file:bg-orange-500 file:text-white file:border-0 file:rounded-xl file:px-4 file:mr-4 file:cursor-pointer hover:file:bg-orange-600 transition-all cursor-pointer" 
          />
          {platillo?.imagen_url && <p className="text-xs text-green-400 mt-2 ml-2">✓ Imagen guardada previamente vinculada.</p>}
        </div>

        <textarea name="descripcion" defaultValue={platillo?.descripcion} className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl h-32 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50" placeholder="Descripción detallada del platillo..." />
        
        {/* === SECCIÓN DE OPCIONES Y EXTRAS === */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex justify-between items-center mb-6">
            <div>
               <h3 className="text-xl font-bold text-orange-400 uppercase italic">Opciones y Combos</h3>
               <p className="text-xs text-gray-400">Agrega modificadores dinámicos para cobrar extra o configurar el plato.</p>
            </div>
            <Button type="button" variant="outline" onClick={addGrupo} className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl h-10 px-4 font-bold">
               <Plus className="w-4 h-4 mr-2" /> Grupo de Selección
            </Button>
          </div>

          <div className="space-y-6">
            {grupos.map((grupo) => (
               <div key={grupo.id} className="bg-black/30 p-6 rounded-2xl border border-white/5 relative">
                  <Button type="button" onClick={() => removeGrupo(grupo.id)} className="absolute top-4 right-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full p-2 h-auto transition-colors"><Trash2 className="w-4 h-4" /></Button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-10">
                     <div className="md:col-span-2 lg:col-span-1">
                        <Label className="text-gray-400 mb-1.5 block font-bold text-xs">TÍTULO DEL GRUPO</Label>
                        <Input value={grupo.titulo} onChange={(e) => updateGrupo(grupo.id, 'titulo', e.target.value)} placeholder="Ej: Elige tu Proteína Principal" required className="h-11 bg-black/60 border-white/10 text-white font-bold rounded-xl" />
                     </div>
                     
                     <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                           <Switch checked={grupo.es_obligatorio} onCheckedChange={(val) => updateGrupo(grupo.id, 'es_obligatorio', val)} />
                           <Label className="text-gray-300 font-bold text-sm cursor-pointer" onClick={() => updateGrupo(grupo.id, 'es_obligatorio', !grupo.es_obligatorio)}>Obligatorio</Label>
                        </div>
                        <div className="flex items-center gap-2">
                           <Switch checked={grupo.es_multi_seleccion} onCheckedChange={(val) => updateGrupo(grupo.id, 'es_multi_seleccion', val)} />
                           <Label className="text-gray-300 font-bold text-sm cursor-pointer" onClick={() => updateGrupo(grupo.id, 'es_multi_seleccion', !grupo.es_multi_seleccion)}>Multi-Selección</Label>
                        </div>
                        {grupo.es_multi_seleccion && (
                           <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10">
                              <Label className="text-gray-400 text-xs font-bold">Máx Elementos:</Label>
                              <Input type="number" min="0" value={grupo.limite_maximo} onChange={(e) => updateGrupo(grupo.id, 'limite_maximo', parseInt(e.target.value) || 0)} className="h-8 w-16 bg-transparent border-none p-0 text-center font-bold text-white focus-visible:ring-0" placeholder="Ilimitado" />
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Sub-Items */}
                  <div className="mt-6 bg-black/20 p-4 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center mb-4">
                         <Label className="text-gray-300 font-bold text-sm">Opciones Específicas ({grupo.items.length})</Label>
                         <Button type="button" onClick={() => addItem(grupo.id)} variant="ghost" className="h-8 text-xs bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 rounded-lg"><Plus className="w-3 h-3 mr-1" /> Añadir Extra</Button>
                      </div>
                      
                      <div className="space-y-3">
                          {grupo.items.map((item) => (
                              <div key={item.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-black/40 p-2 rounded-lg border border-white/5">
                                  <Input value={item.nombre} onChange={(e) => updateItem(grupo.id, item.id, 'nombre', e.target.value)} placeholder="Ej: Arrachera" className="h-10 bg-transparent border-white/10 text-white flex-1 min-w-[150px]" required />
                                  <div className="flex items-center gap-2">
                                     <Label className="text-gray-400 text-xs font-bold hidden sm:block">+$</Label>
                                     <Input type="number" min="0" step="0.5" value={item.precio_adicional} onChange={(e) => updateItem(grupo.id, item.id, 'precio_adicional', parseFloat(e.target.value) || 0)} placeholder="0.00" className="h-10 w-24 bg-transparent border-white/10 text-white font-bold" />
                                  </div>
                                  <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-lg px-3 h-10 w-32 justify-center">
                                     <Switch checked={item.disponible} onCheckedChange={(val) => updateItem(grupo.id, item.id, 'disponible', val)} className="scale-75" />
                                     <span className="text-xs font-bold text-gray-400">{item.disponible ? '✓ Activo' : 'Agotado'}</span>
                                  </div>
                                  <Button type="button" onClick={() => removeItem(grupo.id, item.id)} variant="ghost" className="h-10 w-10 p-0 text-red-500 hover:text-white hover:bg-red-500/80 rounded-lg"><Trash2 className="w-4 h-4" /></Button>
                              </div>
                          ))}
                          {grupo.items.length === 0 && <p className="text-center text-xs text-gray-500 italic py-2">No hay opciones registradas. Añade una presionando el botón.</p>}
                      </div>
                  </div>
               </div>
            ))}
            {grupos.length === 0 && <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-2xl"><p className="text-gray-500 italic text-sm">Este platillo es sencillo y no tiene opciones para personalizar todavía.</p></div>}
          </div>
        </div>
        {/* === FIN SECCIÓN OPCIONES === */}
        
        <div className="pt-4">
           <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 h-16 rounded-2xl font-black text-lg shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-white">
             {loading ? <><Loader2 className="mr-2 w-5 h-5 animate-spin"/> GUARDANDO OPERACIÓN COMPLEJA...</> : <>CONFIRMAR CAMBIOS Y MENÚ  <Save className="ml-2 w-5 h-5" /></>}
           </Button>
        </div>
      </form>
    </div>
  )
}