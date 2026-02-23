"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { QrCode, Search, Check, Printer, Clock, DollarSign, Scan } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { formatTime } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface SalidaResult {
  registro: {
    id: number
    placa: string
    fecha_hora_entrada: string
    fecha_hora_salida: string
    valor_final: string
    valor_calculado: string
    descuento: string
  }
  minutos_totales: number
  valor_calculado: number
  valor_final: number
  tipo_vehiculo: string
}

function formatCurrency(val: string | number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
    Number(val)
  )
}

function formatDuration(minutes: number) {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins}m`
}

export default function SalidaPage() {
  const [searchMode, setSearchMode] = useState<"qr" | "placa">("qr")
  const [placa, setPlaca] = useState("")
  const [codigoTicket, setCodigoTicket] = useState("")
  const [descuento, setDescuento] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<SalidaResult | null>(null)
  const qrInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchMode === "qr" && qrInputRef.current) {
      qrInputRef.current.focus()
    }
  }, [searchMode])

  useEffect(() => {
    if (result && searchMode === "qr" && qrInputRef.current) {
      const timer = setTimeout(() => qrInputRef.current?.focus(), 300)
      return () => clearTimeout(timer)
    }
  }, [result, searchMode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const body: Record<string, unknown> = {
      descuento: descuento ? Number(descuento) : 0,
    }

    if (searchMode === "qr") {
      if (!codigoTicket) {
        setError("Escanee el código QR del ticket")
        return
      }
      body.codigo_ticket = codigoTicket.trim()
    } else {
      if (!placa) {
        setError("Ingresa la placa del vehículo")
        return
      }
      body.placa = placa
    }

    setError("")
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/registros/salida", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }

      setResult(data)
      setPlaca("")
      setCodigoTicket("")
      setDescuento("")
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  function handleQrKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && codigoTicket.trim()) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  function handlePlacaKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && placa.trim()) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  function handlePrint() {
    if (!result) return
    const printWindow = window.open("", "_blank", "width=400,height=600")
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head><title>Ticket de Salida</title>
        <style>
          body { font-family: monospace; text-align: center; padding: 20px; }
          h1 { font-size: 18px; }
          .line { border-top: 1px dashed #000; margin: 10px 0; }
        </style>
        </head>
        <body>
          <h1>PARKCONTROL - Ticket de Salida</h1>
          <div class="line"></div>
          <p><strong>Placa:</strong> ${result.registro.placa}</p>
          <p><strong>Duración:</strong> ${formatDuration(result.minutos_totales)}</p>
          <div class="line"></div>
          <p><strong>Total:</strong> ${formatCurrency(result.valor_final)}</p>
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
        <h1 className="text-2xl font-semibold text-foreground">Registrar Salida</h1>
        <p className="text-sm text-muted-foreground mt-1">Procese la salida del vehículo</p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">Buscar Vehículo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Tabs */}
            <Tabs
              value={searchMode}
              onValueChange={(v) => {
                setSearchMode(v as "qr" | "placa")
                setError("")
                setResult(null)
              }}
            >
              <TabsList className="w-full">
                <TabsTrigger value="qr" className="flex-1 gap-2">
                  <Scan className="h-4 w-4" />
                  QR
                </TabsTrigger>
                <TabsTrigger value="placa" className="flex-1 gap-2">
                  <Search className="h-4 w-4" />
                  Placa
                </TabsTrigger>
              </TabsList>

              <TabsContent value="qr" className="mt-4">
                <div className="space-y-3">
                  <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                    <QrCode className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Escanee el código QR del ticket</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qr-input">Código</Label>
                    <Input
                      ref={qrInputRef}
                      id="qr-input"
                      value={codigoTicket}
                      onChange={(e) => setCodigoTicket(e.target.value.trim())}
                      onKeyDown={handleQrKeyDown}
                      placeholder="Esperando escaneo..."
                      className="font-mono uppercase"
                      autoFocus
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="placa" className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="placa-salida">Placa</Label>
                  <Input
                    id="placa-salida"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                    onKeyDown={handlePlacaKeyDown}
                    placeholder="ABC123"
                    className="font-mono uppercase"
                    maxLength={7}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Discount */}
            <div className="space-y-2">
              <Label htmlFor="descuento">Descuento (opcional)</Label>
              <Input
                id="descuento"
                type="number"
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
                placeholder="0"
                min={0}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full h-11"
              disabled={loading || (searchMode === "qr" ? !codigoTicket : !placa)}
            >
              {loading ? "Procesando..." : "Procesar Salida"}
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
              Salida Registrada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Total */}
            <div className="rounded-lg bg-card p-4 border text-center">
              <p className="text-xs text-muted-foreground">Total a Cobrar</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(result.valor_final)}</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Placa</p>
                <p className="font-mono font-semibold">{result.registro.placa}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="font-medium">{result.tipo_vehiculo}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Duración</p>
                <p className="font-medium">{formatDuration(result.minutos_totales)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Entrada</p>
                <p className="font-medium">{formatTime(result.registro.fecha_hora_entrada)}</p>
              </div>
            </div>

            {/* Cost breakdown */}
            <div className="rounded-lg bg-muted/30 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(result.valor_calculado)}</span>
              </div>
              {Number(result.registro.descuento) > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Descuento</span>
                  <span>-{formatCurrency(result.registro.descuento)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Total</span>
                <span>{formatCurrency(result.valor_final)}</span>
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
