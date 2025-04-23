"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CalendarDays, Trophy, Users } from "lucide-react"
import { getCareerMode } from "@/lib/career-mode-service"
import type { CareerMode, Temporada } from "@/lib/types"

export default function TemporadaPage({
  params,
}: {
  params: { id: string; temporadaId: string }
}) {
  const router = useRouter()
  const [modoCarrera, setModoCarrera] = useState<CareerMode | null>(null)
  const [temporada, setTemporada] = useState<Temporada | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarDatos = () => {
      try {
        const modo = getCareerMode(params.id)
        if (!modo) {
          router.push("/")
          return
        }

        const temporadaIndex = Number.parseInt(params.temporadaId)
        if (isNaN(temporadaIndex) || temporadaIndex < 0 || temporadaIndex >= modo.temporadas.length) {
          router.push(`/modo/${params.id}`)
          return
        }

        setModoCarrera(modo)
        setTemporada(modo.temporadas[temporadaIndex])
      } catch (error) {
        console.error("Error al cargar los datos:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [params.id, params.temporadaId, router])

  if (loading) {
    return <div className="container mx-auto p-8 text-center">Cargando...</div>
  }

  if (!modoCarrera || !temporada) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-green-800 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">FIFA Career Mode Manager</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <Link
            href={`/modo/${params.id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al modo carrera
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">{temporada.nombre}</h1>
              <p className="text-muted-foreground">
                {modoCarrera.nombre} - {modoCarrera.equipo}
              </p>
            </div>
          </div>

          <Tabs defaultValue="resumen">
            <TabsList className="mb-6">
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="jugadores">Jugadores</TabsTrigger>
            </TabsList>

            <TabsContent value="resumen">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Trophy className="mr-2 h-5 w-5 text-green-700" />
                      Objetivos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">
                      {temporada.objetivos || "No hay objetivos definidos para esta temporada."}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <CalendarDays className="mr-2 h-5 w-5 text-green-700" />
                      Posiciones Finales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {temporada.posiciones.liga && (
                        <div className="flex justify-between">
                          <span className="font-medium">Liga:</span>
                          <span>{temporada.posiciones.liga}</span>
                        </div>
                      )}

                      {temporada.posiciones.copa && (
                        <div className="flex justify-between">
                          <span className="font-medium">Copa Nacional:</span>
                          <span>{temporada.posiciones.copa}</span>
                        </div>
                      )}

                      {temporada.posiciones.champions && (
                        <div className="flex justify-between">
                          <span className="font-medium">Champions League:</span>
                          <span>{temporada.posiciones.champions}</span>
                        </div>
                      )}

                      {temporada.posiciones.otros && (
                        <div className="flex justify-between">
                          <span className="font-medium">Otros Torneos:</span>
                          <span>{temporada.posiciones.otros}</span>
                        </div>
                      )}

                      {!temporada.posiciones.liga &&
                        !temporada.posiciones.copa &&
                        !temporada.posiciones.champions &&
                        !temporada.posiciones.otros && (
                          <p className="text-muted-foreground">No hay posiciones finales registradas.</p>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="jugadores">
              <Card>
                <CardHeader>
                  <CardTitle>Plantilla de la Temporada</CardTitle>
                  <CardDescription>{temporada.jugadores.length} jugadores registrados</CardDescription>
                </CardHeader>
                <CardContent>
                  {temporada.jugadores.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No hay jugadores registrados</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        No se han registrado jugadores para esta temporada.
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2">Nombre</th>
                            <th className="text-left p-2">Pos</th>
                            <th className="text-left p-2">Edad</th>
                            <th className="text-left p-2">Rating</th>
                            <th className="text-left p-2">Valor</th>
                            <th className="text-left p-2">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {temporada.jugadores.map((jugador, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">{jugador.nombre}</td>
                              <td className="p-2">{jugador.posicion}</td>
                              <td className="p-2">{jugador.edad}</td>
                              <td className="p-2">{jugador.valoracion}</td>
                              <td className="p-2">{jugador.valor}</td>
                              <td className="p-2">
                                {jugador.estado === "en_club"
                                  ? "En Club"
                                  : jugador.estado === "cedido"
                                    ? "Cedido"
                                    : jugador.estado === "vendido"
                                      ? "Vendido"
                                      : ""}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">FIFA Career Mode Manager &copy; {new Date().getFullYear()}</div>
      </footer>
    </div>
  )
}
