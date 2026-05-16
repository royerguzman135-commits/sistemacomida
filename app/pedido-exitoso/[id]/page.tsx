import { supabase } from "@/lib/supabase"
import Link from "next/link"
export const dynamic = 'force-dynamic';
import { 
  ChevronLeft, 
  Headset, 
  ClipboardList, 
  ChefHat, 
  Zap, 
  MapPin,
  Phone,
  MessageSquare,
  DollarSign,
  DoorOpen,
  CreditCard,
  Utensils
} from "lucide-react"

export default async function PedidoRecibidoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const id = resolvedParams?.id

  if (!id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-black">
        <h1 className="text-2xl font-black text-red-500 mb-4">ID Inválido</h1>
        <Link href="/" className="text-orange-500 font-bold underline">Volver al inicio</Link>
      </div>
    )
  }

  const { data: pedido, error } = await supabase
    .from('pedidos')
    .select('*, comercios(nombre)')
    .eq('id', id)
    .single()

  if (error || !pedido) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-black">
        <h1 className="text-2xl font-black text-red-500 mb-4">Pedido no encontrado</h1>
        <Link href="/" className="text-orange-500 font-bold underline">Volver al inicio</Link>
      </div>
    )
  }

  // Fallback si no viene el join correctamente
  const nombreComercio = pedido.comercios?.nombre || 'Restaurante'

  // Parsear el resumen del pedido
  const resumenArr = typeof pedido.resumen === 'string' ? JSON.parse(pedido.resumen) : (pedido.resumen || [])

  // Determinar el paso actual basado en el estado
  const estadoMap: Record<string, { step: number; text: string }> = {
    'pendiente': { step: 1, text: 'Recibimos tu pedido' },
    'preparando': { step: 2, text: 'Preparando tu comida' },
    'en_camino': { step: 3, text: 'Tu pedido va en camino' },
    'entregado': { step: 4, text: '¡Pedido Entregado!' },
  }
  const estadoActual = estadoMap[pedido.estado?.toLowerCase()] || estadoMap['pendiente']

  return (
    <div className="min-h-screen bg-black pb-20 font-sans text-white">
      {/* Header Compacto */}
      <div className="flex items-center justify-between px-4 py-5 bg-black sticky top-0 z-50">
        <Link href="/" className="w-10 h-10 flex items-center justify-center bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-xl font-black text-white">{estadoActual.text}</h1>
        <button className="w-10 h-10 flex items-center justify-center bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors">
          <Headset className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="px-4 mt-2">
        {/* Tarjeta 1: Línea de Tiempo + Mapa Simbólico */}
        <div className="bg-zinc-900 border border-zinc-800/50 p-5 rounded-3xl mb-4">
          <p className="text-center font-bold text-lg mb-6">6:52 PM <span className="text-zinc-400 font-medium text-base">Llegada estimada</span></p>
          
          {/* Stepper Visual */}
          <div className="flex justify-between items-center relative px-2">
            {/* Línea conectora de fondo */}
            <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-zinc-800 -translate-y-1/2 z-0"></div>
            {/* Línea conectora activa (simulada basada en step) */}
            <div className="absolute top-1/2 left-6 h-0.5 bg-orange-500 -translate-y-1/2 z-0 transition-all duration-500" 
                 style={{ width: `calc(${(estadoActual.step - 1) * 33.33}% - 1rem)` }}>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${estadoActual.step >= 1 ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-zinc-800 text-zinc-500'}`}>
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${estadoActual.step >= 2 ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-zinc-800 text-zinc-500'}`}>
                <ChefHat className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${estadoActual.step >= 3 ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-zinc-800 text-zinc-500'}`}>
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${estadoActual.step >= 4 ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-zinc-800 text-zinc-500'}`}>
                <MapPin className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Mapa Placeholder */}
          <div className="w-full h-48 bg-zinc-950 rounded-2xl overflow-hidden mt-6 relative border border-zinc-800/60 flex items-center justify-center">
            {/* Simulación de calles estéticas en gris muy oscuro */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3f3f46 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
            
            {/* Ruta simulada */}
            <svg className="absolute inset-0 w-full h-full stroke-orange-500/50 stroke-[4] fill-none opacity-50" preserveAspectRatio="none" viewBox="0 0 100 100">
               <path d="M 20 80 Q 40 80, 50 50 T 80 20" strokeDasharray="6 6" />
            </svg>

            {/* Pin Restaurante */}
            <div className="absolute bottom-6 left-10 w-8 h-8 bg-zinc-800 rounded-full border-2 border-zinc-700 flex items-center justify-center shadow-lg">
              <Utensils className="w-4 h-4 text-zinc-400" />
            </div>

            {/* Pin Repartidor/Usuario */}
            <div className="absolute top-6 right-10 w-10 h-10 bg-orange-500 rounded-full border-4 border-black flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] z-10 animate-pulse">
              <MapPin className="w-5 h-5 text-white" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Información del Repartidor */}
        {estadoActual.step >= 2 && (
          <div className="bg-zinc-900 rounded-3xl p-5 mb-4 border border-zinc-800/50">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-zinc-800 rounded-full overflow-hidden border-2 border-zinc-700 mb-3">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alan" alt="Repartidor" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-white font-bold text-lg">Alan Josael</h3>
              <p className="text-zinc-400 text-sm font-medium">Vehículo: Moto • ⭐ 4.9</p>
            </div>
            
            <div className="flex justify-center gap-6 mt-5 pt-5 border-t border-zinc-800/60">
              <button className="bg-zinc-800 hover:bg-zinc-700 text-white p-3.5 rounded-full transition-colors">
                <Phone className="w-5 h-5" />
              </button>
              <button className="bg-zinc-800 hover:bg-zinc-700 text-white p-3.5 rounded-full transition-colors">
                <MessageSquare className="w-5 h-5" />
              </button>
              <button className="bg-zinc-800 hover:bg-zinc-700 text-white p-3.5 rounded-full transition-colors">
                <DollarSign className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Tarjeta 3: Detalles de la Entrega */}
        <div className="bg-zinc-900 rounded-3xl p-5 mb-4 flex flex-col gap-5 border border-zinc-800/50">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <MapPin className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-zinc-400 text-xs uppercase tracking-wider font-bold mb-1">Entregar en</p>
              <p className="text-white font-semibold text-sm leading-snug">{pedido.direccion_entrega}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <DoorOpen className="w-6 h-6 text-zinc-500" />
            </div>
            <div>
              <p className="text-zinc-400 text-xs uppercase tracking-wider font-bold mb-1">Instrucciones</p>
              <p className="text-white font-semibold text-sm">Encontrarse en tu puerta</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1">
              <CreditCard className="w-6 h-6 text-zinc-500" />
            </div>
            <div>
              <p className="text-zinc-400 text-xs uppercase tracking-wider font-bold mb-1">Método de Pago</p>
              <p className="text-white font-semibold text-sm flex items-center gap-2">
                Efectivo / Tarjeta simulada
              </p>
            </div>
          </div>
        </div>

        {/* Tarjeta 4: Resumen de Compra */}
        <div className="bg-zinc-900 rounded-3xl p-5 mb-6 border border-zinc-800/50">
          <h3 className="text-white font-black text-lg mb-4 uppercase tracking-wide">{nombreComercio}</h3>
          
          <div className="space-y-3 mb-5">
            {resumenArr.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-start gap-4">
                <p className="text-sm font-semibold text-white">
                  <span className="text-zinc-400 mr-2">{item.cantidad}x</span> 
                  {item.nombre}
                </p>
                <span className="text-sm font-bold text-white shrink-0">${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-800/60 pt-4 flex justify-between items-center mb-6">
            <span className="text-zinc-400 font-bold uppercase tracking-wider text-sm">Total</span>
            <span className="text-white font-black text-xl">${pedido.total.toFixed(2)}</span>
          </div>

          <div className="flex gap-3">
            <button className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl py-3.5 flex-1 text-center font-bold text-sm transition-colors border border-zinc-700/50">
              Ver recibo
            </button>
            <button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3.5 flex-1 text-center font-bold text-sm transition-colors shadow-lg shadow-orange-500/10">
              Pedir de nuevo
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
