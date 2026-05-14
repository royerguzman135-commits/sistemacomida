import { RestaurantDirectory } from "@/components/restaurant-directory"
import { supabase } from "@/lib/supabase"

export const revalidate = 0 

export default async function Home() {
  // CLAVE: Aquí pedimos el platillo Y el nombre del comercio relacionado
  const { data: platillos, error } = await supabase
    .from('platillos')
    .select(`
      *,
      comercios (
        nombre
      )
    `)

  if (error) {
    console.error("Error en la consulta:", error.message)
  }

  return <RestaurantDirectory initialDishes={platillos || []} />
}