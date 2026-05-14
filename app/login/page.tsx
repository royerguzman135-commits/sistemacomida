"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChefHat, Lock, Mail } from "lucide-react"

// La palabra 'default' es OBLIGATORIA en Next.js para las páginas
export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()



  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    
    // Evitar errores de typos
    const cleanEmail = email.trim().toLowerCase()
    
    if (!cleanEmail) {
      setError("❌ El correo no puede estar vacío.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (authError) {
        // Imprimir error exacto
        console.error("Auth Error Detallado:", authError.message, authError.status)
        throw authError
      }

      // Redirigimos siempre al Perfil, garantizando el punto de entrada único
      window.location.href = "/perfil"
      router.refresh() // Forzamos a Next a que sepa que ya hay sesión
    } catch (err: any) {
      setError(`❌ Error: ${err.message || "Credenciales incorrectas"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-xl border border-border">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-primary rounded-2xl mb-4">
            <ChefHat className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Acceso a Sabor Local</h1>
          <p className="text-muted-foreground text-center">Panel de administración para negocios</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" /> Correo Electrónico
            </label>
            <Input 
              type="email" 
              placeholder="chef@tacoseljob.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="rounded-xl h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" /> Contraseña
            </label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="rounded-xl h-11"
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-12 rounded-xl text-lg font-semibold" disabled={loading}>
            {loading ? "Verificando..." : "Entrar al Panel"}
          </Button>
        </form>
        
        <p className="mt-6 text-center text-xs text-muted-foreground">
          ¿No tienes cuenta? Regístrate en el panel de Supabase.
        </p>
      </div>
    </div>
  )
}   