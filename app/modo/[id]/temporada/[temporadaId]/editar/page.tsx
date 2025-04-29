"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Plus, Trash2, Check } from "lucide-react"
import { getCareerMode, updateSeason } from "@/lib/career-mode-service"
import type { CareerMode, Jugador, Temporada } from "@/lib/types"

export default function EditarTemporadaPage({ params }: { params: { id: string; temporadaId: string } }) {
  const router = useRouter()
  const [modoCarrera, setModoCarrera] = useState<CareerMode | null>(null)
  const [temporada, setTemporada] = useState<Temporada | null>(null)
  const [loading, setLoading] = useState(true)

  const [nuevoJugador, setNuevoJugador] = useState<Jugador>({
    nombre: "",
    posicion: "",
    edad: "",
    valoracion: "",
    valoracionFinal: "",
    valor: "",
    salario: "",
    estado: "en_club",
  })

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTemporada((prev) => {
      if (!prev) return prev
      return { ...prev, [name]: value }
    })
  }

  const handlePosicionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTemporada((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        posiciones: {
          ...prev.posiciones,
          [name]: value,
        },
      }
    })
  }

  const handleFinanzasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTemporada((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        finanzas: {
          ...prev.finanzas,
          [name]: value,
        },
      }
    })
  }

  const handleNuevoJugadorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNuevoJugador((prev) => ({ ...prev, [name]: value }))
  }

  const agregarJugador = () => {
    if (!nuevoJugador.nombre || !temporada) return

    setTemporada((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        jugadores: [...prev.jugadores, { ...nuevoJugador }],
      }
    })

    // Resetear el formulario de nuevo jugador
    setNuevoJugador({
      nombre: "",
      posicion: "",
      edad: "",
      valoracion: "",
      valoracionFinal: "",
      valor: "",
      salario: "",
      estado: "en_club",
    })
  }

  const eliminarJugador = (index: number) => {
    setTemporada((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        jugadores: prev.jugadores.filter((_, i) => i !== index),
      }
    })
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!modoCarrera || !temporada) {
      console.error("No hay datos cargados")
      return
    }

    try {
      // Actualizar la temporada
      const success = updateSeason(params.id, Number(params.temporadaId), temporada)

      if (success) {
        console.log("Temporada actualizada correctamente")
        // Redirigir a la vista de la temporada
        router.push(`/modo/${params.id}/temporada/${params.temporadaId}`)
      } else {
        console.error("Error al actualizar la temporada")
        alert("Hubo un error al guardar los cambios. Por favor, intenta de nuevo.")
      }
    } catch (error) {
      console.error("Error al guardar los cambios:", error)
      alert("Hubo un error al guardar los cambios. Por favor, intenta de nuevo.")
    }
  }

  const marcarComoCompletada = () => {
    if (!temporada) return

    setTemporada((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        completada: true,
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
            href={`/modo/${params.id}/temporada/${params.temporadaId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la temporada
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Editar {temporada.nombre}</h1>
              <p className="text-muted-foreground">
                {modoCarrera.nombre} - {modoCarrera.equipo}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={marcarComoCompletada} disabled={temporada.completada}>
                <Check className="mr-2 h-4 w-4" />
                {temporada.completada ? "Temporada Completada" : "Marcar como Completada"}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="general">
              <TabsList className="mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="jugadores">Jugadores</TabsTrigger>
                <TabsTrigger value="posiciones">Posiciones</TabsTrigger>
                <TabsTrigger value="finanzas">Finanzas</TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>Información General</CardTitle>
                    <CardDescription>Datos básicos de la temporada</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre de la Temporada</Label>
                      <Input id="nombre" name="nombre" value={temporada.nombre} onChange={handleChange} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="objetivos">Objetivos de la Temporada</Label>
                      <Textarea
                        id="objetivos"
                        name="objetivos"
                        placeholder="Describe los objetivos para esta temporada..."
                        className="min-h-[100px]"
                        value={temporada.objetivos}
                        onChange={handleChange}
                      />
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
                        <Label htmlFor="posicion-filtro">Posición</Label>
                        <Input
                          id="posicion-filtro"
                          name="posicion"
                          placeholder="Filtrar por posición"
                          value={filtros.posicion}
                          onChange={handleFiltroChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estado-filtro">Estado</Label>
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
                        <Label htmlFor="ordenar-por">Ordenar por</Label>
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

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Plantilla</CardTitle>
                    <CardDescription>
                      {jugadoresFiltrados().length} jugadores mostrados de {temporada.jugadores.length} totales
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {temporada.jugadores.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No hay jugadores registrados en esta temporada.</p>
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
                              <th className="text-left p-2">Salario</th>
                              <th className="text-left p-2">Estado</th>
                              <th className="text-left p-2"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {jugadoresFiltrados().map((jugador, index) => {
                              const originalIndex = temporada.jugadores.findIndex(
                                (j) => j.nombre === jugador.nombre && j.posicion === jugador.posicion,
                              )

                              return (
                                <tr key={index} className="border-t">
                                  <td className="p-2">{jugador.nombre}</td>
                                  <td className="p-2">{jugador.posicion}</td>
                                  <td className="p-2">{jugador.edad}</td>
                                  <td className="p-2">{jugador.valoracion}</td>
                                  <td className="p-2">
                                    <Input
                                      type="text"
                                      value={jugador.valoracionFinal || ""}
                                      onChange={(e) => {
                                        const newJugadores = [...temporada.jugadores]
                                        newJugadores[originalIndex] = {
                                          ...newJugadores[originalIndex],
                                          valoracionFinal: e.target.value,
                                        }
                                        setTemporada((prev) => {
                                          if (!prev) return prev
                                          return {
                                            ...prev,
                                            jugadores: newJugadores,
                                          }
                                        })
                                      }}
                                      className="h-8 w-16"
                                    />
                                  </td>
                                  <td className="p-2">{jugador.valor}</td>
                                  <td className="p-2">
                                    <Input
                                      type="text"
                                      value={jugador.salario || ""}
                                      onChange={(e) => {
                                        const newJugadores = [...temporada.jugadores]
                                        newJugadores[originalIndex] = {
                                          ...newJugadores[originalIndex],
                                          salario: e.target.value,
                                        }
                                        setTemporada((prev) => {
                                          if (!prev) return prev
                                          return {
                                            ...prev,
                                            jugadores: newJugadores,
                                          }
                                        })
                                      }}
                                      className="h-8 w-20"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <select
                                      value={jugador.estado}
                                      onChange={(e) => {
                                        const newJugadores = [...temporada.jugadores]
                                        newJugadores[originalIndex] = {
                                          ...newJugadores[originalIndex],
                                          estado: e.target.value as "en_club" | "cedido" | "vendido",
                                        }
                                        setTemporada((prev) => {
                                          if (!prev) return prev
                                          return {
                                            ...prev,
                                            jugadores: newJugadores,
                                          }
                                        })
                                      }}
                                      className="h-8 w-24 text-xs"
                                    >
                                      <option value="en_club">En Club</option>
                                      <option value="cedido">Cedido</option>
                                      <option value="vendido">Vendido</option>
                                    </select>
                                  </td>
                                  <td className="p-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => eliminarJugador(originalIndex)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Añadir Jugador</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre-jugador">Nombre</Label>
                        <Input
                          id="nombre-jugador"
                          name="nombre"
                          value={nuevoJugador.nombre}
                          onChange={handleNuevoJugadorChange}
                          placeholder="Nombre del jugador"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="posicion">Posición</Label>
                        <Input
                          id="posicion"
                          name="posicion"
                          value={nuevoJugador.posicion}
                          onChange={handleNuevoJugadorChange}
                          placeholder="Ej: DC, MC, DFC"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edad">Edad</Label>
                        <Input
                          id="edad"
                          name="edad"
                          value={nuevoJugador.edad}
                          onChange={handleNuevoJugadorChange}
                          placeholder="Ej: 23"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="valoracion">Media Inicial</Label>
                        <Input
                          id="valoracion"
                          name="valoracion"
                          value={nuevoJugador.valoracion}
                          onChange={handleNuevoJugadorChange}
                          placeholder="Ej: 85"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="valoracionFinal">Media Final</Label>
                        <Input
                          id="valoracionFinal"
                          name="valoracionFinal"
                          value={nuevoJugador.valoracionFinal}
                          onChange={handleNuevoJugadorChange}
                          placeholder="Ej: 87"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="valor">Valor</Label>
                        <Input
                          id="valor"
                          name="valor"
                          value={nuevoJugador.valor}
                          onChange={handleNuevoJugadorChange}
                          placeholder="Ej: 45M€"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="salario">Salario</Label>
                        <Input
                          id="salario"
                          name="salario"
                          value={nuevoJugador.salario}
                          onChange={handleNuevoJugadorChange}
                          placeholder="Ej: 120K€"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <select
                          id="estado"
                          name="estado"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={nuevoJugador.estado}
                          onChange={handleNuevoJugadorChange}
                        >
                          <option value="en_club">En Club</option>
                          <option value="cedido">Cedido</option>
                          <option value="vendido">Vendido</option>
                        </select>
                      </div>
                    </div>

                    <Button type="button" variant="outline" className="mt-4" onClick={agregarJugador}>
                      <Plus className="mr-2 h-4 w-4" />
                      Añadir Jugador
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="posiciones">
                <Card>
                  <CardHeader>
                    <CardTitle>Posiciones Finales</CardTitle>
                    <CardDescription>Registra los resultados de la temporada</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="liga">Liga</Label>
                        <Input
                          id="liga"
                          name="liga"
                          placeholder="Ej: 1° - Campeón"
                          value={temporada.posiciones.liga}
                          onChange={handlePosicionChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="copa">Copa Nacional</Label>
                        <Input
                          id="copa"
                          name="copa"
                          placeholder="Ej: Semifinales"
                          value={temporada.posiciones.copa}
                          onChange={handlePosicionChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="champions">Champions League</Label>
                        <Input
                          id="champions"
                          name="champions"
                          placeholder="Ej: Cuartos de Final"
                          value={temporada.posiciones.champions}
                          onChange={handlePosicionChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="otros">Otros Torneos</Label>
                        <Input
                          id="otros"
                          name="otros"
                          placeholder="Ej: Supercopa - Campeón"
                          value={temporada.posiciones.otros}
                          onChange={handlePosicionChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="finanzas">
                <Card>
                  <CardHeader>
                    <CardTitle>Finanzas</CardTitle>
                    <CardDescription>Registra los movimientos financieros de la temporada</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="presupuestoInicial">Presupuesto Inicial</Label>
                        <Input
                          id="presupuestoInicial"
                          name="presupuestoInicial"
                          placeholder="Ej: 120M€"
                          value={temporada.finanzas.presupuestoInicial}
                          onChange={handleFinanzasChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ingresosTransferencias">Ingresos por Transferencias</Label>
                        <Input
                          id="ingresosTransferencias"
                          name="ingresosTransferencias"
                          placeholder="Ej: 45M€"
                          value={temporada.finanzas.ingresosTransferencias}
                          onChange={handleFinanzasChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="egresosTransferencias">Gastos en Transferencias</Label>
                        <Input
                          id="egresosTransferencias"
                          name="egresosTransferencias"
                          placeholder="Ej: 65M€"
                          value={temporada.finanzas.egresosTransferencias}
                          onChange={handleFinanzasChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ingresosOtros">Otros Ingresos</Label>
                        <Input
                          id="ingresosOtros"
                          name="ingresosOtros"
                          placeholder="Ej: 25M€"
                          value={temporada.finanzas.ingresosOtros}
                          onChange={handleFinanzasChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="egresosOtros">Otros Gastos</Label>
                        <Input
                          id="egresosOtros"
                          name="egresosOtros"
                          placeholder="Ej: 15M€"
                          value={temporada.finanzas.egresosOtros}
                          onChange={handleFinanzasChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="presupuestoFinal">Presupuesto Final</Label>
                        <Input
                          id="presupuestoFinal"
                          name="presupuestoFinal"
                          placeholder="Ej: 110M€"
                          value={temporada.finanzas.presupuestoFinal}
                          onChange={handleFinanzasChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end">
              <Button type="submit" className="bg-green-700 hover:bg-green-800">
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </div>
          </form>
        </div>
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">FIFA Career Mode Manager &copy; {new Date().getFullYear()}</div>
      </footer>
    </div>
  )
}
