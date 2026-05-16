import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { RestaurantDetailClient } from "@/components/restaurant-directory/RestaurantDetailClient"

export const revalidate = 0
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function RestaurantPage({ params }: Props) {
  const { id } = await params

  // 1. Fetch comercio
  const { data: comercio, error: comercioError } = await supabase
    .from('comercios')
    .select('*')
    .eq('id', id)
    .single()

  if (comercioError || !comercio) {
    console.error("Error fetching comercio:", comercioError?.message)
    notFound()
  }

  // 2. Fetch platillos
  const { data: platillos, error: platillosError } = await supabase
    .from('platillos')
    .select('*')
    .eq('comercio_id', id)

  if (platillosError) {
    console.error("Error fetching platillos:", platillosError.message)
  }

  return (
    <RestaurantDetailClient 
      comercio={comercio} 
      platillos={platillos || []} 
    />
  )
}
