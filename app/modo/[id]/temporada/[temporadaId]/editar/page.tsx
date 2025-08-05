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
import { ArrowLeft, Save, Plus, Trash2, Check, Copy, Calculator } from "lucide-react"
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
    valorCompra: "",
    valorVenta: "",
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

        // Asegurar que la temporada tenga la estructura correcta de finanzas
        const temporadaActual = modo.temporadas[temporadaIndex]
        if (!temporadaActual.finanzas.gastosFichajes) {
          temporadaActual.finanzas = {
            ...temporadaActual.finanzas,
            gastosFichajes: "",
            profitsFichajes: "",
            gastosEntrenadores: "",
            gastosOjeadores: "",
            gastosInfraestructura: "",
            gastosOtros: "",
            ingresosOtros: temporadaActual.finanzas.ingresosOtros || "",
            gastoTotal: "",
            ingresoTotal: "",
          }
        }

        setTemporada(temporadaActual)
      } catch (error) {
        console.error("Error al cargar los datos:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [params.id, params.temporadaId, router])

  // Calcular automáticamente los totales de finanzas
  const calcularFinanzas = () => {
    if (!temporada) return

    const jugadores = temporada.jugadores || []

    // Calcular gastos en fichajes (suma de valores de compra)
    const gastosFichajes = jugadores
      .filter((j) => j.valorCompra && j.valorCompra !== "")
      .reduce((total, j) => {
        const valor = Number.parseFloat(j.valorCompra?.replace(/[^\d.-]/g, "") || "0")
        return total + (isNaN(valor) ? 0 : valor)
      }, 0)

    // Calcular profits en fichajes (suma de valores de venta)
    const profitsFichajes = jugadores
      .filter((j) => j.valorVenta && j.valorVenta !== "")
      .reduce((total, j) => {
        const valor = Number.parseFloat(j.valorVenta?.replace(/[^\d.-]/g, "") || "0")
        return total + (isNaN(valor) ? 0 : valor)
      }, 0)

    // Calcular gasto total
    const gastosEntrenadores = Number.parseFloat(temporada.finanzas.gastosEntrenadores?.replace(/[^\d.-]/g, "") || "0")
    const gastosOjeadores = Number.parseFloat(temporada.finanzas.gastosOjeadores?.replace(/[^\d.-]/g, "") || "0")
    const gastosInfraestructura = Number.parseFloat(
      temporada.finanzas.gastosInfraestructura?.replace(/[^\d.-]/g, "") || "0",
    )
    const gastosOtros = Number.parseFloat(temporada.finanzas.gastosOtros?.replace(/[^\d.-]/g, "") || "0")

    const gastoTotal = gastosFichajes + gastosEntrenadores + gastosOjeadores + gastosInfraestructura + gastosOtros

    // Calcular ingreso total
    const ingresosOtros = Number.parseFloat(temporada.finanzas.ingresosOtros?.replace(/[^\d.-]/g, "") || "0")
    const ingresoTotal = profitsFichajes + ingresosOtros

    // Actualizar la temporada con los cálculos
    setTemporada((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        finanzas: {
          ...prev.finanzas,
          gastosFichajes: gastosFichajes > 0 ? `${gastosFichajes.toFixed(1)}M€` : "",
          profitsFichajes: profitsFichajes > 0 ? `${profitsFichajes.toFixed(1)}M€` : "",
          gastoTotal: gastoTotal > 0 ? `${gastoTotal.toFixed(1)}M€` : "",
          ingresoTotal: ingresoTotal > 0 ? `${ingresoTotal.toFixed(1)}M€` : "",
        },
      }
    })
  }

  // Ejecutar cálculos cuando cambien los jugadores o gastos
  useEffect(() => {
    if (temporada) {
      calcularFinanzas()
    }
  }, [temporada])

  const copiarJugadoresDeTemporada = (temporadaIndex: number) => {
    if (!modoCarrera || temporadaIndex < 0 || temporadaIndex >= modoCarrera.temporadas.length) return

    const temporadaOrigen = modoCarrera.temporadas[temporadaIndex]
    const jugadoresCopia = temporadaOrigen.jugadores.map((jugador) => ({
      ...jugador,
      valoracionFinal: jugador.valoracion, // La valoración final de la temporada anterior se convierte en inicial
      valorCompra: "", // Resetear valores de compra/venta para la nueva temporada
      valorVenta: "",
      estado: "en_club" as const, // Todos empiezan en el club en la nueva temporada
    }))

    setTemporada((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        jugadores: jugadoresCopia,
      }
    })
  }

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
      valorCompra: "",
      valorVenta: "",
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
        if (filtros.posicion && !jugador.posicion.toLowerCase().includes(filtros.posicion.toLowerCase())) {
          return false
        }
        if (filtros.estado !== "todos" && jugador.estado !== filtros.estado) {
          return false
        }
        return true
      })
      .sort((a, b) => {
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
      const success = updateSeason(params.id, Number(params.temporadaId), temporada)

      if (success) {
        console.log("Temporada actualizada correctamente")
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
        <div className="max-w-6xl mx-auto">
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
                {/* Copiar jugadores de otras temporadas */}
                {modoCarrera.temporadas.length > 1 && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Copy className="mr-2 h-5 w-5" />
                        Copiar Jugadores de Otra Temporada
                      </CardTitle>
                      <CardDescription>
                        Copia la plantilla de una temporada anterior para no tener que cargar todo manualmente
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 items-end">
                        <div className="flex-1">
                          <Label>Seleccionar Temporada</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            onChange={(e) => {
                              const index = Number.parseInt(e.target.value)
                              if (!isNaN(index)) {
                                copiarJugadoresDeTemporada(index)
                              }
                            }}
                            defaultValue=""
                          >
                            <option value="">Selecciona una temporada...</option>
                            {modoCarrera.temporadas.map((temp, index) => (
                              <option key={index} value={index} disabled={index === Number(params.temporadaId)}>
                                {temp.nombre} ({temp.jugadores.length} jugadores)
                                {index === Number(params.temporadaId) ? " - Actual" : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Esto reemplazará todos los jugadores actuales. Los valores de compra/venta se resetearán.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Filtros */}
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

                {/* Lista de jugadores */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Plantilla</span>
                      <Button type="button" variant="outline" size="sm" onClick={calcularFinanzas}>
                        <Calculator className="mr-2 h-4 w-4" />
                        Recalcular Finanzas
                      </Button>
                    </CardTitle>
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
                              <th className="text-left p-2">Media Ini</th>
                              <th className="text-left p-2">Media Fin</th>
                              <th className="text-left p-2">Valor</th>
                              <th className="text-left p-2">V. Compra</th>
                              <th className="text-left p-2">V. Venta</th>
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
                                      value={jugador.valorCompra || ""}
                                      onChange={(e) => {
                                        const newJugadores = [...temporada.jugadores]
                                        newJugadores[originalIndex] = {
                                          ...newJugadores[originalIndex],
                                          valorCompra: e.target.value,
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
                                      placeholder="0M€"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <Input
                                      type="text"
                                      value={jugador.valorVenta || ""}
                                      onChange={(e) => {
                                        const newJugadores = [...temporada.jugadores]
                                        newJugadores[originalIndex] = {
                                          ...newJugadores[originalIndex],
                                          valorVenta: e.target.value,
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
                                      placeholder="0M€"
                                    />
                                  </td>
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

                {/* Añadir jugador */}
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
                        <Label htmlFor="valorCompra">Valor de Compra</Label>
                        <Input
                          id="valorCompra"
                          name="valorCompra"
                          value={nuevoJugador.valorCompra}
                          onChange={handleNuevoJugadorChange}
                          placeholder="Ej: 40M€"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="valorVenta">Valor de Venta</Label>
                        <Input
                          id="valorVenta"
                          name="valorVenta"
                          value={nuevoJugador.valorVenta}
                          onChange={handleNuevoJugadorChange}
                          placeholder="Ej: 50M€"
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

                    <Button type="button" variant="outline" className="mt-4 bg-transparent" onClick={agregarJugador}>
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
                <div className="space-y-6">
                  {/* Resumen automático */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calculator className="mr-2 h-5 w-5" />
                        Resumen Automático
                      </CardTitle>
                      <CardDescription>
                        Calculado automáticamente basado en los datos de jugadores y gastos
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Gastos en Fichajes:</span>
                            <span className="font-medium text-red-600">
                              {temporada.finanzas.gastosFichajes || "0M€"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Profits en Fichajes:</span>
                            <span className="font-medium text-green-600">
                              {temporada.finanzas.profitsFichajes || "0M€"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Gasto Total:</span>
                            <span className="font-medium text-red-600">{temporada.finanzas.gastoTotal || "0M€"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ingreso Total:</span>
                            <span className="font-medium text-green-600">
                              {temporada.finanzas.ingresoTotal || "0M€"}
                            </span>
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

                  {/* Gastos detallados */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Gastos Detallados</CardTitle>
                      <CardDescription>Todos los campos son editables</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="gastosFichajes">Gastos en Fichajes (Auto)</Label>
                          <Input
                            id="gastosFichajes"
                            name="gastosFichajes"
                            placeholder="Calculado automáticamente"
                            value={temporada.finanzas.gastosFichajes}
                            onChange={handleFinanzasChange}
                            className="bg-muted"
                          />
                          <p className="text-xs text-muted-foreground">
                            Se calcula automáticamente, pero puedes editarlo
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gastosEntrenadores">Gastos en Entrenadores</Label>
                          <Input
                            id="gastosEntrenadores"
                            name="gastosEntrenadores"
                            placeholder="Ej: 5M€"
                            value={temporada.finanzas.gastosEntrenadores}
                            onChange={handleFinanzasChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gastosOjeadores">Gastos en Ojeadores</Label>
                          <Input
                            id="gastosOjeadores"
                            name="gastosOjeadores"
                            placeholder="Ej: 2M€"
                            value={temporada.finanzas.gastosOjeadores}
                            onChange={handleFinanzasChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gastosInfraestructura">Gastos en Infraestructura</Label>
                          <Input
                            id="gastosInfraestructura"
                            name="gastosInfraestructura"
                            placeholder="Ej: 10M€"
                            value={temporada.finanzas.gastosInfraestructura}
                            onChange={handleFinanzasChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gastosOtros">Otros Gastos</Label>
                          <Input
                            id="gastosOtros"
                            name="gastosOtros"
                            placeholder="Ej: 3M€"
                            value={temporada.finanzas.gastosOtros}
                            onChange={handleFinanzasChange}
                          />
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
                        <div className="space-y-2">
                          <Label htmlFor="profitsFichajes">Profits en Fichajes (Auto)</Label>
                          <Input
                            id="profitsFichajes"
                            name="profitsFichajes"
                            placeholder="Calculado automáticamente"
                            value={temporada.finanzas.profitsFichajes}
                            onChange={handleFinanzasChange}
                            className="bg-muted"
                          />
                          <p className="text-xs text-muted-foreground">
                            Se calcula automáticamente, pero puedes editarlo
                          </p>
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
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
