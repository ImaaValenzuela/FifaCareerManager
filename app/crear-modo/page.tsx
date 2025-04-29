"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import { createCareerMode } from "@/lib/career-mode-service"

export default function CrearModoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    equipo: "",
    temporadaInicial: "",
    reglas: "",
    objetivos: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Crear el modo carrera con un array de temporadas vacío
      const modoId = createCareerMode({
        ...formData,
        fechaCreacion: new Date().toISOString(),
        temporadas: [],
      })

      console.log("Modo carrera creado con ID:", modoId)

      // Redirigir al dashboard del modo carrera
      router.push(`/modo/${modoId}`)
    } catch (error) {
      console.error("Error al crear el modo carrera:", error)
      alert("Hubo un error al crear el modo carrera. Por favor, intenta de nuevo.")
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-green-800 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">FIFA Career Mode Manager</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Iniciar Nuevo Modo Carrera</CardTitle>
              <CardDescription>Configura los detalles de tu nuevo modo carrera</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Modo Carrera</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    placeholder="Ej: Mi Carrera con el Barcelona"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipo">Equipo</Label>
                  <Input
                    id="equipo"
                    name="equipo"
                    placeholder="Ej: FC Barcelona"
                    value={formData.equipo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temporadaInicial">Temporada Inicial</Label>
                  <Input
                    id="temporadaInicial"
                    name="temporadaInicial"
                    placeholder="Ej: 2023/2024"
                    value={formData.temporadaInicial}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reglas">Reglas Personalizadas</Label>
                  <Textarea
                    id="reglas"
                    name="reglas"
                    placeholder="Describe las reglas que seguirás en este modo carrera..."
                    className="min-h-[100px]"
                    value={formData.reglas}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objetivos">Objetivos Generales</Label>
                  <Textarea
                    id="objetivos"
                    name="objetivos"
                    placeholder="Describe los objetivos a largo plazo para este modo carrera..."
                    className="min-h-[100px]"
                    value={formData.objetivos}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-green-700 hover:bg-green-800">
                  <Save className="mr-2 h-4 w-4" />
                  Crear Modo Carrera
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
