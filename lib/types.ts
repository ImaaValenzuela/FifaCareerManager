export interface Jugador {
  nombre: string
  posicion: string
  edad: string
  valoracion: string
  valoracionFinal?: string
  valor: string
  valorCompra?: string // Nuevo campo
  valorVenta?: string // Nuevo campo
  salario?: string
  estado: "en_club" | "cedido" | "vendido"
}

export interface Finanzas {
  presupuestoInicial: string
  // Fichajes (calculados automáticamente pero editables)
  gastosFichajes: string
  profitsFichajes: string
  // Otros gastos detallados
  gastosEntrenadores: string
  gastosOjeadores: string
  gastosInfraestructura: string
  gastosOtros: string
  // Otros ingresos
  ingresosOtros: string
  // Totales
  gastoTotal: string
  ingresoTotal: string
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
