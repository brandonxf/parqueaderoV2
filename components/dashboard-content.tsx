"use client"

import { Car, Bike, DollarSign, ArrowDownRight, Clock, TrendingUp, Activity, ParkingCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatTime } from "@/lib/utils"

interface DashboardProps {
  user: { nombre: string; rol: string }
  resumen: Array<{ categoria: string; total: string; disponibles: string; ocupados: string }>
  statsHoy: { vehiculos_dentro: string; salidas_hoy: string; ingresos_hoy: string }
  ultimosRegistros: Array<{
    placa: string
    tipo_vehiculo: string
    espacio: string
    estado: string
    fecha_hora_entrada: string
  }>
}

function formatCurrency(val: string | number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
    Number(val)
  )
}

export function DashboardContent({ user, resumen, statsHoy, ultimosRegistros }: DashboardProps) {
  const autoData = resumen.find((r) => r.categoria === "AUTO") || { total: "0", disponibles: "0", ocupados: "0" }
  const motoData = resumen.find((r) => r.categoria === "MOTO") || { total: "0", disponibles: "0", ocupados: "0" }

  const autoPercent = Number(autoData.total) > 0 ? (Number(autoData.ocupados) / Number(autoData.total)) * 100 : 0
  const motoPercent = Number(motoData.total) > 0 ? (Number(motoData.ocupados) / Number(motoData.total)) * 100 : 0

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full opacity-80" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Bienvenido, <span className="text-gradient">{user.nombre}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Panel de control del sistema de parqueadero
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 text-success" />
            <span className="flex items-center gap-1">
              Sistema activo
              <span className="flex h-2 w-2 rounded-full bg-success pulse-dot" />
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Auto Spaces */}
        <Card className="card-hover border-l-4 border-l-primary">
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Car className="h-7 w-7 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Espacios Autos</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">
                {autoData.disponibles}
                <span className="text-sm font-normal text-muted-foreground">/{autoData.total}</span>
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all"
                  style={{ width: `${autoPercent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Moto Spaces */}
        <Card className="card-hover border-l-4 border-l-accent">
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5">
              <Bike className="h-7 w-7 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Espacios Motos</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">
                {motoData.disponibles}
                <span className="text-sm font-normal text-muted-foreground">/{motoData.total}</span>
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent/70 transition-all"
                  style={{ width: `${motoPercent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Inside */}
        <Card className="card-hover border-l-4 border-l-warning">
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-warning/20 to-warning/5">
              <Clock className="h-7 w-7 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vehículos dentro</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{statsHoy.vehiculos_dentro}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {statsHoy.salidas_hoy} salidas hoy
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Today's Income */}
        <Card className="card-hover border-l-4 border-l-success">
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-success/20 to-success/5">
              <DollarSign className="h-7 w-7 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ingresos hoy</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{formatCurrency(statsHoy.ingresos_hoy)}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-success">
                <TrendingUp className="h-3 w-3" />
                <span>Día actual</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Availability Visual */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        <Card className="card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2.5 text-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold">Zona de Autos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-5xl font-bold text-primary">{autoData.disponibles}</p>
                <p className="text-sm text-muted-foreground mt-1">disponibles de {autoData.total}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-destructive">{autoData.ocupados}</p>
                <p className="text-sm text-muted-foreground">ocupados</p>
              </div>
            </div>
            {/* Space visualization */}
            <div className="mt-6 flex flex-wrap gap-2">
              {Array.from({ length: Math.min(Number(autoData.total), 12) }).map((_, i) => (
                <div
                  key={i}
                  className={`h-10 w-10 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                    i < Number(autoData.disponibles)
                      ? "bg-success/20 text-success border border-success/30"
                      : "bg-destructive/20 text-destructive border border-destructive/30"
                  }`}
                >
                  {i < Number(autoData.disponibles) ? (
                    <ParkingCircle className="h-5 w-5" />
                  ) : (
                    <Car className="h-4 w-4" />
                  )}
                </div>
              ))}
              {Number(autoData.total) > 12 && (
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  +{Number(autoData.total) - 12}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2.5 text-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                <Bike className="h-5 w-5 text-accent" />
              </div>
              <span className="font-semibold">Zona de Motos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-5xl font-bold text-accent">{motoData.disponibles}</p>
                <p className="text-sm text-muted-foreground mt-1">disponibles de {motoData.total}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-destructive">{motoData.ocupados}</p>
                <p className="text-sm text-muted-foreground">ocupados</p>
              </div>
            </div>
            {/* Space visualization */}
            <div className="mt-6 flex flex-wrap gap-2">
              {Array.from({ length: Math.min(Number(motoData.total), 12) }).map((_, i) => (
                <div
                  key={i}
                  className={`h-10 w-10 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                    i < Number(motoData.disponibles)
                      ? "bg-success/20 text-success border border-success/30"
                      : "bg-destructive/20 text-destructive border border-destructive/30"
                  }`}
                >
                  {i < Number(motoData.disponibles) ? (
                    <ParkingCircle className="h-5 w-5" />
                  ) : (
                    <Bike className="h-4 w-4" />
                  )}
                </div>
              ))}
              {Number(motoData.total) > 12 && (
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  +{Number(motoData.total) - 12}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Records */}
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <ArrowDownRight className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold">Últimos Movimientos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ultimosRegistros.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No hay movimientos registrados</p>
          ) : (
            <div className="space-y-3 sm:overflow-x-auto">
              {/* Mobile view */}
              <div className="space-y-3 sm:hidden">
                {ultimosRegistros.map((reg, i) => (
                  <div key={i} className="rounded-xl border border-border/50 p-4 space-y-3 bg-card/50">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-lg text-foreground">{reg.placa}</span>
                      <Badge
                        variant={reg.estado === "EN_CURSO" ? "default" : "secondary"}
                        className={
                          reg.estado === "EN_CURSO"
                            ? "bg-warning text-warning-foreground"
                            : "bg-success text-success-foreground"
                        }
                      >
                        {reg.estado === "EN_CURSO" ? "En curso" : "Finalizado"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Tipo</p>
                        <p className="font-medium">{reg.tipo_vehiculo}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Espacio</p>
                        <p className="font-medium">{reg.espacio}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Hora</p>
                        <p className="font-medium">{formatTime(reg.fecha_hora_entrada)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop view */}
              <table className="hidden w-full text-sm sm:table">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-4 font-semibold text-muted-foreground">Placa</th>
                    <th className="pb-4 font-semibold text-muted-foreground">Tipo</th>
                    <th className="pb-4 font-semibold text-muted-foreground">Espacio</th>
                    <th className="pb-4 font-semibold text-muted-foreground">Hora Entrada</th>
                    <th className="pb-4 font-semibold text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosRegistros.map((reg, i) => (
                    <tr key={i} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-4 font-mono font-bold text-foreground">{reg.placa}</td>
                      <td className="py-4 text-foreground">{reg.tipo_vehiculo}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          {reg.espacio}
                        </span>
                      </td>
                      <td className="py-4 text-foreground">{formatTime(reg.fecha_hora_entrada)}</td>
                      <td className="py-4">
                        <Badge
                          variant={reg.estado === "EN_CURSO" ? "default" : "secondary"}
                          className={
                            reg.estado === "EN_CURSO"
                              ? "bg-warning text-warning-foreground"
                              : "bg-success text-success-foreground"
                          }
                        >
                          {reg.estado === "EN_CURSO" ? "En curso" : "Finalizado"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
