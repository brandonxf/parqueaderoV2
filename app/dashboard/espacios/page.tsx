"use client"

import { useEffect, useState } from "react"
import { ParkingSquare, Car, Bike, RefreshCw, Clock, MapPin, Truck, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Espacio {
  id: number
  codigo: string
  categoria: string
  disponible: boolean
  vehiculo_placa: string | null
  registro_id?: number | null
}

interface Resumen {
  categoria: string
  total: string
  disponibles: string
  ocupados: string
}

interface RegistroDetail {
  id: number
  placa: string
  espacio_id: number
  tipo_vehiculo: string | null
  usuario_entrada: string | null
  fecha_hora_entrada: string | null
}

interface SalidaResult {
  registro: any
  minutos_totales: number
  valor_calculado: number
  valor_final: number
  tipo_vehiculo: string | null
}

export default function EspaciosPage() {
  const [espacios, setEspacios] = useState<Espacio[]>([])
  const [resumen, setResumen] = useState<Resumen[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Espacio | null>(null)
  const [registro, setRegistro] = useState<RegistroDetail | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [salidaResult, setSalidaResult] = useState<SalidaResult | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch("/api/espacios")
      const data = await res.json()
      setEspacios(data.espacios)
      setResumen(data.resumen)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const autoEspacios = espacios.filter((e) => e.categoria === "AUTO")
  const motoEspacios = espacios.filter((e) => e.categoria === "MOTO")

  async function openEspacioModal(esp: Espacio) {
    setSelected(esp)
    setModalOpen(true)
    // fetch registro details (active records) and find by registro_id
    try {
      const res = await fetch(`/api/registros?estado=EN_CURSO`)
      const data: RegistroDetail[] = await res.json()
      const found = data.find((r) => r.id === (esp as any).registro_id)
      if (found) setRegistro(found)
      else setRegistro(null)
    } catch (e) {
      setRegistro(null)
    }
  }

  async function registrarSalida() {
    if (!registro) return
    try {
      const res = await fetch(`/api/registros/salida`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placa: registro.placa }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err?.error || "Error al registrar salida")
        return
      }
      const data = await res.json()
      // success: close modal, show lateral panel with salida
      setModalOpen(false)
      setSelected(null)
      setRegistro(null)
      setSalidaResult(data)
      setPanelOpen(true)
      fetchData()
    } catch (e) {
      alert("Error de red")
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full opacity-80" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Mapa de <span className="text-gradient">Espacios</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Visualización en tiempo real del parqueadero
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-success" />
              <span>Actualizado</span>
            </div>
            <Button variant="outline" className="gap-2 h-10" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {resumen.map((r) => {
          const Icon = r.categoria === "AUTO" ? Car : Bike
          const isAuto = r.categoria === "AUTO"
          const percentOcupados = Number(r.total) > 0 ? (Number(r.ocupados) / Number(r.total)) * 100 : 0
          
          return (
            <Card key={r.categoria} className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isAuto ? 'bg-primary/10' : 'bg-accent/10'}`}>
                      <Icon className={`h-6 w-6 ${isAuto ? 'text-primary' : 'text-accent'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{isAuto ? 'Autos' : 'Motos'}</p>
                      <p className="text-sm text-muted-foreground">
                        {r.ocupados} de {r.total} ocupados
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-foreground">{r.disponibles}</p>
                    <p className="text-xs text-muted-foreground">disponibles</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${isAuto ? 'bg-primary' : 'bg-accent'}`}
                    style={{ width: `${percentOcupados}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Parking Grid Visualization */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Autos Section */}
        <Card className="card-hover">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="font-semibold">Zona de Autos</span>
                <p className="text-xs text-muted-foreground font-normal">{autoEspacios.length} espacios totales</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Parking lot visualization */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 p-4 min-h-[280px]">
              {/* Grid lines */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                  linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }} />
              
              {/* Parking spots */}
              <div className="grid grid-cols-4 gap-3 relative z-10">
                {autoEspacios.map((esp) => (
                  <button
                    key={esp.id}
                    onClick={() => !esp.disponible && openEspacioModal(esp)}
                    disabled={esp.disponible}
                    className={`group relative flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-all duration-300 ${
                      esp.disponible
                        ? "border-success/30 bg-success/10 hover:border-success hover:bg-success/20 cursor-pointer"
                        : "border-destructive/30 bg-destructive/10 hover:border-destructive hover:bg-destructive/20 cursor-pointer"
                    }`}
                  >
                    {esp.disponible ? (
                      <div className="flex flex-col items-center gap-1">
                        <ParkingSquare className="h-6 w-6 text-success" />
                        <span className="text-xs font-bold text-success">{esp.codigo}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Car className="h-6 w-6 text-destructive" />
                        <span className="text-xs font-bold text-destructive">{esp.codigo}</span>
                        <span className="text-[10px] font-mono text-destructive/80">{esp.vehiculo_placa}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border border-success/30 bg-success/10" />
                <span>Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border border-destructive/30 bg-destructive/10" />
                <span>Ocupado</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Motos Section */}
        <Card className="card-hover">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <Bike className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span className="font-semibold">Zona de Motos</span>
                <p className="text-xs text-muted-foreground font-normal">{motoEspacios.length} espacios totales</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Parking lot visualization */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 p-4 min-h-[280px]">
              {/* Grid lines */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                  linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }} />
              
              {/* Parking spots */}
              <div className="grid grid-cols-4 gap-3 relative z-10">
                {motoEspacios.map((esp) => (
                  <button
                    key={esp.id}
                    onClick={() => !esp.disponible && openEspacioModal(esp)}
                    disabled={esp.disponible}
                    className={`group relative flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-all duration-300 ${
                      esp.disponible
                        ? "border-success/30 bg-success/10 hover:border-success hover:bg-success/20 cursor-pointer"
                        : "border-destructive/30 bg-destructive/10 hover:border-destructive hover:bg-destructive/20 cursor-pointer"
                    }`}
                  >
                    {esp.disponible ? (
                      <div className="flex flex-col items-center gap-1">
                        <ParkingSquare className="h-6 w-6 text-success" />
                        <span className="text-xs font-bold text-success">{esp.codigo}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Bike className="h-6 w-6 text-destructive" />
                        <span className="text-xs font-bold text-destructive">{esp.codigo}</span>
                        <span className="text-[10px] font-mono text-destructive/80">{esp.vehiculo_placa}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border border-success/30 bg-success/10" />
                <span>Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border border-destructive/30 bg-destructive/10" />
                <span>Ocupado</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal for selected espacio */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Espacio {selected?.codigo}
              </DialogTitle>
              <DialogDescription>
                Información del vehículo estacionado
              </DialogDescription>
            </DialogHeader>

            {registro ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-muted/50 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                      <Car className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-mono text-lg font-bold">{registro.placa}</p>
                      <p className="text-xs text-muted-foreground">{registro.tipo_vehiculo}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Hora de entrada</p>
                    <p className="font-medium">{registro.fecha_hora_entrada}</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Usuario</p>
                    <p className="font-medium">{registro.usuario_entrada || '-'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No hay información del vehículo</p>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cerrar</Button>
              {registro && (
                <Button variant="destructive" onClick={registrarSalida}>
                  Registrar Salida
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Salida result dialog */}
        <Dialog open={panelOpen} onOpenChange={(v) => { setPanelOpen(v); if (!v) setSalidaResult(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Check className="h-5 w-5 text-success" />
                Salida Registrada
              </DialogTitle>
              <DialogDescription>Resumen de la salida generada</DialogDescription>
            </DialogHeader>

            {salidaResult && (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-success/10 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Total a pagar</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${salidaResult.valor_final?.toLocaleString('es-CO')}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Placa</p>
                    <p className="font-mono font-medium">{salidaResult.registro?.placa}</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Tipo</p>
                    <p className="font-medium">{salidaResult.tipo_vehiculo}</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Minutos</p>
                    <p className="font-medium">{salidaResult.minutos_totales}</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Descuento</p>
                    <p className="font-medium">${salidaResult.registro?.descuento || 0}</p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="ghost" onClick={() => { setPanelOpen(false); setSalidaResult(null); }}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  )
}
