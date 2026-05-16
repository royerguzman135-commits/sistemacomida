"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Phone, Map, Loader2, ArrowRight, CheckCircle2, X } from "lucide-react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useCartStore } from "@/store/cartStore"
import { useRouter } from "next/navigation"

interface CheckoutDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CheckoutDrawer({ isOpen, onClose }: CheckoutDrawerProps) {
  const router = useRouter()
  const { items, clearCart } = useCartStore()
  
  // Pasos: 1 = Teléfono, 2 = OTP, 3 = Dirección/Contacto, 4 = Éxito
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [loading, setLoading] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  // Datos Auth SMS
  const [telefonoAuth, setTelefonoAuth] = useState("")
  const [otp, setOtp] = useState("")
  const [userId, setUserId] = useState<string | null>(null)

  // Datos de Contacto y Dirección
  const [telefono, setTelefono] = useState("")
  const [nombre, setNombre] = useState("")
  const [direccionExistente, setDireccionExistente] = useState<any>(null)
  const [editandoDireccion, setEditandoDireccion] = useState(false)
  const [calle, setCalle] = useState("")
  const [numero, setNumero] = useState("")
  const [colonia, setColonia] = useState("")
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)

  // 0. Verificar sesión inicial
  useEffect(() => {
    if (isOpen) {
      setAuthChecking(true)
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setUserId(user.id)
          setStep(3)
        } else {
          setStep(1)
        }
        setAuthChecking(false)
      })
    }
  }, [isOpen])

  // Listener para detectar cambios en Auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUserId(session.user.id)
        setStep(3)
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Cargar dirección al llegar al paso 3
  useEffect(() => {
    if (step === 3 && userId) {
      const loadAddress = async () => {
        setLoading(true)
        const { data, error } = await supabase
          .from('direcciones_usuario')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        if (data) {
          setDireccionExistente(data)
          setCalle(data.calle || "")
          setNumero(data.numero || "")
          setColonia(data.colonia || "")
          setNombre(data.nombre || "")
          setTelefono(data.telefono || "")
          if (data.lat && data.lng) setCoords({ lat: data.lat, lng: data.lng })
          setEditandoDireccion(false)
        } else {
          setDireccionExistente(null)
          setEditandoDireccion(true)
        }
        setLoading(false)
      }
      loadAddress()
    }
  }, [step, userId])

  // 1. Enviar SMS OTP
  const handleEnviarSMS = async (e: React.FormEvent) => {
    e.preventDefault()
    const telefonoLimpio = telefonoAuth.replace(/\\D/g, '').slice(-10)
    if (telefonoLimpio.length !== 10) {
      alert("Por favor ingresa un número de teléfono válido de 10 dígitos.")
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        phone: `+52${telefonoLimpio}`
      })
      if (error) throw error
      setStep(2)
    } catch (error: any) {
      console.error(error)
      alert("Ocurrió un error al enviar el código. Por favor revisa el número e intenta nuevamente.")
    }
    setLoading(false)
  }

  // 2. Verificar SMS OTP
  const handleVerificarSMS = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) return
    const telefonoLimpio = telefonoAuth.replace(/\\D/g, '').slice(-10)
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({ 
        phone: `+52${telefonoLimpio}`,
        token: otp, 
        type: 'sms' 
      })
      
      if (error) throw error

      if (data?.user) {
        // Envolvemos en setTimeout para ceder el hilo principal (event loop)
        // y evitar el error "releasePointerCapture" nativo de Radix UI / navegadores
        setTimeout(() => {
          // 1. NO usamos onClose() para que no se cierre la ventana.
          // 2. Avanzamos el paso de forma manual
          setUserId(data.user.id)
          setStep(3)
          
          // 3. Refrescamos los datos del servidor para que el layout sepa que ya hay sesión activa
          router.refresh()
        }, 50)
      }
    } catch (error: any) {
      console.error(error)
      alert("Código inválido o ha expirado.")
      setLoading(false)
    }
  }

  // 2. Obtener Ubicación GPS
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.")
      return
    }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setGpsLoading(false)
        if (navigator.vibrate) navigator.vibrate(50)
      },
      (error) => {
        alert("No se pudo obtener tu ubicación. Por favor, asegúrate de dar permisos.")
        setGpsLoading(false)
      },
      { enableHighAccuracy: true }
    )
  }

  // 3. Confirmar Pedido
  const handleConfirmarPedido = async () => {
    if (editandoDireccion && (!calle || !numero || !nombre)) {
      alert("Por favor completa tu Nombre, Calle y Número exterior/interior.")
      return
    }

    setLoading(true)
    try {
      // a) Guardar o actualizar la dirección en direcciones_usuario
      let direccionFinalStr = ""
      if (editandoDireccion) {
        const payloadDir = {
          user_id: userId,
          telefono,
          nombre,
          calle,
          numero,
          colonia,
          lat: coords?.lat || null,
          lng: coords?.lng || null
        }
        
        const { error: dirError } = await supabase
          .from('direcciones_usuario')
          .upsert(payloadDir, { onConflict: 'user_id' }) // Usamos user_id como key única
          
        if (dirError) throw dirError
        direccionFinalStr = `${calle} #${numero}, Col. ${colonia}`
      } else {
        direccionFinalStr = `${direccionExistente.calle} #${direccionExistente.numero}, Col. ${direccionExistente.colonia}`
      }

      // b) Calcular Total y Preparar Resumen JSON
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      // Asumimos que todos los items son del mismo comercio
      const comercioId = items.length > 0 ? (items[0].comercioId || localStorage.getItem('comercio_id_global')) : localStorage.getItem('comercio_id_global')

      if (!comercioId) {
        alert("Error crítico: No se detectó el restaurante asociado a este pedido. Por favor intenta agregarlo de nuevo.")
        setLoading(false)
        return
      }

      // c) Obtener Coordenadas GPS (Opcionales)
      const latFinal = coords?.lat || direccionExistente?.lat || null
      const lngFinal = coords?.lng || direccionExistente?.lng || null

      const resumenJson = items.map(i => ({
        cantidad: i.quantity,
        nombre: i.name,
        opciones: i.resumen_opciones,
        precio_unitario: i.price,
        subtotal: i.price * i.quantity
      }))

      // c) Insertar Pedido
      const payloadPedido = {
        comercio_id: comercioId,
        user_id: userId,
        cliente_nombre: nombre || direccionExistente?.nombre || "Cliente Anónimo",
        cliente_telefono: telefono || telefonoAuth.replace(/\\D/g, '').slice(-10),
        direccion_entrega: direccionFinalStr,
        lat: latFinal,
        lng: lngFinal,
        total,
        total_cliente: total,
        estado: 'pendiente',
        resumen: resumenJson
      }

      const { data: pedData, error: pedError } = await supabase
        .from('pedidos')
        .insert([payloadPedido])
        .select()

      if (pedError) throw pedError

      // Éxito
      if (navigator.vibrate) navigator.vibrate([100, 50, 100])
      clearCart()
      
      if (pedData && pedData.length > 0) {
        onClose()
        router.push(`/pedido-exitoso/${pedData[0].id}`)
      } else {
        setStep(3)
      }
      
    } catch (error: any) {
      console.error(error)
      alert("Error al procesar el pedido: " + error.message)
    }
    setLoading(false)
  }

  // --- RENDERS POR PASO ---

  const renderStep1 = () => (
    <form onSubmit={handleEnviarSMS} className="space-y-6 px-6 pb-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-zinc-400 font-bold uppercase tracking-wider text-xs">Tu Número de Celular</Label>
          <div className="relative flex items-center">
            <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center pl-4 pr-3 text-zinc-400 font-bold border-r border-zinc-800">
              +52
            </div>
            <Input 
              type="tel" 
              placeholder="123 456 7890" 
              value={telefonoAuth}
              onChange={(e) => setTelefonoAuth(e.target.value)}
              className="h-14 pl-16 rounded-[1.25rem] bg-zinc-900 border-zinc-800 text-white font-bold placeholder:text-zinc-600 focus-visible:ring-orange-500"
              required
              autoFocus
              maxLength={14}
            />
          </div>
          <p className="text-xs text-zinc-500 pt-2">Te enviaremos un código temporal por SMS para acceder.</p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <Button 
          type="submit" 
          disabled={loading || telefonoAuth.replace(/\\D/g, '').length < 10}
          className="w-full h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-transform"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Enviar código'}
        </Button>
      </div>
    </form>
  )

  const renderStep2 = () => (
    <form onSubmit={handleVerificarSMS} className="space-y-6 px-6 pb-6 animate-in slide-in-from-right-8 duration-300">
      <div className="space-y-4 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center">
          <Phone className="w-8 h-8 text-orange-500" />
        </div>
        <div>
          <h3 className="font-black text-xl text-white">Ingresa el código</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Enviamos un código al <strong className="text-white">+52 {telefonoAuth.replace(/\\D/g, '').slice(-10)}</strong>
          </p>
        </div>
        
        <div className="py-4 flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(val) => setOtp(val)}
            autoFocus
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot index={0} className="h-14 w-12 sm:w-14 text-2xl bg-zinc-900 border-zinc-800 text-white rounded-xl" />
              <InputOTPSlot index={1} className="h-14 w-12 sm:w-14 text-2xl bg-zinc-900 border-zinc-800 text-white rounded-xl" />
              <InputOTPSlot index={2} className="h-14 w-12 sm:w-14 text-2xl bg-zinc-900 border-zinc-800 text-white rounded-xl" />
              <InputOTPSlot index={3} className="h-14 w-12 sm:w-14 text-2xl bg-zinc-900 border-zinc-800 text-white rounded-xl" />
              <InputOTPSlot index={4} className="h-14 w-12 sm:w-14 text-2xl bg-zinc-900 border-zinc-800 text-white rounded-xl" />
              <InputOTPSlot index={5} className="h-14 w-12 sm:w-14 text-2xl bg-zinc-900 border-zinc-800 text-white rounded-xl" />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      <div className="space-y-3">
        <Button 
          type="submit" 
          disabled={loading || otp.length !== 6}
          className="w-full h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-transform"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirmar y Pedir'}
        </Button>
        <Button 
          type="button"
          variant="ghost" 
          onClick={() => setStep(1)} 
          className="w-full font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl h-12"
        >
          Regresar (Cambiar número)
        </Button>
      </div>
    </form>
  )

  const renderStep3 = () => (
    <div className="px-6 pb-6 space-y-6 animate-in slide-in-from-right-8 duration-300">
      {!editandoDireccion && direccionExistente ? (
        <div className="space-y-4">
          <div className="p-5 rounded-[1.5rem] bg-zinc-900 border border-zinc-800">
            <div className="flex items-start gap-3 mb-2">
              <MapPin className="text-orange-500 w-6 h-6 shrink-0 mt-1" />
              <div>
                <h4 className="font-black text-white text-lg">Dirección Guardada</h4>
                <p className="font-bold text-zinc-300 leading-snug mt-1">
                  {direccionExistente.calle} #{direccionExistente.numero}
                </p>
                {direccionExistente.colonia && (
                  <p className="text-sm text-zinc-500 mt-2 italic border-t border-zinc-800 pt-2">
                    Colonia: {direccionExistente.colonia}
                  </p>
                )}
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setEditandoDireccion(true)}
            className="w-full h-12 rounded-xl border-zinc-800 text-orange-500 font-bold hover:bg-zinc-900 bg-transparent hover:text-orange-400"
          >
            Editar Dirección / Entregar en otro lugar
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-400 font-bold">Tu Nombre (Para entregarte)</Label>
            <Input 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              placeholder="Juan Pérez" 
              className="h-14 rounded-xl bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400 font-bold">Teléfono de Contacto</Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <Input 
                type="tel"
                value={telefono} 
                onChange={(e) => setTelefono(e.target.value.replace(/\\D/g, ''))} 
                placeholder="686 123 4567" 
                maxLength={10}
                className="h-14 pl-12 rounded-xl bg-zinc-900 border-zinc-800 text-white font-bold tracking-wider placeholder:text-zinc-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label className="text-zinc-400 font-bold">Calle</Label>
              <Input 
                value={calle} 
                onChange={(e) => setCalle(e.target.value)} 
                placeholder="Ej. Av. Reforma" 
                className="h-14 rounded-xl bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
              />
            </div>
            <div className="col-span-1 space-y-2">
              <Label className="text-zinc-400 font-bold">Número</Label>
              <Input 
                value={numero} 
                onChange={(e) => setNumero(e.target.value)} 
                placeholder="#123" 
                className="h-14 rounded-xl bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400 font-bold">Colonia</Label>
            <Input 
              value={colonia} 
              onChange={(e) => setColonia(e.target.value)} 
              placeholder="Ej. Centro, Jardines del Valle" 
              className="h-14 rounded-xl bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
            />
          </div>

          <Button 
            type="button"
            onClick={handleGetLocation}
            variant="secondary"
            className={`w-full h-14 rounded-xl font-bold flex items-center gap-2 border-2 transition-all ${coords ? 'bg-green-900/30 border-green-500 text-green-500' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'}`}
          >
            {gpsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Map className="w-5 h-5" />}
            {coords ? '✅ Ubicación GPS Capturada' : 'Capturar mi ubicación GPS (Recomendado)'}
          </Button>
        </div>
      )}

      <DrawerFooter className="px-0 pt-4">
        <Button 
          onClick={handleConfirmarPedido}
          disabled={loading}
          className="w-full h-16 rounded-[2rem] bg-orange-500 hover:bg-orange-600 text-white font-black text-xl shadow-xl shadow-orange-500/20 transition-transform active:scale-95"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirmar Pedido'}
        </Button>
        <Button 
          variant="ghost" 
          onClick={async () => {
            await supabase.auth.signOut()
            setUserId(null)
            setStep(1)
          }} 
          className="font-bold text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 rounded-xl h-12 mt-2"
        >
          Cerrar Sesión
        </Button>
      </DrawerFooter>
    </div>
  )

  const renderStep4 = () => (
    <div className="px-6 pb-12 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-green-900/30 rounded-full flex items-center justify-center mb-2 border border-green-800/50">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </div>
      <h2 className="text-3xl font-black tracking-tighter text-white">¡Pedido Confirmado!</h2>
      <p className="text-zinc-400 text-lg leading-relaxed">
        El restaurante ya está recibiendo tu orden.<br/>¡Tu comida llegará muy pronto!
      </p>
      <Button 
        onClick={() => {
          onClose()
          setTimeout(() => setStep(1), 500)
        }}
        className="mt-6 w-full h-14 rounded-2xl font-bold bg-zinc-800 text-white hover:bg-zinc-700"
      >
        Volver al Menú
      </Button>
    </div>
  )

  return (
    <Drawer repositionInputs={false} dismissible={false} open={isOpen} onOpenChange={(o) => {
      if(!o && step !== 4) {
        onClose()
        // Reset only if not authenticated, else keep at step 3
        setTimeout(() => {
           if (!userId) setStep(1)
           else setStep(3)
        }, 500)
      }
    }}>
      <DrawerContent className="max-h-[95dvh] flex flex-col bg-zinc-950 text-white border-zinc-900 rounded-t-[2rem]">
        {/* Título oculto para accesibilidad */}
        <DrawerTitle className="sr-only">Checkout Sabor Local</DrawerTitle>
        
        {authChecking ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          </div>
        ) : (
          <>
            {step !== 4 && (
              <DrawerHeader className="text-center pt-8 pb-6 shrink-0 relative">
                <button 
                  onClick={onClose}
                  className="absolute right-4 top-4 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <DrawerTitle className="text-3xl font-black tracking-tighter">
                  {step <= 2 ? 'Inicia Sesión' : 'Detalles de Entrega'}
                </DrawerTitle>
                <DrawerDescription className="text-base font-medium mt-1 text-zinc-400">
                  {step === 1 && 'Ingresa tu celular para pedir'}
                  {step === 2 && 'Confirma tu identidad'}
                  {step === 3 && '¿A dónde enviamos tu comida?'}
                </DrawerDescription>
              </DrawerHeader>
            )}
            
            <div 
              key={userId || 'invitado'} 
              className="overflow-y-auto flex-1 w-full pb-[max(2rem,env(safe-area-inset-bottom))] transition-all duration-300 ease-in-out"
            >
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}
