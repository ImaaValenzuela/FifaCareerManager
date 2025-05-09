"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trophy } from "lucide-react"
import { getCareerModes } from "@/lib/career-mode-service"
import type { CareerMode } from "@/lib/types"

export default function HomePage() {
  const [modos, setModos] = useState<CareerMode[]>([])

  useEffect(() => {
    // Cargar los modos carrera al montar el componente
    const cargarModos = () => {
      try {
        const modosCarrera = getCareerModes()
        setModos(modosCarrera)
      } catch (error) {
        console.error("Error al cargar los modos carrera:", error)
      }
    }

    cargarModos()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-green-800 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">FIFA Career Mode Manager</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto text-center space-y-8 py-12">
          <Trophy className="w-16 h-16 mx-auto text-green-700" />
          <h2 className="text-3xl font-bold">Gestiona tu Modo Carrera de FIFA</h2>
          <p className="text-lg text-muted-foreground">
            Lleva un registro detallado de tus temporadas, jugadores, objetivos y más.
          </p>

          <div className="pt-6">
            <Link href="/crear-modo">
              <Button size="lg" className="bg-green-700 hover:bg-green-800">
                <PlusCircle className="mr-2 h-5 w-5" />
                Iniciar Nuevo Modo Carrera
              </Button>
            </Link>
          </div>

          <div className="mt-12 border-t pt-8">
            <h3 className="text-xl font-medium mb-4">Modos Carrera Existentes</h3>
            {modos.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {modos.map((modo) => (
                  <Link key={modo.id} href={`/modo/${modo.id}`} className="block">
                    <div className="border rounded-lg p-4 text-left hover:border-green-500 transition-colors">
                      <h4 className="font-medium">{modo.nombre}</h4>
                      <p className="text-sm text-muted-foreground">{modo.equipo}</p>
                      <p className="text-xs text-muted-foreground mt-2">{modo.temporadas?.length || 0} temporadas</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                No hay modos carrera creados. ¡Crea tu primer modo carrera para comenzar!
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">FIFA Career Mode Manager &copy; {new Date().getFullYear()}</div>
      </footer>
    </div>
  )
}
