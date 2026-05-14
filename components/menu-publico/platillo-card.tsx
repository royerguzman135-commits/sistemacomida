"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

export interface Platillo {
  id: number
  nombre: string
  precio: number
  descripcion: string
  imagen_url: string
  categoria: string
  popular?: boolean
  nuevo?: boolean
}

interface PlatilloCardProps {
  platillo: Platillo
  onVerMas: (platillo: Platillo) => void
}

export function PlatilloCard({ platillo, onVerMas }: PlatilloCardProps) {
  return (
    <Card className="group bg-card border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={platillo.imagen_url}
          alt={platillo.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {platillo.popular && (
            <Badge className="bg-primary text-primary-foreground border-0 rounded-xl text-xs font-semibold shadow-lg">
              Popular
            </Badge>
          )}
          {platillo.nuevo && (
            <Badge className="bg-accent text-accent-foreground border-0 rounded-xl text-xs font-semibold shadow-lg">
              Nuevo
            </Badge>
          )}
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-background/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg">
            <span className="text-2xl font-bold text-primary">
              ${platillo.precio}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="mb-3">
          <Badge
            variant="secondary"
            className="bg-secondary text-secondary-foreground rounded-xl text-xs mb-2"
          >
            {platillo.categoria}
          </Badge>
          <h3 className="font-semibold text-foreground text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {platillo.nombre}
          </h3>
        </div>

        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
          {platillo.descripcion}
        </p>

        <Button
          onClick={() => onVerMas(platillo)}
          className="w-full bg-secondary hover:bg-primary text-secondary-foreground hover:text-primary-foreground rounded-2xl transition-all duration-300"
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver más
        </Button>
      </CardContent>
    </Card>
  )
}
