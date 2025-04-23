"use client"

import type { CareerMode, Temporada } from "./types"

const STORAGE_KEY = "fifa_career_modes"

// Obtener todos los modos carrera
export function getCareerModes(): CareerMode[] {
  if (typeof window === "undefined") return []

  const storedData = localStorage.getItem(STORAGE_KEY)
  if (!storedData) return []

  try {
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
  const modes = getCareerModes()
  const modeIndex = modes.findIndex((mode) => mode.id === modoId)

  if (modeIndex === -1) return false

  // Añadir la temporada al modo
  modes[modeIndex].temporadas.push(temporada)

  // Guardar en localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(modes))

  return true
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
