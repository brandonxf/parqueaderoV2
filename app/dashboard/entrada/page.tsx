"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Car, Bike, Check, Printer, Scan, Key, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { formatTime } from "@/lib/utils"

interface TipoVehiculo {
  id: number
  nombre: string
  categoria: string
}

interface EntradaResult {
  registro: { id: number; placa: string; fecha_hora_entrada: string }
  espacio: { id: number; codigo: string }
  ticket: { codigo_ticket: string }
}

export default function EntradaPage() {
  const [placa, setPlaca] = useState("")
  const [email, setEmail] = useState("")
  const [tipoVehiculoId, setTipoVehiculoId] = useState<number | null>(null)
  const [tipos, setTipos] = useState<TipoVehiculo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<EntradaResult | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/tipos-vehiculo")
      .then((r) => r.json())
      .then(setTipos)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!placa || !tipoVehiculoId) {
      setError("Selecciona tipo de vehículo e ingresa la placa")
      return
    }

    setError("")
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/registros/entrada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placa, tipo_vehiculo_id: tipoVehiculoId, email: email || null }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }

      setResult(data)
      try {
        const QR = await import('qrcode')
        const qr = await QR.toDataURL(data.ticket.codigo_ticket, {
          width: 200,
          margin: 2,
          errorCorrectionLevel: 'M',
        })
        setQrDataUrl(qr)
      } catch (err) {
        console.error('QR generation failed', err)
        setQrDataUrl(null)
      }
      setPlaca("")
      setEmail("")
      setTipoVehiculoId(null)
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  function handlePrint() {
    if (!result) return
    const printWindow = window.open("", "_blank", "width=400,height=500")
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head><title>Ticket de Entrada</title>
        <style>
          body { font-family: monospace; text-align: center; padding: 20px; }
          h1 { font-size: 18px; margin-bottom: 4px; }
          .line { border-top: 1px dashed #000; margin: 10px 0; }
          .big { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
        </style>
        </head>
        <body>
          <h1>PARKCONTROL</h1>
          <p>Ticket de Entrada</p>
          <div class="line"></div>
          <p class="big">${result.ticket.codigo_ticket}</p>
          ${qrDataUrl ? `<div style="margin:12px 0"><img src="${qrDataUrl}" width="180" height="180" style="display:inline-block"/></div>` : ""}
          <div class="line"></div>
          <p><strong>Placa:</strong> ${result.registro.placa}</p>
          <p><strong>Espacio:</strong> ${result.espacio.codigo}</p>
          <p><strong>Entrada:</strong> ${new Date(result.registro.fecha_hora_entrada).toLocaleString("es-CO")}</p>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Registrar Entrada</h1>
        <p className="text-sm text-muted-foreground mt-1">Ingrese los datos del vehículo</p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">Datos del Vehículo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Vehicle Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tipo de vehículo</Label>
              <div className="grid grid-cols-2 gap-3">
                {tipos.map((tipo) => (
                  <button
                    key={tipo.id}
                    type="button"
                    onClick={() => setTipoVehiculoId(tipo.id)}
                    className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                      tipoVehiculoId === tipo.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    {tipo.categoria === "MOTO" ? (
                      <Bike className={`h-5 w-5 ${tipoVehiculoId === tipo.id ? "text-primary" : "text-muted-foreground"}`} />
                    ) : (
                      <Car className={`h-5 w-5 ${tipoVehiculoId === tipo.id ? "text-primary" : "text-muted-foreground"}`} />
                    )}
                    <span className={`text-sm font-medium ${tipoVehiculoId === tipo.id ? "text-primary" : "text-foreground"}`}>
                      {tipo.nombre}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Plate */}
            <div className="space-y-2">
              <Label htmlFor="placa">Placa</Label>
              <Input
                id="placa"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="font-mono uppercase h-11"
                maxLength={7}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="h-11"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full h-11"
              disabled={loading || !placa || !tipoVehiculoId}
            >
              {loading ? "Registrando..." : "Registrar Entrada"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card className="border-success/30 bg-success/5">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-success text-base">
              <Check className="h-4 w-4" />
              Entrada Registrada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-card p-4 border">
              <p className="text-xs text-muted-foreground">Código de Ticket</p>
              <p className="font-mono text-xl font-semibold mt-1">{result.ticket.codigo_ticket}</p>
              {qrDataUrl && (
                <img src={qrDataUrl} alt="QR" className="mt-3 rounded" width={120} height={120} />
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Placa</p>
                <p className="font-mono font-semibold">{result.registro.placa}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Espacio</p>
                <p className="font-semibold text-primary">{result.espacio.codigo}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Hora</p>
                <p className="font-medium">{formatTime(result.registro.fecha_hora_entrada)}</p>
              </div>
            </div>

            <Button variant="outline" className="w-full gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Imprimir Ticket
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
