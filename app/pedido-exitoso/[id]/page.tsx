import { supabase } from "@/lib/supabase"
import Link from "next/link"
export const dynamic = 'force-dynamic';
import { CheckCircle2, MapPin, Phone, MessageCircle, ArrowLeft } from "lucide-react"

export default async function PedidoExitosoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const id = resolvedParams?.id

  if (!id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
        <h1 className="text-2xl font-black text-red-500 mb-4">ID Inválido</h1>
        <Link href="/" className="text-orange-500 font-bold underline">Volver al inicio</Link>
      </div>
    )
  }

  const { data: pedido, error } = await supabase
    .from('pedidos')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !pedido) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
        <h1 className="text-2xl font-black text-red-500 mb-4">Pedido no encontrado</h1>
        <Link href="/" className="text-orange-500 font-bold underline">Volver al inicio</Link>
      </div>
    )
  }

  // Parsear el resumen por si Supabase lo devuelve como string en lugar de objeto JSON
  const resumenArr = typeof pedido.resumen === 'string' ? JSON.parse(pedido.resumen) : (pedido.resumen || [])

  // Configuración de WhatsApp
  const numeroWhatsApp = "526861234567" // Cambiar por el número real de Daniel
  const primerPlatillo = resumenArr[0]?.nombre || 'un platillo'
  const mensajeFormateado = `Hola Daniel, acabo de pedir ${primerPlatillo}, mi ID de pedido es ${pedido.id}`
  const enlaceWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensajeFormateado)}`

  return (
    <div className="min-h-screen bg-background pb-20 font-sans text-foreground">
      {/* Header Celebratorio */}
      <div className="bg-orange-500 pt-16 pb-12 px-6 text-center text-white rounded-b-[3rem] shadow-xl relative">
        <div className="absolute top-6 left-6">
          <Link href="/" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md transition-colors hover:bg-white/30">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
        </div>
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
          <CheckCircle2 className="w-12 h-12 text-green-500" strokeWidth={3} />
        </div>
        <h1 className="text-4xl font-black tracking-tighter italic uppercase drop-shadow-md">¡Recibido!</h1>
        <p className="text-orange-100 font-medium mt-3 text-lg leading-snug">Tu orden está siendo preparada.</p>
        <div className="bg-orange-600/50 inline-block px-5 py-2.5 rounded-2xl mt-5 font-mono text-sm shadow-inner tracking-widest font-bold">
          ID: {pedido.id.split('-')[0].toUpperCase()}
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 mt-8 space-y-6">
        {/* Resumen del pedido */}
        <section className="bg-card border border-border rounded-[2rem] p-6 shadow-sm">
          <h3 className="font-black text-xl tracking-tight mb-5 uppercase text-foreground">Tu Orden</h3>
          <div className="space-y-4">
            {resumenArr.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="font-bold text-foreground text-lg leading-tight">
                    <span className="text-orange-500 mr-1">{item.cantidad}x</span> 
                    {item.nombre}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-snug mt-1.5">{item.opciones}</p>
                </div>
                <span className="font-black text-foreground text-lg">${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-5 pt-5 flex justify-between items-end">
            <span className="font-bold text-muted-foreground uppercase text-sm tracking-wider">Total pagado</span>
            <span className="text-3xl font-black tracking-tighter text-orange-500">${pedido.total.toFixed(2)}</span>
          </div>
        </section>

        {/* Detalles de entrega */}
        <section className="bg-secondary/50 rounded-[2rem] p-6 space-y-5 border border-border/50">
          <div className="flex items-start gap-4">
             <div className="bg-background p-2 rounded-full shadow-sm shrink-0">
               <MapPin className="w-5 h-5 text-orange-500" />
             </div>
             <div>
               <p className="font-black text-foreground text-xs uppercase tracking-widest opacity-70 mb-1">Entrega en</p>
               <p className="text-sm font-bold leading-snug text-foreground/90">{pedido.direccion_entrega}</p>
             </div>
          </div>
          <div className="flex items-start gap-4">
             <div className="bg-background p-2 rounded-full shadow-sm shrink-0">
               <Phone className="w-5 h-5 text-orange-500" />
             </div>
             <div>
               <p className="font-black text-foreground text-xs uppercase tracking-widest opacity-70 mb-1">Contacto</p>
               <p className="text-sm font-bold leading-snug text-foreground/90">{pedido.cliente_telefono}</p>
             </div>
          </div>
        </section>

        {/* Action Button */}
        <a 
          href={enlaceWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white h-16 rounded-[2rem] font-black text-lg shadow-xl shadow-[#25D366]/30 active:scale-[0.98] transition-transform uppercase tracking-tight mt-4"
        >
          <MessageCircle className="w-6 h-6" />
          Avisar por WhatsApp
        </a>
      </div>
    </div>
  )
}
