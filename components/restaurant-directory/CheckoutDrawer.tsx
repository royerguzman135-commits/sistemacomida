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
import { MapPin, Phone, Map, Loader2, ArrowRight, CheckCircle2, X, Mail } from "lucide-react"
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
  
  // Pasos: 1 = Email, 2 = OTP, 3 = Dirección/Contacto, 4 = Éxito
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [loading, setLoading] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  // Datos Auth
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [usePassword, setUsePassword] = useState(false)
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

  // Listener para detectar si confirma desde otra pestaña (Magic Link)
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

  // 1. Enviar Email OTP
  const handleEnviarEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      alert("Por favor ingresa un correo electrónico válido.")
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      setStep(2)
    } catch (error: any) {
      console.error(error)
      alert("Ocurrió un error al enviar el código.")
    }
    setLoading(false)
  }

  // 2. Verificar OTP
  const handleVerificarOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) return
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
      if (error) throw error
      if (data.session) {
        setUserId(data.session.user.id)
        setStep(3)
      }
    } catch (error: any) {
      console.error(error)
      alert("Código inválido o ha expirado.")
    }
    setLoading(false)
  }

  // 2.5 Iniciar sesión con contraseña
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.session) {
        setUserId(data.session.user.id)
        setStep(3)
      }
    } catch (error: any) {
      console.error(error)
      alert("Credenciales inválidas.")
    }
    setLoading(false)
  }

  // Refrescar sesión manualmente
  const handleRefreshAuth = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.refreshSession()
    if (session) {
      setUserId(session.user.id)
      setStep(3)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setStep(3)
      } else {
        alert("Aún no detectamos tu confirmación. Revisa tu correo o ingresa el código.")
      }
    }
    setLoading(false)
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
        cliente_telefono: telefono,
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
    <form onSubmit={usePassword ? handlePasswordLogin : handleEnviarEmail} className="space-y-6 px-6 pb-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground font-bold uppercase tracking-wider text-xs">Tu Correo Electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              type="email" 
              placeholder="ejemplo@correo.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-16 pl-12 rounded-[1.5rem] bg-secondary border-transparent text-lg font-bold placeholder:text-muted-foreground/50 focus-visible:ring-orange-500"
              required
              autoFocus
            />
          </div>
        </div>

        {usePassword && (
          <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
            <Label className="text-muted-foreground font-bold uppercase tracking-wider text-xs">Contraseña</Label>
            <div className="relative">
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-16 rounded-[1.5rem] bg-secondary border-transparent text-lg font-bold placeholder:text-muted-foreground/50 focus-visible:ring-orange-500 px-6"
                required
              />
            </div>
          </div>
        )}

        {!usePassword && (
          <p className="text-xs text-muted-foreground pt-2">Te enviaremos un código temporal para acceder rápidamente sin contraseñas.</p>
        )}
      </div>

      <div className="space-y-3">
        <Button 
          type="submit" 
          disabled={loading || !email || (usePassword && !password)}
          className="w-full h-16 rounded-[2rem] bg-orange-500 hover:bg-orange-600 text-white font-black text-lg uppercase tracking-wider shadow-lg shadow-orange-500/30"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>{usePassword ? 'Iniciar Sesión' : 'Continuar'} <ArrowRight className="ml-2 w-5 h-5" /></>}
        </Button>
        <Button 
          type="button"
          variant="ghost" 
          onClick={() => setUsePassword(!usePassword)} 
          className="w-full font-bold text-muted-foreground"
        >
          {usePassword ? 'Usar código por correo (OTP)' : 'Entrar con Contraseña'}
        </Button>
      </div>
    </form>
  )

  const renderStep2 = () => (
    <form onSubmit={handleVerificarOTP} className="space-y-6 px-6 pb-6 animate-in slide-in-from-right-8 duration-300">
      <div className="space-y-4 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-orange-500" />
        </div>
        <div>
          <h3 className="font-black text-xl text-foreground">Revisa tu correo</h3>
          <p className="text-sm text-muted-foreground mt-1">Ingresa el código de 6 dígitos enviado a <strong className="text-foreground">{email}</strong></p>
        </div>
        
        <div className="py-4">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(val) => setOtp(val)}
            autoFocus
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="h-12 w-12 sm:h-14 sm:w-14 text-2xl" />
              <InputOTPSlot index={1} className="h-12 w-12 sm:h-14 sm:w-14 text-2xl" />
              <InputOTPSlot index={2} className="h-12 w-12 sm:h-14 sm:w-14 text-2xl" />
              <InputOTPSlot index={3} className="h-12 w-12 sm:h-14 sm:w-14 text-2xl" />
              <InputOTPSlot index={4} className="h-12 w-12 sm:h-14 sm:w-14 text-2xl" />
              <InputOTPSlot index={5} className="h-12 w-12 sm:h-14 sm:w-14 text-2xl" />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      <div className="space-y-3">
        <Button 
          type="submit" 
          disabled={loading || otp.length !== 6}
          className="w-full h-16 rounded-[2rem] bg-orange-500 hover:bg-orange-600 text-white font-black text-lg uppercase tracking-wider shadow-lg shadow-orange-500/30"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verificar Código'}
        </Button>
        <Button 
          type="button"
          variant="outline" 
          onClick={handleRefreshAuth} 
          className="w-full h-12 rounded-xl font-bold border-orange-200 text-orange-600 hover:bg-orange-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '¿Ya confirmaste? Haz clic aquí'}
        </Button>
        <Button 
          type="button"
          variant="ghost" 
          onClick={() => setStep(1)} 
          className="w-full font-bold text-muted-foreground"
        >
          Usar otro correo
        </Button>
      </div>
    </form>
  )

  const renderStep3 = () => (
    <div className="px-6 pb-6 space-y-6 animate-in slide-in-from-right-8 duration-300">
      {!editandoDireccion && direccionExistente ? (
        <div className="space-y-4">
          <div className="p-5 rounded-[1.5rem] bg-orange-50 border-2 border-orange-200">
            <div className="flex items-start gap-3 mb-2">
              <MapPin className="text-orange-500 w-6 h-6 shrink-0 mt-1" />
              <div>
                <h4 className="font-black text-orange-900 text-lg">Dirección Guardada</h4>
                <p className="font-bold text-orange-800/80 leading-snug mt-1">
                  {direccionExistente.calle} #{direccionExistente.numero}
                </p>
                {direccionExistente.colonia && (
                  <p className="text-sm text-orange-700 mt-2 italic border-t border-orange-200/50 pt-2">
                    Colonia: {direccionExistente.colonia}
                  </p>
                )}
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setEditandoDireccion(true)}
            className="w-full h-12 rounded-xl border-orange-200 text-orange-600 font-bold hover:bg-orange-50"
          >
            Editar Dirección / Entregar en otro lugar
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground font-bold">Tu Nombre (Para entregarte)</Label>
            <Input 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              placeholder="Juan Pérez" 
              className="h-14 rounded-xl bg-secondary border-transparent"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground font-bold">Teléfono de Contacto</Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                type="tel"
                value={telefono} 
                onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))} 
                placeholder="686 123 4567" 
                maxLength={10}
                className="h-14 pl-12 rounded-xl bg-secondary border-transparent font-bold tracking-wider"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label className="text-muted-foreground font-bold">Calle</Label>
              <Input 
                value={calle} 
                onChange={(e) => setCalle(e.target.value)} 
                placeholder="Ej. Av. Reforma" 
                className="h-14 rounded-xl bg-secondary border-transparent"
              />
            </div>
            <div className="col-span-1 space-y-2">
              <Label className="text-muted-foreground font-bold">Número</Label>
              <Input 
                value={numero} 
                onChange={(e) => setNumero(e.target.value)} 
                placeholder="#123" 
                className="h-14 rounded-xl bg-secondary border-transparent"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground font-bold">Colonia</Label>
            <Input 
              value={colonia} 
              onChange={(e) => setColonia(e.target.value)} 
              placeholder="Ej. Centro, Jardines del Valle" 
              className="h-14 rounded-xl bg-secondary border-transparent"
            />
          </div>

          <Button 
            type="button"
            onClick={handleGetLocation}
            variant="secondary"
            className={`w-full h-14 rounded-xl font-bold flex items-center gap-2 border-2 transition-all ${coords ? 'bg-green-50 border-green-500 text-green-700' : 'bg-secondary border-transparent text-foreground hover:bg-secondary/80'}`}
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
          className="w-full h-16 rounded-[2rem] bg-orange-500 hover:bg-orange-600 text-white font-black text-xl uppercase tracking-wider shadow-xl shadow-orange-500/30 transition-transform active:scale-95"
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
          className="font-bold text-muted-foreground"
        >
          Cerrar Sesión
        </Button>
      </DrawerFooter>
    </div>
  )

  const renderStep4 = () => (
    <div className="px-6 pb-12 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-2">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </div>
      <h2 className="text-3xl font-black tracking-tighter text-foreground">¡Pedido Confirmado!</h2>
      <p className="text-muted-foreground text-lg leading-relaxed">
        El restaurante ya está recibiendo tu orden.<br/>¡Tu comida llegará muy pronto!
      </p>
      <Button 
        onClick={() => {
          onClose()
          setTimeout(() => setStep(1), 500)
        }}
        className="mt-6 w-full h-14 rounded-2xl font-bold bg-secondary text-foreground hover:bg-secondary/80"
      >
        Volver al Menú
      </Button>
    </div>
  )

  return (
    <Drawer dismissible={false} open={isOpen} onOpenChange={(o) => {
      if(!o && step !== 4) {
        onClose()
        // Reset only if not authenticated, else keep at step 3
        setTimeout(() => {
           if (!userId) setStep(1)
           else setStep(3)
        }, 500)
      }
    }}>
      <DrawerContent className="max-h-[90vh] flex flex-col bg-background text-foreground border-border">
        {/* Título oculto para accesibilidad cuando el Header visual está escondido */}
        {(authChecking || step === 4) && (
          <DrawerTitle className="sr-only">Checkout Sabor Local</DrawerTitle>
        )}
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
                  className="absolute right-4 top-4 p-2 rounded-full bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <DrawerTitle className="text-3xl font-black italic uppercase tracking-tighter">
                  {step <= 2 ? 'Acceso Rápido' : 'Detalles de Entrega'}
                </DrawerTitle>
                <DrawerDescription className="text-base font-medium mt-1">
                  {step === 1 && 'Ingresa tu correo para continuar'}
                  {step === 2 && 'Confirma tu identidad'}
                  {step === 3 && '¿A dónde enviamos tu comida?'}
                </DrawerDescription>
              </DrawerHeader>
            )}
            
            <div className="overflow-y-auto flex-1 w-full pb-[max(2rem,env(safe-area-inset-bottom))]">
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
