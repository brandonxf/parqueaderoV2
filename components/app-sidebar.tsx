"use client"

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
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

export function AppSidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  const links = user.rol === "Administrador"
    ? [...operarioLinks, ...adminLinks]
    : operarioLinks

  return (
    <aside className="hidden h-screen w-72 flex-col bg-gradient-to-b from-sidebar to-sidebar/95 text-sidebar-foreground md:flex">
      {/* Header with logo */}
      <div className="relative border-b border-sidebar-border/50 px-6 py-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-80" />
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
            <Car className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">ParkControl</h1>
            <p className="text-xs text-sidebar-foreground/60 font-medium">Sistema de Parqueo</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
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
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-primary/20 to-primary/5 border-l-4 border-primary text-white shadow-sm"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:translate-x-1"
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
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-primary/20 to-primary/5 border-l-4 border-primary text-white shadow-sm"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:translate-x-1"
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
      </nav>

      {/* User info */}
      <div className="border-t border-sidebar-border/50 p-4">
        <div className="mb-4 rounded-xl bg-sidebar-accent/30 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-bold text-white shadow-md">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">{user.nombre}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
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
            className="flex-1 justify-start gap-2.5 text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </aside>
  )
}
