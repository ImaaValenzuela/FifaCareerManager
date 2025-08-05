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
import { ArrowLeft, Save } from "lucide-react"
import { getCareerMode, addSeason } from "@/lib/career-mode-service"
import type { CareerMode, Temporada } from "@/lib/types"

export default function NuevaTemporadaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [modoCarrera, setModoCarrera] = useState<CareerMode | null>(null)
  const [loading, setLoading] = useState(true)

  // Asegurarse de que todos los campos estén correctamente inicializados
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
    finanzas: {
      presupuestoInicial: "",
      gastosFichajes: "",
      profitsFichajes: "",
      gastosEntrenadores: "",
      gastosOjeadores: "",
      gastosInfraestructura: "",
      gastosOtros: "",
      ingresosOtros: "",
      gastoTotal: "",
      ingresoTotal: "",
      presupuestoFinal: "",
    },
    completada: false,
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

        // Si hay temporadas anteriores, establecer el nombre de la temporada
        if (modo.temporadas.length > 0) {
          setFormData((prev) => ({
            ...prev,
            nombre: `Temporada ${modo.temporadas.length + 1}`,
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

  // Mejorar el manejo del formulario y la depuración
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!modoCarrera) {
      console.error("No hay modo carrera cargado")
      return
    }

    try {
      console.log("Intentando añadir temporada:", formData)

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

                <div className="text-sm text-muted-foreground">
                  <p>
                    Podrás añadir jugadores, posiciones finales y datos financieros más adelante cuando edites la
                    temporada.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-green-700 hover:bg-green-800">
                  <Save className="mr-2 h-4 w-4" />
                  Crear Temporada
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
