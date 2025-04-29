"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CalendarDays, PlusCircle, Trophy, Users } from "lucide-react"
import { getCareerMode } from "@/lib/career-mode-service"
import type { CareerMode } from "@/lib/types"
import TemporadaCard from "@/components/temporada-card"

export default function ModoCarreraPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [modoCarrera, setModoCarrera] = useState<CareerMode | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarModo = () => {
      try {
        const modo = getCareerMode(params.id)
        if (!modo) {
          console.error("Modo carrera no encontrado")
          router.push("/")
          return
        }

        // Asegurarse de que temporadas es un array
        if (!Array.isArray(modo.temporadas)) {
          modo.temporadas = []
        }

        setModoCarrera(modo)
      } catch (error) {
        console.error("Error al cargar el modo carrera:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    cargarModo()
  }, [params.id, router])

  if (loading) {
    return <div className="container mx-auto p-8 text-center">Cargando...</div>
  }

  if (!modoCarrera) {
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
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">{modoCarrera.nombre}</h1>
              <p className="text-muted-foreground">
                {modoCarrera.equipo} - Iniciado en {modoCarrera.temporadaInicial}
              </p>
            </div>
            <Link href={`/modo/${params.id}/temporada/nueva`}>
              <Button className="bg-green-700 hover:bg-green-800">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Temporada
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="resumen">
            <TabsList className="mb-6">
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="temporadas">Temporadas</TabsTrigger>
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
                    <p className="whitespace-pre-line">{modoCarrera.objetivos || "No hay objetivos definidos."}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <CalendarDays className="mr-2 h-5 w-5 text-green-700" />
                      Reglas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{modoCarrera.reglas || "No hay reglas definidas."}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Temporadas</CardTitle>
                  <CardDescription>
                    {modoCarrera.temporadas.length
                      ? `${modoCarrera.temporadas.length} temporadas completadas`
                      : "Aún no has registrado ninguna temporada"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {modoCarrera.temporadas.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No hay temporadas registradas</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Comienza creando tu primera temporada para este modo carrera.
                      </p>
                      <Link href={`/modo/${params.id}/temporada/nueva`} className="mt-4 inline-block">
                        <Button variant="outline">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Crear Primera Temporada
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {modoCarrera.temporadas.slice(0, 3).map((temporada, index) => (
                        <TemporadaCard key={index} temporada={temporada} modoId={params.id} temporadaIndex={index} />
                      ))}

                      {modoCarrera.temporadas.length > 3 && (
                        <div className="text-center pt-4">
                          <Button variant="outline" asChild>
                            <Link href={`/modo/${params.id}?tab=temporadas`}>Ver todas las temporadas</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="temporadas">
              <div className="space-y-6">
                {modoCarrera.temporadas.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No hay temporadas registradas</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Comienza creando tu primera temporada para este modo carrera.
                      </p>
                      <Link href={`/modo/${params.id}/temporada/nueva`} className="mt-4 inline-block">
                        <Button variant="outline">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Crear Primera Temporada
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  modoCarrera.temporadas.map((temporada, index) => (
                    <TemporadaCard key={index} temporada={temporada} modoId={params.id} temporadaIndex={index} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="jugadores">
              <Card>
                <CardHeader>
                  <CardTitle>Plantilla Actual</CardTitle>
                  <CardDescription>Todos los jugadores actualmente en el club</CardDescription>
                </CardHeader>
                <CardContent>
                  {modoCarrera.temporadas.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No hay jugadores registrados</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Crea tu primera temporada para comenzar a registrar jugadores.
                      </p>
                      <Link href={`/modo/${params.id}/temporada/nueva`} className="mt-4 inline-block">
                        <Button variant="outline">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Crear Primera Temporada
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">Selecciona una temporada</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Ve a la sección de temporadas para ver los jugadores de cada temporada.
                      </p>
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
