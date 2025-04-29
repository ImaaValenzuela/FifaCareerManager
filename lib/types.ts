export interface Jugador {
  nombre: string
  posicion: string
  edad: string
  valoracion: string
  valoracionFinal?: string
  valor: string
  salario?: string
  estado: "en_club" | "cedido" | "vendido"
}

export interface Finanzas {
  presupuestoInicial: string
  ingresosTransferencias: string
  egresosTransferencias: string
  ingresosOtros: string
  egresosOtros: string
  presupuestoFinal: string
}

export interface Temporada {
  nombre: string
  objetivos: string
  jugadores: Jugador[]
  posiciones: {
    liga: string
    copa: string
    champions: string
    otros: string
  }
  finanzas: Finanzas
  completada: boolean
}

export interface CareerMode {
  id?: string
  nombre: string
  equipo: string
  temporadaInicial: string
  reglas: string
  objetivos: string
  fechaCreacion: string
  temporadas: Temporada[]
}
