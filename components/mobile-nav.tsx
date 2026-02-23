"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Car,
  LayoutDashboard,
  LogIn,
  LogOut,
  DollarSign,
  Users,
  BarChart3,
  ParkingSquare,
  Menu,
  Shield,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"

interface User {
  id: number
  nombre: string
  email: string
  rol: string
}

const operarioLinks = [
  { href: "/dashboard", label: "Panel Principal", icon: LayoutDashboard },
  { href: "/dashboard/entrada", label: "Entrada de Vehículos", icon: LogIn },
  { href: "/dashboard/salida", label: "Salida de Vehículos", icon: LogOut },
  { href: "/dashboard/espacios", label: "Gestión de Espacios", icon: ParkingSquare },
]

const adminLinks = [
  { href: "/dashboard/tarifas", label: "Configuración de Tarifas", icon: DollarSign },
  { href: "/dashboard/usuarios", label: "Gestión de Usuarios", icon: Users },
  { href: "/dashboard/reportes", label: "Reportes y Estadísticas", icon: BarChart3 },
]

export function MobileNav({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  const links = user.rol === "Administrador"
    ? [...operarioLinks, ...adminLinks]
    : operarioLinks

  const NavLinks = () => (
    <>
      {/* Operations Section */}
      <div className="mb-6">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
          Operaciones
        </p>
        <ul className="flex flex-col gap-1.5">
          {operarioLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary/20 to-primary/5 border-l-4 border-primary text-white shadow-sm"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <span className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                    isActive 
                      ? "bg-primary text-white" 
                      : "bg-sidebar-accent/50 text-sidebar-foreground/70 group-hover:bg-primary/20 group-hover:text-primary"
                  )}>
                    <link.icon className="h-4 w-4" />
                  </span>
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Admin Section */}
      {user.rol === "Administrador" && (
        <div className="mb-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Administración
          </p>
          <ul className="flex flex-col gap-1.5">
            {adminLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-primary/20 to-primary/5 border-l-4 border-primary text-white shadow-sm"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <span className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                      isActive 
                        ? "bg-primary text-white" 
                        : "bg-sidebar-accent/50 text-sidebar-foreground/70 group-hover:bg-primary/20 group-hover:text-primary"
                    )}>
                      <link.icon className="h-4 w-4" />
                    </span>
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </>
  )

  return (
    <div className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 text-foreground md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-foreground">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-gradient-to-b from-sidebar to-sidebar/95 p-0 text-sidebar-foreground border-r-0">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="relative border-b border-sidebar-border/50 px-5 py-5">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-80" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white">ParkControl</h1>
                  <p className="text-xs text-sidebar-foreground/60">Sistema de Parqueo</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <NavLinks />
            </nav>

            {/* User info */}
            <div className="border-t border-sidebar-border/50 p-4">
              <div className="mb-3 rounded-xl bg-sidebar-accent/30 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
                    {user.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-sidebar-foreground">{user.nombre}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Shield className="h-3 w-3 text-accent" />
                      <p className="truncate text-xs text-sidebar-foreground/60">{user.rol}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  className="flex-1 justify-start gap-2 text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    setOpen(false)
                    handleLogout()
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
          <Car className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold">ParkControl</span>
      </div>

      {/* User Avatar */}
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
        {user.nombre.charAt(0).toUpperCase()}
      </div>
    </div>
  )
}
