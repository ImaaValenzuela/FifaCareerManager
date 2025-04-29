import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, CheckCircle2 } from "lucide-react"
import type { Temporada } from "@/lib/types"

interface TemporadaCardProps {
  temporada: Temporada
  modoId: string
  temporadaIndex: number
}

export default function TemporadaCard({ temporada, modoId, temporadaIndex }: TemporadaCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <CardTitle className="text-lg">{temporada.nombre}</CardTitle>
            {temporada.completada && <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />}
          </div>
          <Link
            href={`/modo/${modoId}/temporada/${temporadaIndex}`}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center"
          >
            Ver detalles
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <CardDescription>
          {temporada.jugadores.length > 0
            ? `${temporada.jugadores.length} jugadores registrados`
            : "Sin jugadores registrados"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {temporada.objetivos && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Objetivos:</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{temporada.objetivos}</p>
            </div>
          )}

          <div className="space-y-1">
            <h4 className="text-sm font-medium">Posiciones Finales:</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {temporada.posiciones.liga && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Liga:</span>
                  <span>{temporada.posiciones.liga}</span>
                </div>
              )}

              {temporada.posiciones.copa && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Copa:</span>
                  <span>{temporada.posiciones.copa}</span>
                </div>
              )}

              {temporada.posiciones.champions && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Champions:</span>
                  <span>{temporada.posiciones.champions}</span>
                </div>
              )}

              {temporada.posiciones.otros && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Otros:</span>
                  <span>{temporada.posiciones.otros}</span>
                </div>
              )}

              {!temporada.posiciones.liga &&
                !temporada.posiciones.copa &&
                !temporada.posiciones.champions &&
                !temporada.posiciones.otros && (
                  <p className="text-muted-foreground col-span-2">No hay posiciones registradas</p>
                )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
