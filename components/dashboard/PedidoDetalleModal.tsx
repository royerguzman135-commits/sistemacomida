"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, User, ShoppingBag, MessageCircle, Map, CheckCircle2, ClipboardList } from "lucide-react"

interface PedidoDetalleModalProps {
  pedido: any
  isOpen: boolean
  onClose: () => void
  onMarcarEntregado: (id: string) => void
}

export function PedidoDetalleModal({ pedido, isOpen, onClose, onMarcarEntregado }: PedidoDetalleModalProps) {
  if (!pedido) return null

  const idCorto = pedido.id ? pedido.id.substring(0, 8).toUpperCase() : '...'
  const productos = Array.isArray(pedido.resumen) ? pedido.resumen : []
  
  const msgWa = encodeURIComponent(`Hola ${pedido.cliente_nombre || ''}, somos Sabor Local. ¡Tu pedido va en camino!`)

  // Manejo seguro de valores nulos o no definidos
  const notas = pedido.notas_cliente || pedido.notas
  const subtotalComida = pedido.subtotal_comida || pedido.total_cliente || 0
  const costoEnvio = pedido.costo_envio || 0
  const total = pedido.total_cliente || 0

  const hasCoords = pedido.lat !== null && pedido.lat !== undefined && pedido.lng !== null && pedido.lng !== undefined

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-background text-foreground border-border rounded-3xl p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-card sticky top-0 z-10 rounded-t-3xl">
          <DialogTitle className="flex items-center gap-2 text-2xl font-black italic tracking-tight">
            <span className="text-orange-500">#{idCorto}</span>
            <span className="text-muted-foreground/30 mx-1">|</span>
            {pedido.cliente_nombre || "Cliente Anónimo"}
          </DialogTitle>
          <div className="flex gap-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${pedido.estado === 'entregado' ? 'bg-gray-200 text-gray-600' : 'bg-orange-200 text-orange-700'}`}>
              {pedido.estado || 'Pendiente'}
            </span>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* SECCIÓN: Información de Entrega */}
          <section className="space-y-4">
            <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" /> Información de Entrega
            </h3>
            
            <div className="bg-secondary/50 p-4 rounded-2xl border border-border space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-foreground leading-snug">
                    {pedido.direccion_entrega || "Recoger en tienda"}
                  </p>
                  {pedido.cliente_numero_casa && (
                    <p className="text-sm text-muted-foreground font-medium mt-0.5">
                      Número: {pedido.cliente_numero_casa}
                    </p>
                  )}
                </div>
              </div>

              {pedido.cliente_telefono && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground shrink-0" />
                  <p className="font-bold text-foreground">{pedido.cliente_telefono}</p>
                </div>
              )}

              <div className="flex items-start gap-3 pt-3 border-t border-border/50">
                <ClipboardList className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Notas Especiales</p>
                  <p className={`text-sm ${notas ? 'font-medium text-foreground' : 'italic text-muted-foreground'}`}>
                    {notas || "Sin notas adicionales"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN: Desglose de Productos */}
          <section className="space-y-4">
            <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-orange-500" /> El Carrito
            </h3>
            
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="max-h-60 overflow-y-auto p-4 space-y-4">
                {productos.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-4">No hay productos registrados</p>
                ) : (
                  productos.map((prod: any, idx: number) => (
                    <div key={idx} className="flex gap-3 text-sm pb-4 border-b border-border/50 last:border-0 last:pb-0">
                      <div className="font-black text-orange-500 text-base min-w-[2ch]">
                        {prod.cantidad}x
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base leading-tight text-foreground">{prod.nombre}</p>
                        {(prod.opciones || prod.notas) && (
                          <p className="text-xs text-muted-foreground leading-tight mt-1 font-medium">
                            {Array.isArray(prod.opciones) 
                              ? prod.opciones.map((opt:any) => opt.nombre_opcion).join(', ') 
                              : prod.opciones}
                            {prod.notas && <span className="block mt-0.5 italic text-orange-600">Nota: {prod.notas}</span>}
                          </p>
                        )}
                      </div>
                      <div className="font-bold text-muted-foreground whitespace-nowrap text-right min-w-[4ch]">
                        ${prod.subtotal}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="bg-secondary/50 p-4 border-t border-border space-y-2">
                <div className="flex justify-between text-sm font-bold text-muted-foreground">
                  <span>Subtotal de comida</span>
                  <span>${subtotalComida}</span>
                </div>
                {costoEnvio > 0 && (
                  <div className="flex justify-between text-sm font-bold text-muted-foreground">
                    <span>Costo de envío</span>
                    <span>${costoEnvio}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                  <span className="font-black uppercase tracking-widest text-foreground text-sm">Total Final</span>
                  <span className="font-black text-2xl text-orange-500">${total}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* SECCIÓN: Footer de Acciones Rápidas */}
        <div className="p-6 bg-secondary/30 border-t border-border sticky bottom-0 z-10 rounded-b-3xl">
          <div className="grid grid-cols-2 gap-3">
            <a 
              href={`https://wa.me/52${pedido.cliente_telefono?.replace(/\D/g, '')}?text=${msgWa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-green-500/20 transition-transform active:scale-95"
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp
            </a>
            
            <a 
              href={hasCoords ? `https://www.google.com/maps?q=${pedido.lat},${pedido.lng}` : '#'}
              target={hasCoords ? "_blank" : undefined}
              rel="noopener noreferrer"
              onClick={(e) => !hasCoords && e.preventDefault()}
              className={`flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wider py-4 rounded-xl shadow-lg transition-transform active:scale-95 ${!hasCoords ? 'bg-secondary border-2 border-border text-muted-foreground/50 opacity-60 cursor-not-allowed shadow-none' : 'bg-[#4285F4] hover:bg-[#3b77db] text-white shadow-blue-500/20'}`}
            >
              <Map className="w-5 h-5" /> {hasCoords ? 'Ver en Maps' : 'Sin Mapa'}
            </a>
            
            {pedido.estado !== 'entregado' && (
              <Button 
                onClick={() => {
                  onMarcarEntregado(pedido.id)
                  onClose()
                }}
                className="col-span-2 h-14 mt-1 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 transition-transform active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Marcar como Entregado
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
