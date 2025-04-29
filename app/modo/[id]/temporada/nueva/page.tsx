"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import { getCareerMode, addSeason } from "@/lib/career-mode-service"
import type { CareerMode, Jugador, Temporada } from "@/lib/types"

export default function NuevaTemporadaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [modoCarrera, setModoCarrera] = useState<CareerMode | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<Temporada>({
    nombre: "",
    objetivos: "",
    jugadores: [],
    posiciones: {
      liga: "",
      copa: "",
      champions: "",
      otros: "",
    },
  })

  const [nuevoJugador, setNuevoJugador] = useState<Jugador>({
    nombre: "",
    posicion: "",
    edad: "",
    valoracion: "",
    valor: "",
    estado: "en_club",
  })

  useEffect(() => {
    const cargarModo = () => {
      try {
        const modo = getCareerMode(params.id)
        if (!modo) {
          router.push("/")
          return
        }
        setModoCarrera(modo)

        // Si hay temporadas anteriores, pre-cargar jugadores que siguen en el club
        if (modo.temporadas.length > 0) {
          const ultimaTemporada = modo.temporadas[modo.temporadas.length - 1]
          const jugadoresEnClub = ultimaTemporada.jugadores
            .filter((j) => j.estado === "en_club" || j.estado === "cedido")
            .map((j) => ({
              ...j,
              estado: j.estado === "cedido" ? "en_club" : j.estado, // Los cedidos vuelven al club
            }))

          setFormData((prev) => ({
            ...prev,
            nombre: `Temporada ${modo.temporadas.length + 1}`,
            jugadores: jugadoresEnClub,
          }))
        } else {
          // Primera temporada
          setFormData((prev) => ({
            ...prev,
            nombre: "Temporada 1",
          }))
        }
      } catch (error) {
        console.error("Error al cargar el modo carrera:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    cargarModo()
  }, [params.id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePosicionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      posiciones: {
        ...prev.posiciones,
        [name]: value,
      },
    }))
  }

  const handleNuevoJugadorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNuevoJugador((prev) => ({ ...prev, [name]: value }))
  }

  const agregarJugador = () => {
    if (!nuevoJugador.nombre) return

    setFormData((prev) => ({
      ...prev,
      jugadores: [...prev.jugadores, { ...nuevoJugador }],
    }))

    // Resetear el formulario de nuevo jugador
    setNuevoJugador({
      nombre: "",
      posicion: "",
      edad: "",
      valoracion: "",
      valor: "",
      estado: "en_club",
    })
  }

  const eliminarJugador = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      jugadores: prev.jugadores.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!modoCarrera) {
      console.error("No hay modo carrera cargado")
      return
    }

    try {
      // Añadir la temporada al modo carrera
      const success = addSeason(params.id, formData)

      if (success) {
        console.log("Temporada añadida correctamente")
        // Redirigir al dashboard del modo carrera
        router.push(`/modo/${params.id}`)
      } else {
        console.error("Error al añadir la temporada")
        alert("Hubo un error al guardar la temporada. Por favor, intenta de nuevo.")
      }
    } catch (error) {
      console.error("Error al guardar la temporada:", error)
      alert("Hubo un error al guardar la temporada. Por favor, intenta de nuevo.")
    }
  }

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
        <div className="max-w-3xl mx-auto">
          <Link
            href={`/modo/${params.id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al modo carrera
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Nueva Temporada</CardTitle>
              <CardDescription>
                {modoCarrera.nombre} - {modoCarrera.equipo}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre de la Temporada</Label>
                  <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objetivos">Objetivos de la Temporada</Label>
                  <Textarea
                    id="objetivos"
                    name="objetivos"
                    placeholder="Describe los objetivos para esta temporada..."
                    className="min-h-[100px]"
                    value={formData.objetivos}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Posiciones Finales</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="liga">Liga</Label>
                      <Input
                        id="liga"
                        name="liga"
                        placeholder="Ej: 1° - Campeón"
                        value={formData.posiciones.liga}
                        onChange={handlePosicionChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="copa">Copa Nacional</Label>
                      <Input
                        id="copa"
                        name="copa"
                        placeholder="Ej: Semifinales"
                        value={formData.posiciones.copa}
                        onChange={handlePosicionChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="champions">Champions League</Label>
                      <Input
                        id="champions"
                        name="champions"
                        placeholder="Ej: Cuartos de Final"
                        value={formData.posiciones.champions}
                        onChange={handlePosicionChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="otros">Otros Torneos</Label>
                      <Input
                        id="otros"
                        name="otros"
                        placeholder="Ej: Supercopa - Campeón"
                        value={formData.posiciones.otros}
                        onChange={handlePosicionChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Jugadores</h3>

                  {formData.jugadores.length > 0 && (
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
                            <th className="text-left p-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.jugadores.map((jugador, index) => (
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
                              <td className="p-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => eliminarJugador(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Añadir Jugador</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <Label htmlFor="valoracion">Valoración</Label>
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
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-green-700 hover:bg-green-800">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Temporada
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">FIFA Career Mode Manager &copy; {new Date().getFullYear()}</div>
      </footer>
    </div>
  )
}
