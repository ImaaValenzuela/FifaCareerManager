"use client"

import type { CareerMode, Temporada } from "./types"

const STORAGE_KEY = "fifa_career_modes"

// Obtener todos los modos carrera
export function getCareerModes(): CareerMode[] {
  if (typeof window === "undefined") return []

  try {
    const storedData = localStorage.getItem(STORAGE_KEY)
    if (!storedData) return []
    return JSON.parse(storedData)
  } catch (error) {
    console.error("Error parsing career modes:", error)
    return []
  }
}

// Obtener un modo carrera específico
export function getCareerMode(id: string): CareerMode | null {
  const modes = getCareerModes()
  return modes.find((mode) => mode.id === id) || null
}

// Crear un nuevo modo carrera
export function createCareerMode(data: Omit<CareerMode, "id">): string {
  const modes = getCareerModes()

  // Generar un ID único
  const id = Date.now().toString()

  const newMode: CareerMode = {
    ...data,
    id,
  }

  // Guardar en localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...modes, newMode]))

  return id
}

// Añadir una temporada a un modo carrera
export function addSeason(modoId: string, temporada: Temporada): boolean {
  try {
    const modes = getCareerModes()
    const modeIndex = modes.findIndex((mode) => mode.id === modoId)

    if (modeIndex === -1) return false

    // Asegurarse de que temporadas es un array
    if (!Array.isArray(modes[modeIndex].temporadas)) {
      modes[modeIndex].temporadas = []
    }

    // Asegurarse de que todos los campos necesarios estén presentes
    const temporadaCompleta: Temporada = {
      nombre: temporada.nombre || `Temporada ${modes[modeIndex].temporadas.length + 1}`,
      objetivos: temporada.objetivos || "",
      jugadores: Array.isArray(temporada.jugadores) ? temporada.jugadores : [],
      posiciones: {
        liga: temporada.posiciones?.liga || "",
        copa: temporada.posiciones?.copa || "",
        champions: temporada.posiciones?.champions || "",
        otros: temporada.posiciones?.otros || "",
      },
      finanzas: {
        presupuestoInicial: temporada.finanzas?.presupuestoInicial || "",
        gastosFichajes: temporada.finanzas?.gastosFichajes || "",
        profitsFichajes: temporada.finanzas?.profitsFichajes || "",
        gastosEntrenadores: temporada.finanzas?.gastosEntrenadores || "",
        gastosOjeadores: temporada.finanzas?.gastosOjeadores || "",
        gastosInfraestructura: temporada.finanzas?.gastosInfraestructura || "",
        gastosOtros: temporada.finanzas?.gastosOtros || "",
        ingresosOtros: temporada.finanzas?.ingresosOtros || "",
        gastoTotal: temporada.finanzas?.gastoTotal || "",
        ingresoTotal: temporada.finanzas?.ingresoTotal || "",
        presupuestoFinal: temporada.finanzas?.presupuestoFinal || "",
      },
      completada: temporada.completada || false,
    }

    // Añadir la temporada al modo
    modes[modeIndex].temporadas.push(temporadaCompleta)

    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modes))

    console.log("Temporada guardada correctamente:", temporadaCompleta)
    console.log("Modo carrera actualizado:", modes[modeIndex])

    return true
  } catch (error) {
    console.error("Error adding season:", error)
    return false
  }
}

// Actualizar una temporada específica
export function updateSeason(modoId: string, temporadaIndex: number, temporada: Temporada): boolean {
  try {
    const modes = getCareerModes()
    const modeIndex = modes.findIndex((mode) => mode.id === modoId)

    if (modeIndex === -1) return false
    if (!Array.isArray(modes[modeIndex].temporadas)) return false
    if (temporadaIndex < 0 || temporadaIndex >= modes[modeIndex].temporadas.length) return false

    // Actualizar la temporada
    modes[modeIndex].temporadas[temporadaIndex] = temporada

    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modes))

    return true
  } catch (error) {
    console.error("Error updating season:", error)
    return false
  }
}

// Actualizar un modo carrera
export function updateCareerMode(id: string, data: Partial<CareerMode>): boolean {
  const modes = getCareerModes()
  const modeIndex = modes.findIndex((mode) => mode.id === id)

  if (modeIndex === -1) return false

  // Actualizar los datos
  modes[modeIndex] = {
    ...modes[modeIndex],
    ...data,
  }

  // Guardar en localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(modes))

  return true
}

// Eliminar un modo carrera
export function deleteCareerMode(id: string): boolean {
  const modes = getCareerModes()
  const filteredModes = modes.filter((mode) => mode.id !== id)

  if (filteredModes.length === modes.length) return false

  // Guardar en localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredModes))

  return true
}
