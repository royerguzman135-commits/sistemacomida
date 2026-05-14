"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, MapPin, Phone, CheckCircle2, Clock, Map, MessageCircle, ClipboardList } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { PedidoDetalleModal } from "./PedidoDetalleModal"

interface PedidosBoardProps {
  comercioId: string
}

export function PedidosBoard({ comercioId }: PedidosBoardProps) {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sonidoActivo, setSonidoActivo] = useState(false)
  const [tab, setTab] = useState<'activos' | 'historial'>('activos')
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Inicializar el audio
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notificacion.mp3')
    }
  }, [])

  useEffect(() => {
    if (!comercioId) return

    const fetchPedidos = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('comercio_id', comercioId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setPedidos(data)
      }
      setLoading(false)
    }

    fetchPedidos()

    // Realtime Subscription
    const channel = supabase
      .channel('public:pedidos')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'pedidos',
        filter: `comercio_id=eq.${comercioId}` 
      }, (payload) => {
        setPedidos(prev => [payload.new, ...prev])
        // Reproducir sonido si está activo
        if (audioRef.current && sonidoActivo) {
          // El navegador puede bloquear esto si no hubo interacción previa
          audioRef.current.play().catch(e => console.log('Auto-play preventivo', e))
        }
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'pedidos',
        filter: `comercio_id=eq.${comercioId}` 
      }, (payload) => {
        setPedidos(prev => prev.map(p => p.id === payload.new.id ? payload.new : p))
      })
      .subscribe((status) => {
        console.log('Estado de la suscripción Realtime:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conectado exitosamente a Supabase Realtime para comercio:', comercioId)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [comercioId, sonidoActivo])

  const handleMarcarEntregado = async (pedidoId: string) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: 'entregado' })
      .eq('id', pedidoId)
      
    if (!error) {
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, estado: 'entregado' } : p))
    } else {
      alert("Error al actualizar el pedido: " + error.message)
    }
  }

  const openModal = (pedido: any) => {
    setPedidoSeleccionado(pedido)
    setIsModalOpen(true)
  }

  // Activar sonido manualmente para evitar bloqueo del navegador
  const toggleSonido = (checked: boolean) => {
    setSonidoActivo(checked)
    if (checked && audioRef.current) {
      // Truco: reproducir y pausar inmediatamente para "desbloquear" el AudioContext del navegador
      audioRef.current.play().then(() => {
        audioRef.current?.pause()
        audioRef.current!.currentTime = 0
      }).catch(e => console.log(e))
    }
  }

  const pedidosActivos = pedidos.filter(p => p.estado !== 'entregado')
  const pedidosHistorial = pedidos.filter(p => p.estado === 'entregado')

  const pedidosAMostrar = tab === 'activos' ? pedidosActivos : pedidosHistorial

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
    </div>
  )

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-3xl border shadow-sm">
        <div className="flex bg-secondary p-1 rounded-2xl w-full sm:w-auto">
          <button 
            onClick={() => setTab('activos')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-xl font-bold text-sm transition-all ${tab === 'activos' ? 'bg-orange-500 shadow-sm text-white' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Activos ({pedidosActivos.length})
          </button>
          <button 
            onClick={() => setTab('historial')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-xl font-bold text-sm transition-all ${tab === 'historial' ? 'bg-orange-500 shadow-sm text-white' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Historial ({pedidosHistorial.length})
          </button>
        </div>
        
        <div className="flex items-center gap-3 bg-secondary/50 px-4 py-3 sm:py-2 rounded-2xl w-full sm:w-auto justify-between sm:justify-start">
          <Label className="text-sm font-bold cursor-pointer" htmlFor="sound-toggle">Alertas Sonoras</Label>
          <Switch 
            id="sound-toggle"
            checked={sonidoActivo} 
            onCheckedChange={toggleSonido} 
            className="data-[state=checked]:bg-orange-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {pedidosAMostrar.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold">No hay pedidos {tab === 'activos' ? 'activos' : 'en el historial'}</h3>
            <p className="text-sm mt-2">Los pedidos aparecerán aquí automáticamente.</p>
          </div>
        ) : (
          pedidosAMostrar.map(pedido => {
            const fecha = new Date(pedido.created_at)
            const horaStr = format(fecha, "hh:mm a", { locale: es })
            const fechaStr = format(fecha, "dd MMM yyyy", { locale: es })
            
            // Validar que resumen sea un array (en base de datos debería ser jsonb)
            const productos = Array.isArray(pedido.resumen) ? pedido.resumen : []
            
            // Mensaje de WhatsApp
            const msgWa = encodeURIComponent(`Hola ${pedido.cliente_nombre || ''}, somos Sabor Local. ¡Tu pedido va en camino!`)
            
            return (
              <Card key={pedido.id} className="rounded-[2rem] overflow-hidden border shadow-lg flex flex-col relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Card */}
                <div 
                  onClick={() => openModal(pedido)}
                  className={`p-5 ${pedido.estado === 'entregado' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-orange-50 dark:bg-orange-900/20'} border-b flex justify-between items-start cursor-pointer hover:opacity-80 transition-opacity`}
                >
                  <div>
                    <h3 className="font-black text-xl leading-none text-foreground">{pedido.cliente_nombre || "Cliente Anónimo"}</h3>
                    <p className="text-sm font-bold text-muted-foreground mt-1.5 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> {fechaStr} • {horaStr}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${pedido.estado === 'entregado' ? 'bg-gray-200 text-gray-600' : 'bg-orange-200 text-orange-700'}`}>
                    {pedido.estado || 'Pendiente'}
                  </div>
                </div>

                {/* Body Card */}
                <div 
                  onClick={() => openModal(pedido)}
                  className="p-5 flex-1 flex flex-col gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-3">
                    {productos.map((prod: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-start text-sm">
                        <div className="flex gap-2.5">
                          <span className="font-black text-orange-500 text-base">{prod.cantidad}x</span>
                          <div>
                            <p className="font-bold text-base leading-tight">{prod.nombre}</p>
                            {prod.opciones && prod.opciones.length > 0 && (
                              <p className="text-xs text-muted-foreground leading-tight mt-1 font-medium">
                                {prod.opciones.map((opt:any) => opt.nombre_opcion).join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-muted-foreground whitespace-nowrap">${prod.subtotal}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-auto pt-4 border-t flex justify-between items-center">
                    <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">Total</span>
                    <span className="text-3xl font-black text-foreground">${pedido.total_cliente}</span>
                  </div>
                  
                  <div className="bg-secondary/50 p-3.5 rounded-xl border">
                    <p className="text-xs font-bold flex items-start gap-2 leading-snug">
                      <MapPin className="w-4 h-4 shrink-0 text-orange-500" /> 
                      {pedido.direccion_entrega || "Recoger en tienda"}
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-secondary/30 border-t grid grid-cols-2 gap-3">
                  <a 
                    href={`https://wa.me/52${pedido.cliente_telefono?.replace(/\D/g, '')}?text=${msgWa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-lg shadow-green-500/20 transition-transform active:scale-95"
                  >
                    <MessageCircle className="w-5 h-5" /> WA
                  </a>
                  
                  <a 
                    href={`https://www.google.com/maps?q=${pedido.lat},${pedido.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-lg transition-transform active:scale-95 ${(!pedido.lat || !pedido.lng) ? 'bg-gray-200 text-gray-400 pointer-events-none shadow-none' : 'bg-[#4285F4] hover:bg-[#3b77db] text-white shadow-blue-500/20'}`}
                  >
                    <Map className="w-5 h-5" /> Maps
                  </a>
                  
                  {pedido.estado !== 'entregado' && (
                    <Button 
                      onClick={() => handleMarcarEntregado(pedido.id)}
                      className="col-span-2 h-14 mt-1 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 transition-transform active:scale-95"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Marcar como Entregado
                    </Button>
                  )}
                </div>
              </Card>
            )
          })
        )}
      </div>

      <PedidoDetalleModal 
        pedido={pedidoSeleccionado} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onMarcarEntregado={handleMarcarEntregado} 
      />
    </div>
  )
}
