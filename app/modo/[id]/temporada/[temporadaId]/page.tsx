"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CalendarDays, Trophy, Users, Edit, DollarSign, Calculator } from "lucide-react"
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

  // Filtros para jugadores
  const [filtros, setFiltros] = useState({
    posicion: "",
    estado: "todos",
    ordenarPor: "nombre",
  })

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

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFiltros((prev) => ({ ...prev, [name]: value }))
  }

  const jugadoresFiltrados = () => {
    if (!temporada) return []

    return temporada.jugadores
      .filter((jugador) => {
        // Filtrar por posición
        if (filtros.posicion && !jugador.posicion.toLowerCase().includes(filtros.posicion.toLowerCase())) {
          return false
        }

        // Filtrar por estado
        if (filtros.estado !== "todos" && jugador.estado !== filtros.estado) {
          return false
        }

        return true
      })
      .sort((a, b) => {
        // Ordenar según el criterio seleccionado
        switch (filtros.ordenarPor) {
          case "nombre":
            return a.nombre.localeCompare(b.nombre)
          case "posicion":
            return a.posicion.localeCompare(b.posicion)
          case "edad":
            return Number(a.edad) - Number(b.edad)
          case "valoracion":
            return Number(a.valoracion) - Number(b.valoracion)
          case "valoracionFinal":
            return Number(a.valoracionFinal || 0) - Number(b.valoracionFinal || 0)
          case "valor":
            return a.valor.localeCompare(b.valor)
          default:
            return 0
        }
      })
  }

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
            <Link href={`/modo/${params.id}/temporada/${params.temporadaId}/editar`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Editar Temporada
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="resumen">
            <TabsList className="mb-6">
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="jugadores">Jugadores</TabsTrigger>
              <TabsTrigger value="finanzas">Finanzas</TabsTrigger>
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

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-green-700" />
                    Resumen Financiero
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {temporada.finanzas.presupuestoInicial && (
                      <div className="flex justify-between">
                        <span className="font-medium">Presupuesto Inicial:</span>
                        <span>{temporada.finanzas.presupuestoInicial}</span>
                      </div>
                    )}

                    {temporada.finanzas.ingresosTransferencias && (
                      <div className="flex justify-between">
                        <span className="font-medium">Ingresos por Transferencias:</span>
                        <span className="text-green-600">{temporada.finanzas.ingresosTransferencias}</span>
                      </div>
                    )}

                    {temporada.finanzas.egresosTransferencias && (
                      <div className="flex justify-between">
                        <span className="font-medium">Gastos en Transferencias:</span>
                        <span className="text-red-600">{temporada.finanzas.egresosTransferencias}</span>
                      </div>
                    )}

                    {temporada.finanzas.presupuestoFinal && (
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="font-medium">Presupuesto Final:</span>
                        <span>{temporada.finanzas.presupuestoFinal}</span>
                      </div>
                    )}

                    {!temporada.finanzas.presupuestoInicial &&
                      !temporada.finanzas.ingresosTransferencias &&
                      !temporada.finanzas.egresosTransferencias &&
                      !temporada.finanzas.presupuestoFinal && (
                        <p className="text-muted-foreground">No hay datos financieros registrados.</p>
                      )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jugadores">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Filtrar Jugadores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="posicion-filtro" className="text-sm font-medium">
                        Posición
                      </label>
                      <input
                        id="posicion-filtro"
                        name="posicion"
                        placeholder="Filtrar por posición"
                        value={filtros.posicion}
                        onChange={handleFiltroChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="estado-filtro" className="text-sm font-medium">
                        Estado
                      </label>
                      <select
                        id="estado-filtro"
                        name="estado"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={filtros.estado}
                        onChange={handleFiltroChange}
                      >
                        <option value="todos">Todos</option>
                        <option value="en_club">En Club</option>
                        <option value="cedido">Cedidos</option>
                        <option value="vendido">Vendidos</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="ordenar-por" className="text-sm font-medium">
                        Ordenar por
                      </label>
                      <select
                        id="ordenar-por"
                        name="ordenarPor"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={filtros.ordenarPor}
                        onChange={handleFiltroChange}
                      >
                        <option value="nombre">Nombre</option>
                        <option value="posicion">Posición</option>
                        <option value="edad">Edad</option>
                        <option value="valoracion">Media Inicial</option>
                        <option value="valoracionFinal">Media Final</option>
                        <option value="valor">Valor</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plantilla de la Temporada</CardTitle>
                  <CardDescription>
                    {jugadoresFiltrados().length} jugadores mostrados de {temporada.jugadores.length} totales
                  </CardDescription>
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
                    <div className="border rounded-md overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2">Nombre</th>
                            <th className="text-left p-2">Pos</th>
                            <th className="text-left p-2">Edad</th>
                            <th className="text-left p-2">Media Inicial</th>
                            <th className="text-left p-2">Media Final</th>
                            <th className="text-left p-2">Valor</th>
                            <th className="text-left p-2">V. Compra</th>
                            <th className="text-left p-2">V. Venta</th>
                            <th className="text-left p-2">Salario</th>
                            <th className="text-left p-2">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jugadoresFiltrados().map((jugador, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">{jugador.nombre}</td>
                              <td className="p-2">{jugador.posicion}</td>
                              <td className="p-2">{jugador.edad}</td>
                              <td className="p-2">{jugador.valoracion}</td>
                              <td className="p-2">{jugador.valoracionFinal || "-"}</td>
                              <td className="p-2">{jugador.valor}</td>
                              <td className="p-2">{jugador.valorCompra || "-"}</td>
                              <td className="p-2">{jugador.valorVenta || "-"}</td>
                              <td className="p-2">{jugador.salario || "-"}</td>
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

            <TabsContent value="finanzas">
              <div className="space-y-6">
                {/* Resumen automático */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calculator className="mr-2 h-5 w-5" />
                      Resumen Automático
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Gastos en Fichajes:</span>
                          <span className="font-medium text-red-600">{temporada.finanzas.gastosFichajes || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Profits en Fichajes:</span>
                          <span className="font-medium text-green-600">
                            {temporada.finanzas.profitsFichajes || "-"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Gasto Total:</span>
                          <span className="font-medium text-red-600">{temporada.finanzas.gastoTotal || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ingreso Total:</span>
                          <span className="font-medium text-green-600">{temporada.finanzas.ingresoTotal || "-"}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Presupuestos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Presupuestos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex justify-between">
                        <span>Presupuesto Inicial:</span>
                        <span className="font-medium">{temporada.finanzas.presupuestoInicial || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Presupuesto Final:</span>
                        <span className="font-medium">{temporada.finanzas.presupuestoFinal || "-"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Gastos detallados */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gastos Detallados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Fichajes:</span>
                          <span className="text-red-600">{temporada.finanzas.gastosFichajes || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Entrenadores:</span>
                          <span className="text-red-600">{temporada.finanzas.gastosEntrenadores || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ojeadores:</span>
                          <span className="text-red-600">{temporada.finanzas.gastosOjeadores || "-"}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Infraestructura:</span>
                          <span className="text-red-600">{temporada.finanzas.gastosInfraestructura || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Otros Gastos:</span>
                          <span className="text-red-600">{temporada.finanzas.gastosOtros || "-"}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ingresos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ingresos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex justify-between">
                        <span>Profits en Fichajes:</span>
                        <span className="text-green-600">{temporada.finanzas.profitsFichajes || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Otros Ingresos:</span>
                        <span className="text-green-600">{temporada.finanzas.ingresosOtros || "-"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {!temporada.finanzas.presupuestoInicial &&
                  !temporada.finanzas.gastosFichajes &&
                  !temporada.finanzas.profitsFichajes &&
                  !temporada.finanzas.gastosEntrenadores &&
                  !temporada.finanzas.gastosOjeadores &&
                  !temporada.finanzas.gastosInfraestructura &&
                  !temporada.finanzas.gastosOtros &&
                  !temporada.finanzas.ingresosOtros &&
                  !temporada.finanzas.presupuestoFinal && (
                    <div className="text-center py-8">
                      <DollarSign className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No hay datos financieros</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        No se han registrado datos financieros para esta temporada.
                      </p>
                    </div>
                  )}
              </div>
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
