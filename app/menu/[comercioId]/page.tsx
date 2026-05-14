import { supabase } from "@/lib/supabase"
// Ajustado a tu ruta: components/menu-publico/menu-publico.tsx
import { MenuPublico } from "@/components/menu-publico/menu-publico"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

interface Props {
  params: {
    comercioId: string
  }
}

export default async function PublicMenuPage({ params }: Props) {
  // En Next.js 15+ params es una Promise, si usas una versión anterior
  // puedes usar: const { comercioId } = params;
  const { comercioId } = await params 

  // 1. Buscamos los datos del negocio
  const { data: comercio, error: comercioError } = await supabase
    .from('comercios')
    .select('*')
    .eq('id', comercioId)
    .single()

  if (comercioError || !comercio) {
    return notFound()
  }

  // 2. Traer los platillos
  const { data: platillos, error: platillosError } = await supabase
    .from('platillos')
    .select('*')
    .eq('comercio_id', comercioId)

  if (platillosError) {
    console.error("Error al cargar platillos:", platillosError.message)
  }

  return (
    <main className="min-h-screen bg-background">
      <MenuPublico 
        comercio={comercio} 
        platillos={platillos || []} 
      />
    </main>
  )
}