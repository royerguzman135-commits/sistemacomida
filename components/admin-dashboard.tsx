"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Settings,
  MapPin,
  Plus,
  RefreshCw,
  Menu,
  Store,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

import { PlatillosTable } from "@/components/dashboard/PlatillosTable"
import { PlatilloForm } from "@/components/platillos/PlatilloForm"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { CreateComercioForm } from "@/components/dashboard/CreateComercioForm"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { ComercioSettings } from "@/components/dashboard/ComercioSettings"
import { PedidosBoard } from "@/components/dashboard/PedidosBoard"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Resumen" },
  { icon: UtensilsCrossed, label: "Mi Menú" },
  { icon: ClipboardList, label: "Pedidos" },
  { icon: Settings, label: "Ajustes" },
]

export function AdminDashboard() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeLink, setActiveLink] = useState("Resumen")
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [comercio, setComercio] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [editando, setEditando] = useState<any>(null)
  const [mostrandoForm, setMostrandoForm] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [creando, setCreando] = useState(false)

  const cargarTodo = useCallback(async () => {
    setLoading(true)
    // Usamos getSession primero para evitar AuthSessionMissingError si no hay token local
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.warn("Auth: No hay sesión activa en el cliente.")
      router.push("/login")
      return
    }
    
    const user = session.user
    setUserId(user.id)

    // Buscando comercio con manejo explícito de errores (RLS o Caché)
    const { data: comercioData, error: comercioError } = await supabase
      .from('comercios')
      .select('id, nombre, ubicacion, direccion, logo_url, esta_abierto')
      .eq('user_id', user.id)
      .maybeSingle()

    if (comercioError) {
      console.error("❌ ERROR de Supabase buscando comercio (¿Problema de RLS?):", comercioError.message, comercioError.details)
    }

    if (comercioData) {
      console.log("✅ Comercio encontrado:", comercioData.nombre)
      setComercio(comercioData)
      
      // Guardar globalmente en localStorage para que otros componentes sepan de quién es el menú
      if (typeof window !== 'undefined') {
        localStorage.setItem('comercio_id_global', comercioData.id)
      }

      // Traer inventario
      const { data: platillos, error: platillosError } = await supabase
        .from('platillos')
        .select('*')
        .eq('comercio_id', comercioData.id)

      if (platillosError) {
        console.error("❌ Error al traer platillos:", platillosError.message)
      }
      
      setItems(platillos || [])
    } else {
      console.warn("⚠️ No se encontró comercio en la DB para el user_id:", user.id)
      // Si el caché lo ocultó, limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('comercio_id_global')
      }
    }
    setLoading(false)
  }, [router])

  useEffect(() => {
    cargarTodo()
  }, [cargarTodo])

  const handleCrearComercio = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoNombre.trim() || !userId) return

    setCreando(true)
    const { data, error } = await supabase
      .from('comercios')
      .insert([{ 
        nombre: nuevoNombre, 
        user_id: userId 
      }])
      .select()
      .single()

    if (error) {
      alert("Error al crear el comercio: " + error.message)
    } else {
      setComercio(data)
      cargarTodo()
    }
    setCreando(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleToggleApertura = async (checked: boolean) => {
    if (!comercio) return
    const { error } = await supabase
      .from('comercios')
      .update({ esta_abierto: checked })
      .eq('id', comercio.id)
      
    if (!error) {
      setComercio({ ...comercio, esta_abierto: checked })
    } else {
      alert("Error al actualizar estado: " + error.message)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 text-orange-500">
      <RefreshCw className="w-10 h-10 animate-spin" />
      <p className="font-black italic uppercase tracking-widest text-sm">Sincronizando Sabor Local...</p>
    </div>
  )

  if (!comercio && !loading) {
    return (
      <CreateComercioForm 
        nuevoNombre={nuevoNombre}
        setNuevoNombre={setNuevoNombre}
        creando={creando}
        onSubmit={handleCrearComercio}
        onLogout={handleLogout}
      />
    )
  }

  // --- RENDERS CONDICIONALES BASADOS EN EL MENÚ ---

  const renderAjustes = () => (
    <ComercioSettings comercio={comercio} onSuccess={cargarTodo} />
  )

  const renderMenuPrincipal = () => (
    <>
      {(mostrandoForm || editando) ? (
        <div className="max-w-2xl mx-auto py-10 fade-in">
          <PlatilloForm 
            platillo={editando} 
            comercioId={comercio?.id} 
            onCancel={() => { setEditando(null); setMostrandoForm(false); }} 
            onSuccess={() => { 
              setEditando(null); 
              setMostrandoForm(false); 
              cargarTodo(); 
            }} 
          />
        </div>
      ) : (
        <div className="fade-in">
          {activeLink === "Resumen" && <DashboardStats itemsCount={items.length} />}

          <Card className="rounded-[3rem] overflow-hidden border bg-card shadow-2xl shadow-black/5 mt-8">
            <PlatillosTable 
              items={items} 
              onEdit={(item: any) => setEditando(item)} 
              onRefresh={cargarTodo} 
            />
          </Card>
        </div>
      )}
    </>
  )

  // Despachador visual
  const renderContenidoPrincipal = () => {
    switch (activeLink) {
      case "Pedidos":
        return <PedidosBoard comercioId={comercio?.id} />
      case "Ajustes":
        return renderAjustes()
      case "Resumen":
      case "Mi Menú":
        return renderMenuPrincipal()
      default:
        return renderMenuPrincipal()
    }
  }

  return (
    <div className="min-h-screen bg-background flex text-foreground font-sans">
      <DashboardSidebar 
        sidebarOpen={sidebarOpen}
        activeLink={activeLink}
        setActiveLink={setActiveLink}
        sidebarLinks={sidebarLinks}
        onLogout={handleLogout}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <header className="sticky top-0 z-40 -mx-4 -mt-4 p-4 md:-mx-10 md:-mt-10 md:p-10 bg-background/95 backdrop-blur border-b mb-10 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-6 shadow-sm">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="flex lg:hidden p-3 bg-orange-500 text-white rounded-xl shadow-md active:scale-95 transition-transform relative z-50"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-black uppercase italic tracking-tighter fade-in">{comercio?.nombre}</h1>
              {(comercio?.direccion || comercio?.ubicacion) ? (
                <p className="text-muted-foreground text-sm font-bold flex items-center gap-2 italic">
                  <MapPin className="text-orange-500 w-4 h-4"/> {comercio.direccion || comercio.ubicacion}
                </p>
              ) : (
                <p className="text-red-400 text-sm font-bold flex items-center gap-2 italic cursor-pointer hover:underline" onClick={() => setActiveLink("Ajustes")}>
                  <MapPin className="w-4 h-4"/> Falta configurar dirección (haz clic aquí)
                </p>
              )}
            </div>
          </div>
          
          <div className="flex w-full md:w-auto flex-row-reverse md:flex-row items-center justify-between md:justify-end gap-6">
            <div className="flex items-center gap-3 bg-card border border-border rounded-[1.25rem] px-5 h-16 shadow-sm">
              <div className="flex flex-col items-end">
                <Label className={`font-black text-sm uppercase tracking-wider ${comercio?.esta_abierto ? 'text-green-500' : 'text-red-500'}`}>
                  {comercio?.esta_abierto ? 'ABIERTO' : 'CERRADO'}
                </Label>
                <span className="text-[10px] text-muted-foreground font-bold">Recibiendo pedidos</span>
              </div>
              <Switch 
                checked={comercio?.esta_abierto || false} 
                onCheckedChange={handleToggleApertura}
                className="scale-125 ml-2 data-[state=checked]:bg-green-500"
              />
            </div>

            {!mostrandoForm && !editando && activeLink !== "Ajustes" && (
              <Button 
                onClick={() => setMostrandoForm(true)} 
                className="bg-orange-500 hover:bg-orange-600 h-16 rounded-[1.5rem] px-6 md:px-10 font-black shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 text-lg text-white"
              >
                <Plus className="w-6 h-6 mr-0 md:mr-2 stroke-[4px]" /> <span className="hidden md:inline">NUEVO PLATILLO</span>
              </Button>
            )}
          </div>
        </header>

        {renderContenidoPrincipal()}
      </main>
    </div>
  )
}