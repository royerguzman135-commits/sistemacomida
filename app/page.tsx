import { RestaurantDirectory } from "@/components/restaurant-directory"
import { supabase } from "@/lib/supabase"

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function Home() {
  // Fetch categorias
  const { data: categorias, error: categoriasError } = await supabase
    .from('categorias')
    .select('*')

  if (categoriasError) {
    console.error("Error fetch categorias:", categoriasError.message)
  }

  // Fetch comercios
  const { data: comercios, error: comerciosError } = await supabase
    .from('comercios')
    .select('id, nombre, imagen_url, logo_url, rating, tiempo_entrega, costo_envio, es_destacado')
    .order('rating', { ascending: false })

  if (comerciosError) {
    console.error("Error fetch comercios:", comerciosError.message)
  }

  // Fetch platillos (Deliofertas)
  const { data: platillos, error: platillosError } = await supabase
    .from('platillos')
    .select('id, nombre, precio, precio_original, imagen_url, descripcion, comercio_id, es_popular')
    // Nota: El filtrado de "es_popular O precio_original > precio" se hará en el cliente para mantener el componente RSC más simple
    // o se podría hacer aquí si Supabase lo permite fácil, pero está bien así por ahora.

  if (platillosError) {
    console.error("Error fetch platillos:", platillosError.message)
  }

  return (
    <RestaurantDirectory 
      initialCategorias={categorias || []} 
      initialComercios={comercios || []} 
      initialPlatillos={platillos || []} 
    />
  )
}