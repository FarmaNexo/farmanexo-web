"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useFarmaNexoStore } from "@/lib/farmanexo-store"
import { useAuthStore, initializeAuth } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrdersModal } from "@/components/orders-modal"
import ProfileModal from "@/components/profile-modal"
import { LocationModal } from "@/components/location-modal"
import { MapPin, Heart, ShoppingBag, Menu, User, Home, Search, Pill, LogIn, LogOut, UserPlus } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [showOrdersModal, setShowOrdersModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Auth state
  const { user, isAuthenticated, logout } = useAuthStore()

  // App state
  const shoppingList = useFarmaNexoStore((state) => state.shoppingList)
  const favorites = useFarmaNexoStore((state) => state.favorites)
  const userLocation = useFarmaNexoStore((state) => state.userLocation)

  useEffect(() => {
    setMounted(true)
    // Inicializar auth desde localStorage
    initializeAuth()
  }, [])

  const ordersCount = useMemo(() => {
    if (!mounted) return 0
    return shoppingList.reduce((count, item) => count + item.quantity, 0)
  }, [mounted, shoppingList])

  const favoriteCount = useMemo(() => {
    if (!mounted) return 0
    return favorites.length
  }, [mounted, favorites])

  const locationText = useMemo(() => {
    if (!mounted || !userLocation?.address) return "Lima, Perú"
    return userLocation.address
  }, [mounted, userLocation])

  const handleMobileAction = (action: () => void) => {
    setMobileMenuOpen(false)
    action()
  }

  const navigateToHome = () => {
    router.push("/")
    setMobileMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
    setMobileMenuOpen(false)
  }

  const isActive = (path: string) => pathname === path

  const handleAuthRequired = (action: () => void) => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    action()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={navigateToHome}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#db1a85] text-white">
            <Pill className="size-4" />
          </div>
          <span className="hidden font-bold sm:inline-block text-[#db1a85]">
            FarmaNexo
          </span>
        </button>

        {/* Desktop Navigation - Siempre visible */}
        <nav className="hidden md:flex items-center gap-1">
          <Button variant={isActive("/") ? "secondary" : "ghost"} size="sm" onClick={navigateToHome} className="gap-2">
            <Home className="size-4" />
            Inicio
          </Button>
          <Button variant={isActive("/catalogo") ? "secondary" : "ghost"} size="sm" asChild>
            <Link href="/catalogo" className="gap-2">
              <Pill className="size-4" />
              Catálogo
            </Link>
          </Button>
          <Button variant={isActive("/buscar") ? "secondary" : "ghost"} size="sm" asChild>
            <Link href="/buscar" className="gap-2">
              <Search className="size-4" />
              Buscar
            </Link>
          </Button>
        </nav>

        {/* Location and Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Location - Siempre visible */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex items-center gap-1 max-w-40"
            onClick={() => setShowLocationModal(true)}
          >
            <MapPin className="h-4 w-4 text-[#db1a85] shrink-0" />
            <span className="text-sm truncate">{locationText}</span>
          </Button>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1">
            <ModeToggle />

            {isAuthenticated ? (
              <>
                {/* Favoritos - Solo si está logueado */}
                <Button variant="ghost" size="sm" className="relative" onClick={() => setShowProfileModal(true)}>
                  <Heart className="h-4 w-4" />
                  <span className="hidden lg:inline ml-1">Favoritos</span>
                  {favoriteCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-[#db1a85] border-[#db1a85]"
                    >
                      {favoriteCount}
                    </Badge>
                  )}
                </Button>

                {/* Mis Órdenes - Solo si está logueado */}
                <Button variant="ghost" size="sm" className="relative" onClick={() => setShowOrdersModal(true)}>
                  <ShoppingBag className="h-4 w-4" />
                  <span className="hidden lg:inline ml-1">Mis Órdenes</span>
                  {ordersCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-brand-coral hover:bg-brand-coral/90"
                    >
                      {ordersCount}
                    </Badge>
                  )}
                </Button>

                {/* Menú de usuario */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <div className="h-6 w-6 rounded-full bg-[#db1a85] flex items-center justify-center text-white text-xs font-medium">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <span className="hidden lg:inline max-w-24 truncate">{user?.name?.split(" ")[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                      <User className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowOrdersModal(true)}>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Mis Órdenes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                      <Heart className="mr-2 h-4 w-4" />
                      Favoritos
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden lg:inline">Iniciar sesión</span>
                  </Link>
                </Button>
                <Button size="sm" className="bg-[#db1a85] hover:bg-[#b8146f] text-white" asChild>
                  <Link href="/registro" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden lg:inline">Registrarse</span>
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden relative px-2">
                <Menu className="h-5 w-5" />
                {isAuthenticated && (ordersCount > 0 || favoriteCount > 0) && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-[#db1a85]"
                  >
                    {ordersCount + favoriteCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="grid gap-6 py-6">
                {isAuthenticated ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-10 w-10 rounded-full bg-[#db1a85] flex items-center justify-center text-white font-medium">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Button
                      className="w-full bg-[#db1a85] hover:bg-[#b8146f] text-white"
                      onClick={() => handleMobileAction(() => router.push("/login"))}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Iniciar sesión
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-[#db1a85] text-[#db1a85]"
                      onClick={() => handleMobileAction(() => router.push("/registro"))}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Crear cuenta
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-medium">Tema</span>
                  <ModeToggle />
                </div>

                {/* Navegación pública */}
                <div className="grid gap-2">
                  <h2 className="text-lg font-semibold">Navegación</h2>
                  <Button
                    variant={isActive("/") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={navigateToHome}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Inicio
                  </Button>
                  <Button
                    variant={isActive("/catalogo") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/catalogo">
                      <Pill className="mr-2 h-4 w-4" />
                      Catálogo
                    </Link>
                  </Button>
                  <Button
                    variant={isActive("/buscar") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/buscar">
                      <Search className="mr-2 h-4 w-4" />
                      Buscar
                    </Link>
                  </Button>
                </div>

                {isAuthenticated && (
                  <div className="grid gap-2">
                    <h2 className="text-lg font-semibold">Mi Cuenta</h2>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleMobileAction(() => setShowProfileModal(true))}
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Favoritos {favoriteCount > 0 && `(${favoriteCount})`}
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleMobileAction(() => setShowOrdersModal(true))}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Mis Órdenes {ordersCount > 0 && `(${ordersCount})`}
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleMobileAction(() => setShowProfileModal(true))}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </Button>
                  </div>
                )}

                {/* Ubicación - Siempre visible */}
                <div className="grid gap-2">
                  <h2 className="text-lg font-semibold">Ubicación</h2>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleMobileAction(() => setShowLocationModal(true))}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    <span className="truncate">{locationText}</span>
                  </Button>
                </div>

                {isAuthenticated && (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Modales - Solo renderizar si está autenticado */}
      {isAuthenticated && (
        <>
          <OrdersModal isOpen={showOrdersModal} onClose={() => setShowOrdersModal(false)} />
          <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
        </>
      )}
      <LocationModal isOpen={showLocationModal} onClose={() => setShowLocationModal(false)} />
    </header>
  )
}

