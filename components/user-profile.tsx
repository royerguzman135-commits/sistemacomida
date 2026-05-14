"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import {
  User, MapPin, Store, ClipboardList, LogOut, ArrowLeft, Loader2, CheckCircle2, Home, Briefcase, Heart, Clock
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function UserProfile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // Datos
  const [perfil, setPerfil] = useState<any>(null)
  const [nombre, setNombre] = useState("")
  const [guardandoNombre, setGuardandoNombre] = useState(false)
  
  const [pedidos, setPedidos] = useState<any[]>([])
  const [direccion, setDireccion] = useState<any>(null)
  const [comercio, setComercio] = useState<any>(null)

  // Modo edición de dirección
  const [editandoDir, setEditandoDir] = useState(false)
  const [dirForm, setDirForm] = useState({
    calle: "",
    numero: "",
    colonia: "",
    alias: "Casa"
  })
  const [guardandoDir, setGuardandoDir] = useState(false)

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push("/login")
      return
    }

    const currentUser = session.user
    setUser(currentUser)

    // 1. Cargar Perfil (Upsert logic handled on save, but we try to fetch first)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .maybeSingle()

    if (profileData) {
      setPerfil(profileData)
      setNombre(profileData.nombre || "")
    } else {
      // Intento de fallback a metadata o correo
      setNombre(currentUser.user_metadata?.full_name || "")
    }

    // 2. Cargar Historial de Pedidos (Más recientes primero)
    const { data: pedidosData } = await supabase
      .from('pedidos')
      .select('id, total_cliente, estado, created_at, comercio_id, comercios(nombre)')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })

    if (pedidosData) {
      setPedidos(pedidosData)
    }

    // 3. Cargar Dirección Guardada
    const { data: dirData } = await supabase
      .from('direcciones_usuario')
      .select('*')
      .eq('user_id', currentUser.id)
      .maybeSingle()

    if (dirData) {
      setDireccion(dirData)
      setDirForm({
        calle: dirData.calle || "",
        numero: dirData.numero || "",
        colonia: dirData.colonia || "",
        alias: dirData.alias || "Casa"
      })
    }

    // 4. Cargar Comercio (Tu Negocio)
    const { data: comercioData } = await supabase
      .from('comercios')
      .select('id, nombre')
      .eq('user_id', currentUser.id)
      .maybeSingle()

    if (comercioData) {
      setComercio(comercioData)
    }

    setLoading(false)
  }, [router])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const handleGuardarNombre = async () => {
    if (!nombre.trim() || !user) return
    setGuardandoNombre(true)

    // Upsert en la tabla profiles como solicitó el usuario
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id, // Llave primaria 1:1 con auth.uid()
        nombre: nombre,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

    // También actualizamos el metadata por buenas prácticas
    await supabase.auth.updateUser({
      data: { full_name: nombre }
    })

    if (error) {
      alert("Error al guardar el nombre: " + error.message)
    } else {
      // Sincronizar visualmente
      setPerfil({ ...perfil, nombre })
    }
    setGuardandoNombre(false)
  }

  const handleGuardarDireccion = async () => {
    if (!dirForm.calle || !dirForm.numero || !user) return
    setGuardandoDir(true)

    const payload = {
      user_id: user.id,
      calle: dirForm.calle,
      numero: dirForm.numero,
      colonia: dirForm.colonia,
      alias: dirForm.alias
    }

    const { data, error } = await supabase
      .from('direcciones_usuario')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .maybeSingle()

    if (error) {
      alert("Error al guardar dirección. Asegúrate de que la columna 'alias' exista en la base de datos. " + error.message)
    } else {
      setDireccion(data || payload)
      setEditandoDir(false)
    }
    setGuardandoDir(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const getAliasIcon = (alias: string) => {
    const a = alias.toLowerCase()
    if (a.includes('trabajo') || a.includes('chamba') || a.includes('oficina')) return <Briefcase className="w-5 h-5" />
    if (a.includes('novi') || a.includes('amor')) return <Heart className="w-5 h-5" />
    return <Home className="w-5 h-5" />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-orange-500 gap-4">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="font-black italic uppercase tracking-widest text-sm">Cargando Perfil...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary/30 pb-20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Volver al Menú
          </Link>
          <h1 className="font-black text-lg uppercase tracking-tight">Mi Perfil</h1>
          <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* 1. Datos del Usuario */}
        <section className="space-y-4 fade-in">
          <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <User className="w-5 h-5 text-orange-500" /> Mis Datos
          </h2>
          <Card className="p-5 rounded-[2rem] border shadow-sm bg-background space-y-5">
            <div className="space-y-2">
              <Label className="font-bold text-muted-foreground">Tu Nombre</Label>
              <div className="flex gap-3">
                <Input 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="h-14 rounded-xl bg-secondary border-transparent font-bold text-lg"
                />
                <Button 
                  onClick={handleGuardarNombre}
                  disabled={guardandoNombre || nombre === perfil?.nombre}
                  className="h-14 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-wider"
                >
                  {guardandoNombre ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground ml-2">Este nombre lo verán los restaurantes al recibir tu pedido.</p>
            </div>
            
            <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="font-bold text-muted-foreground text-xs uppercase tracking-wider">Correo Vinculado</Label>
                <p className="font-bold text-foreground truncate">{user?.email || "Sin correo"}</p>
              </div>
              {user?.phone && (
                <div className="space-y-1">
                  <Label className="font-bold text-muted-foreground text-xs uppercase tracking-wider">Teléfono</Label>
                  <p className="font-bold text-foreground">{user.phone}</p>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* 2. Direcciones Guardadas */}
        <section className="space-y-4 fade-in delay-75">
          <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" /> Direcciones Guardadas
          </h2>
          <Card className="p-5 rounded-[2rem] border shadow-sm bg-background">
            {!editandoDir && direccion ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                    {getAliasIcon(direccion.alias || "Casa")}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-foreground flex items-center gap-2">
                      {direccion.alias || "Mi Dirección"}
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-widest">Predeterminada</span>
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">
                      {direccion.calle} #{direccion.numero}, Col. {direccion.colonia}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setEditandoDir(true)} className="font-bold text-orange-500 hover:text-orange-600 hover:bg-orange-50">
                  Editar
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Alias (Ej. Casa, Trabajo, Novia)</Label>
                    <Input value={dirForm.alias} onChange={e => setDirForm({...dirForm, alias: e.target.value})} className="h-12 rounded-xl bg-secondary border-transparent" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Calle</Label>
                    <Input value={dirForm.calle} onChange={e => setDirForm({...dirForm, calle: e.target.value})} className="h-12 rounded-xl bg-secondary border-transparent" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Número</Label>
                    <Input value={dirForm.numero} onChange={e => setDirForm({...dirForm, numero: e.target.value})} className="h-12 rounded-xl bg-secondary border-transparent" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Colonia</Label>
                    <Input value={dirForm.colonia} onChange={e => setDirForm({...dirForm, colonia: e.target.value})} className="h-12 rounded-xl bg-secondary border-transparent" />
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  {direccion && (
                    <Button variant="ghost" onClick={() => setEditandoDir(false)} className="font-bold">Cancelar</Button>
                  )}
                  <Button onClick={handleGuardarDireccion} disabled={guardandoDir || !dirForm.calle || !dirForm.numero} className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-6">
                    {guardandoDir ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Dirección'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </section>

        {/* 3. Historial de Pedidos */}
        <section className="space-y-4 fade-in delay-150">
          <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-orange-500" /> Historial de Pedidos
          </h2>
          <div className="space-y-3">
            {pedidos.length === 0 ? (
              <Card className="p-8 rounded-[2rem] border-dashed text-center bg-transparent">
                <p className="text-muted-foreground font-medium">Aún no has realizado ningún pedido.</p>
                <Link href="/">
                  <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold">Explorar Restaurantes</Button>
                </Link>
              </Card>
            ) : (
              pedidos.map(pedido => {
                const fecha = new Date(pedido.created_at)
                const isEntregado = pedido.estado === 'entregado'
                return (
                  <Card key={pedido.id} className="p-4 rounded-[1.5rem] border shadow-sm bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-orange-200 transition-colors">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isEntregado ? 'bg-gray-100 text-gray-500' : 'bg-orange-100 text-orange-500'}`}>
                        {isEntregado ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-black text-foreground text-lg leading-none mb-1">
                          {pedido.comercios?.nombre || 'Restaurante'}
                        </h4>
                        <p className="text-xs font-bold text-muted-foreground">
                          {format(fecha, "dd MMM yyyy • hh:mm a", { locale: es })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
                      <span className="font-black text-xl text-foreground">${pedido.total_cliente}</span>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest mt-1 ${isEntregado ? 'bg-gray-100 text-gray-600' : 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'}`}>
                        {pedido.estado || 'Pendiente'}
                      </span>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </section>

        {/* 4. Sección Tu Negocio */}
        <section className="pt-6 fade-in delay-200">
          <Card className="p-6 sm:p-8 rounded-[2rem] border-2 border-orange-200 bg-orange-50/50 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-orange-500 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-orange-500/30 text-white rotate-3">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-orange-950 uppercase tracking-tighter italic">
                {comercio ? `Tu Negocio: ${comercio.nombre}` : '¿Tienes un restaurante?'}
              </h2>
              <p className="text-orange-800/80 mt-1 max-w-md mx-auto text-sm font-medium">
                {comercio 
                  ? 'Gestiona tus órdenes, atiende clientes y actualiza tu menú desde tu panel exclusivo.'
                  : 'Únete a Sabor Local y lleva tu restaurante al siguiente nivel. Crea tu menú y recibe pedidos.'}
              </p>
            </div>
            
            <Link href="/dashboard" className="w-full sm:w-auto mt-2">
              <Button className="w-full h-14 px-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-transform active:scale-95">
                {comercio ? 'Administrar Dashboard' : 'Registrar mi Negocio en Sabor Local'}
              </Button>
            </Link>
          </Card>
        </section>

      </main>
    </div>
  )
}
