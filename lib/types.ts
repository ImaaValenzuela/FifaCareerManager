export interface Jugador {
  nombre: string
  posicion: string
  edad: string
  valoracion: string
  valor: string
  estado: "en_club" | "cedido" | "vendido"
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
