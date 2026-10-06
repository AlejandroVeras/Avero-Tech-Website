"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import Link from "next/link"
import {
  ShoppingCart, Laptop, Wrench, Phone, Plus, Minus,
  Trash2, Search, LayoutGrid, List, Filter, ChevronDown, ChevronUp,
  Shield, Zap, Heart, Monitor, Server, Wifi, HardDrive, Headphones,
  BarChart3, Users, Package, Ticket, Smartphone, Globe, CheckCircle2,
  MessageCircle, Mail, MapPin, Menu, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Product } from "@/lib/data/products"

// ─── Types ────────────────────────────────────────────────────────
interface StorefrontProps {
  initialProducts: Product[]
  isLoggedIn: boolean
}

interface CartItem extends Product {
  cartQuantity: number
}

const WHATSAPP_NUMBER = "18298122103"
const MONTHLY_PRICE = 15
const ANNUAL_PRICE = 150

// ─── Animated Counter ─────────────────────────────────────────────
function AnimatedCounter({ target, label, suffix = "" }: { target: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 2000
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, target])

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl md:text-5xl font-semibold text-obsidian dark:text-foreground">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-pewter mt-1">{label}</p>
    </div>
  )
}

// ─── FAQ Item ─────────────────────────────────────────────────────
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-medium text-obsidian dark:text-foreground group-hover:text-sapphire dark:group-hover:text-sky-signal transition-colors pr-4">
          {question}
        </span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-sapphire dark:text-sky-signal shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-pewter shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-pewter text-sm leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────
export function Storefront({ initialProducts, isLoggedIn }: StorefrontProps) {
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Catalog state
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Pricing toggle
  const [isAnnual, setIsAnnual] = useState(true)

  // Support form
  const [supportForm, setSupportForm] = useState({
    name: "", email: "", phone: "", problemType: "hardware", description: ""
  })

  // Helper
  function formatCurrency(amount: number, currency = "USD") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
  }

  // Cart functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i)
      return [...prev, { ...product, cartQuantity: 1 }]
    })
  }
  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, cartQuantity: Math.max(1, i.cartQuantity + delta) } : i))
  }
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id))

  const cartTotal = cart.reduce((s, i) => s + i.price * i.cartQuantity, 0)
  const cartCount = cart.reduce((s, i) => s + i.cartQuantity, 0)

  const handleCheckoutWhatsApp = () => {
    let msg = `*Hola Avero Technology*, me gustaría ordenar:\n\n`
    cart.forEach(i => { msg += `• ${i.cartQuantity}x ${i.name} — ${formatCurrency(i.price)}\n` })
    msg += `\n*Total: ${formatCurrency(cartTotal)}*\n\nQuedo atento a su respuesta.`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank")
  }

  // Filtered products
  const categories = useMemo(() => {
    const cats = new Set(initialProducts.map(p => p.category || "Otros"))
    return ["all", ...Array.from(cats)]
  }, [initialProducts])

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
      const matchCategory = categoryFilter === "all" || (p.category || "Otros") === categoryFilter
      return matchSearch && matchCategory
    })
  }, [initialProducts, searchQuery, categoryFilter])

  // Support WhatsApp
  const handleSupportWhatsApp = (e: React.FormEvent) => {
    e.preventDefault()
    const msg = `*Solicitud de Soporte Técnico*\n\n` +
      `*Nombre:* ${supportForm.name}\n` +
      `*Email:* ${supportForm.email}\n` +
      `${supportForm.phone ? `*Teléfono:* ${supportForm.phone}\n` : ""}` +
      `*Tipo:* ${supportForm.problemType}\n` +
      `*Descripción:*\n${supportForm.description}\n\n` +
      `Enviado desde averotech.com`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank")
  }

  // Nav links
  const navLinks = [
    { label: "Inicio", href: "#" },
    { label: "Catálogo", href: "#catalogo" },
    { label: "Sistemas", href: "#sistemas" },
    { label: "Soporte", href: "#soporte" },
    { label: "Contacto", href: "#contacto" },
  ]

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false)
    if (id === "#") { window.scrollTo({ top: 0, behavior: "smooth" }); return }
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" })
  }

  // ─── RENDER ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ══════════════════════════════════════════════════════════
          NAVBAR — frosted glass, 56px, no border (Apple gallery style)
      ══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => scrollTo("#")} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-obsidian dark:bg-white rounded-full flex items-center justify-center text-background dark:text-obsidian font-semibold text-sm">
              A
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-semibold text-[13px] tracking-tight text-obsidian dark:text-foreground">AVERO</span>
              <span className="text-[9px] text-pewter uppercase tracking-[0.2em] leading-none">Technology</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="px-3 py-2 text-caption font-normal text-obsidian/70 dark:text-foreground/70 hover:text-obsidian dark:hover:text-foreground transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1">
            <ThemeToggle />

            {/* Cart */}
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                  <SheetTitle>Carrito ({cartCount})</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  <AnimatePresence>
                    {cart.map(item => (
                      <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-3 p-3 border border-pale-mist/60 rounded-2xl"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-primary font-semibold text-sm">{formatCurrency(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                          <span className="w-6 text-center text-sm">{item.cartQuantity}</span>
                          <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-destructive" onClick={() => removeFromCart(item.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {cart.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>Tu carrito está vacío</p>
                    </div>
                  )}
                </div>
                {cart.length > 0 && (
                  <div className="border-t border-pale-mist/60 pt-4 space-y-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span><span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <Button className="w-full rounded-full" size="lg" onClick={handleCheckoutWhatsApp}>
                      <MessageCircle className="h-4 w-4 mr-2" /> Pedir por WhatsApp
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            <Button asChild size="sm" className="hidden sm:flex rounded-full">
              <Link href={isLoggedIn ? "/dashboard" : "/login"}>
                {isLoggedIn ? "Dashboard" : "Mi Cuenta"}
              </Link>
            </Button>

            {/* Mobile menu */}
            <Button variant="ghost" size="icon" className="md:hidden rounded-full" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-background/95 backdrop-blur-xl"
            >
              <div className="p-4 space-y-1">
                {navLinks.map(link => (
                  <button key={link.label} onClick={() => scrollTo(link.href)}
                    className="block w-full text-left px-3 py-2.5 text-body font-normal rounded-full hover:bg-muted"
                  >
                    {link.label}
                  </button>
                ))}
                <Link href={isLoggedIn ? "/dashboard" : "/login"}
                  className="block w-full text-left px-3 py-2.5 text-body font-normal text-sapphire rounded-full hover:bg-muted"
                >
                  {isLoggedIn ? "Ir al Dashboard" : "Iniciar Sesión"}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* ══════════════════════════════════════════════════════════
            HERO — centered gallery stack, no gradients/patterns
        ══════════════════════════════════════════════════════════ */}
        <section className="relative bg-background py-24 md:py-36">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-[980px] mx-auto text-center space-y-5"
            >
              <p className="text-caption font-normal uppercase tracking-[0.16em] text-pewter">
                Santo Domingo, República Dominicana
              </p>

              <h1 className="text-4xl sm:text-5xl md:text-display font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground text-balance">
                Tecnología que impulsa tu negocio
              </h1>

              <p className="text-body font-normal text-pewter max-w-xl mx-auto text-balance">
                Equipos, software y soporte IT — todo lo que necesitas para digitalizar tu empresa con confianza y garantía.
              </p>

              <div className="flex items-center justify-center gap-2 pt-3">
                <Button
                  size="lg"
                  onClick={() => scrollTo("#catalogo")}
                  className="rounded-full px-6 text-[14px] font-normal"
                >
                  Ver catálogo
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollTo("#sistemas")}
                  className="rounded-full px-6 text-[14px] font-normal border-sapphire text-sapphire bg-transparent hover:bg-sapphire/5 hover:text-sapphire dark:border-sky-signal dark:text-sky-signal"
                >
                  Ver sistemas
                </Button>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => scrollTo("#soporte")}
                  className="text-caption text-sapphire dark:text-sky-signal hover:underline underline-offset-4"
                >
                  Solicitar soporte técnico &gt;
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            CATÁLOGO — soft ice-wash band, floating product tiles
        ══════════════════════════════════════════════════════════ */}
        <section id="catalogo" className="py-20 md:py-28 bg-gradient-to-b from-ice-wash/25 via-ice-wash/10 to-background">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
              <h2 className="text-3xl md:text-heading-lg font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground">Catálogo de equipos</h2>
              <p className="text-body text-pewter mt-2 max-w-lg mx-auto">Laptops, PCs y periféricos disponibles para entrega inmediata</p>
            </motion.div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-3xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pewter" />
                <Input
                  placeholder="Buscar equipos..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full border-pale-mist bg-card"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-full border-pale-mist bg-card">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === "all" ? "Todas" : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex border border-pale-mist rounded-full overflow-hidden bg-card">
                <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("grid")} className="rounded-none">
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("list")} className="rounded-none">
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-pale-mist">
                <Package className="w-12 h-12 text-pewter/30 mx-auto mb-4" />
                <h3 className="font-medium text-lg">No se encontraron equipos</h3>
                <p className="text-pewter text-sm mt-1">
                  {searchQuery ? "Intenta con otra búsqueda" : "Pronto publicaremos nuestro inventario"}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map((product, i) => (
                  <motion.div key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="h-full flex flex-col overflow-hidden group shadow-none border-pale-mist/70 bg-card hover:border-sapphire/40 transition-colors duration-300 py-0 gap-0">
                      <div className="aspect-[4/3] bg-fog-white dark:bg-white/5 flex items-center justify-center relative">
                        <Laptop className="w-16 h-16 text-obsidian/10 dark:text-white/15 group-hover:scale-110 transition-transform" />
                        <Badge className="absolute top-3 right-3 text-[10px] rounded-full" variant={product.stockQuantity > 0 ? "default" : "destructive"}>
                          {product.stockQuantity > 0 ? "Disponible" : "Agotado"}
                        </Badge>
                      </div>
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <Badge variant="outline" className="w-fit mb-2 text-[10px] rounded-full border-pale-mist text-pewter">{product.category || "Equipos"}</Badge>
                        <h3 className="font-semibold line-clamp-2 mb-1 text-obsidian dark:text-foreground">{product.name}</h3>
                        {product.description && (
                          <p className="text-xs text-pewter line-clamp-2 mb-3">{product.description}</p>
                        )}
                        <div className="mt-auto pt-3">
                          <p className="text-xl font-semibold text-obsidian dark:text-foreground">{formatCurrency(product.price)}</p>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="flex-1 rounded-full text-[13px] font-normal" onClick={() => {
                              const msg = `Hola, me interesa el ${product.name} (${formatCurrency(product.price)})`
                              window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank")
                            }}>
                              Consultar
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-full border-sapphire text-sapphire hover:bg-sapphire/5 hover:text-sapphire dark:border-sky-signal dark:text-sky-signal" onClick={() => { addToCart(product); setIsCartOpen(true) }}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* List view */
              <div className="space-y-3">
                {filteredProducts.map(product => (
                  <Card key={product.id} className="shadow-none border-pale-mist/70 bg-card hover:border-sapphire/40 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-fog-white dark:bg-white/5 flex items-center justify-center shrink-0">
                        <Laptop className="w-8 h-8 text-obsidian/15 dark:text-white/20" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate text-obsidian dark:text-foreground">{product.name}</h3>
                        <p className="text-xs text-pewter truncate">{product.category || "Equipos"} {product.sku ? `• SKU: ${product.sku}` : ""}</p>
                      </div>
                      <Badge variant={product.stockQuantity > 0 ? "default" : "destructive"} className="hidden sm:flex shrink-0 rounded-full">
                        {product.stockQuantity > 0 ? "Disponible" : "Agotado"}
                      </Badge>
                      <p className="text-lg font-semibold text-obsidian dark:text-foreground shrink-0">{formatCurrency(product.price)}</p>
                      <Button size="sm" className="rounded-full text-[13px] font-normal" onClick={() => {
                        const msg = `Hola, me interesa el ${product.name}`
                        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank")
                      }}>
                        Consultar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SISTEMAS TECNOLÓGICOS — dark band, gallery contrast
        ══════════════════════════════════════════════════════════ */}
        <section id="sistemas" className="py-20 md:py-28 bg-obsidian text-white">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
              <p className="text-caption uppercase tracking-[0.16em] text-white/50 mb-3">Software SaaS</p>
              <h2 className="text-3xl md:text-heading-lg font-semibold tracking-[-0.02em]">Sistemas de gestión empresarial</h2>
              <p className="text-body text-white/60 mt-2 max-w-lg mx-auto">
                Digitaliza tu negocio con nuestro sistema todo-en-uno de inventario, soporte y control de clientes
              </p>
            </motion.div>

            {/* Features grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto mb-12">
              {[
                { icon: Package, label: "Gestión de Inventario" },
                { icon: Ticket, label: "Tickets de Soporte" },
                { icon: Users, label: "Control de Clientes" },
                { icon: BarChart3, label: "Reportes y Métricas" },
                { icon: Globe, label: "Acceso Web 24/7" },
                { icon: Smartphone, label: "App Móvil" },
              ].map((feat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/5 hover:border-sky-signal/40 transition-colors">
                    <div className="p-2 rounded-full text-sky-signal">
                      <feat.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[13px] font-normal text-white/90">{feat.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pricing toggle */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className={`text-[13px] font-normal ${!isAnnual ? "text-white" : "text-white/50"}`}>Mensual</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative w-12 h-7 rounded-full transition-colors ${isAnnual ? "bg-sky-signal" : "bg-white/20"}`}
              >
                <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${isAnnual ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
              <span className={`text-[13px] font-normal ${isAnnual ? "text-white" : "text-white/50"}`}>
                Anual <span className="ml-1 text-[11px] text-sky-signal">-17%</span>
              </span>
            </div>

            {/* Plan card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-md mx-auto"
            >
              <Card className="border-white/10 bg-white/[0.04] shadow-none text-white">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl font-semibold">Plan Profesional</CardTitle>
                  <p className="text-white/60 text-[13px]">Todo lo que necesitas para gestionar tu negocio</p>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <div>
                    {isAnnual && (
                      <p className="text-white/40 line-through text-lg">{formatCurrency(MONTHLY_PRICE)}/mes</p>
                    )}
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-semibold">
                        {formatCurrency(isAnnual ? ANNUAL_PRICE / 12 : MONTHLY_PRICE).replace(".00", "")}
                      </span>
                      <span className="text-white/50">/mes</span>
                    </div>
                    {isAnnual && (
                      <p className="text-[13px] text-sky-signal mt-1">
                        {formatCurrency(ANNUAL_PRICE)}/año — Ahorras 2 meses gratis
                      </p>
                    )}
                  </div>

                  <ul className="text-left space-y-3">
                    {[
                      "Inventario ilimitado de productos",
                      "Sistema de tickets de soporte",
                      "Base de clientes completa",
                      "Facturación y cotizaciones PDF",
                      "Reportes financieros",
                      "Multi-usuario por empresa",
                      "Soporte técnico prioritario",
                      "Acceso web + app móvil",
                    ].map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-[14px] text-white/85">
                        <CheckCircle2 className="h-4 w-4 text-sky-signal shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Button size="lg" className="w-full rounded-full text-[14px] font-normal bg-white text-obsidian hover:bg-white/90" asChild>
                    <Link href="/pricing">
                      Comenzar ahora
                    </Link>
                  </Button>
                  <p className="text-xs text-white/40">Cancela cuando quieras. Sin contratos.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SOPORTE TÉCNICO
        ══════════════════════════════════════════════════════════ */}
        <section id="soporte" className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl md:text-heading-lg font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground">Soporte técnico IT</h2>
              <p className="text-body text-pewter mt-2">Diagnóstico, reparación y consultoría tecnológica profesional</p>
            </motion.div>

            {/* Service cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
              {[
                { icon: Monitor, title: "Reparación", desc: "Hardware y software" },
                { icon: Shield, title: "Mantenimiento", desc: "Preventivo y correctivo" },
                { icon: Wifi, title: "Redes", desc: "Instalación y config" },
                { icon: Server, title: "Servidores", desc: "Setup y administración" },
                { icon: HardDrive, title: "Diagnóstico", desc: "Análisis completo" },
                { icon: Headphones, title: "Consultoría", desc: "Asesoría IT empresarial" },
              ].map((svc, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <Card className="text-center h-full shadow-none border-pale-mist/70 bg-card hover:border-sapphire/40 transition-colors">
                    <CardContent className="p-5 space-y-2">
                      <div className="w-10 h-10 mx-auto rounded-full bg-fog-white dark:bg-white/5 flex items-center justify-center text-sapphire dark:text-sky-signal">
                        <svc.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-sm text-obsidian dark:text-foreground">{svc.title}</h3>
                      <p className="text-xs text-pewter">{svc.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Support form */}
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-none border-pale-mist/70 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-obsidian dark:text-foreground font-semibold">
                    <Wrench className="h-5 w-5 text-sapphire dark:text-sky-signal" />
                    Solicitar soporte técnico
                  </CardTitle>
                  <p className="text-[13px] text-pewter">Completa el formulario y recibirás respuesta por WhatsApp en menos de 2 horas</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSupportWhatsApp} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sName">Nombre completo *</Label>
                        <Input id="sName" required value={supportForm.name}
                          onChange={e => setSupportForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="Juan Pérez"
                          className="rounded-full border-pale-mist"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sEmail">Correo electrónico *</Label>
                        <Input id="sEmail" type="email" required value={supportForm.email}
                          onChange={e => setSupportForm(p => ({ ...p, email: e.target.value }))}
                          placeholder="tu@email.com"
                          className="rounded-full border-pale-mist"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sPhone">Teléfono (opcional)</Label>
                        <Input id="sPhone" value={supportForm.phone}
                          onChange={e => setSupportForm(p => ({ ...p, phone: e.target.value }))}
                          placeholder="829-000-0000"
                          className="rounded-full border-pale-mist"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sType">Tipo de problema *</Label>
                        <Select value={supportForm.problemType} onValueChange={(val: any) => setSupportForm(p => ({ ...p, problemType: val }))}>
                          <SelectTrigger id="sType" className="rounded-full border-pale-mist"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hardware">Falla de Hardware</SelectItem>
                            <SelectItem value="software">Problema de Software</SelectItem>
                            <SelectItem value="network">Red / Internet</SelectItem>
                            <SelectItem value="server">Servidor</SelectItem>
                            <SelectItem value="security">Seguridad / Virus</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sDesc">Descripción del problema *</Label>
                      <Textarea id="sDesc" required rows={4} value={supportForm.description}
                        onChange={e => setSupportForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Mi laptop no enciende, se queda en pantalla negra..."
                        className="resize-none rounded-2xl border-pale-mist"
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full rounded-full text-[14px] font-normal">
                      Enviar por WhatsApp
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            CONFIANZA / NOSOTROS
        ══════════════════════════════════════════════════════════ */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl md:text-heading-lg font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground">¿Por qué Avero Technology?</h2>
              <p className="text-body text-pewter mt-2 max-w-lg mx-auto">
                Más que una empresa de tecnología — somos tu aliado digital de confianza en Santo Domingo
              </p>
            </motion.div>

            {/* Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
              {[
                { icon: Zap, title: "Rapidez", desc: "Respuesta en menos de 2 horas. Equipos listos para entregar el mismo día." },
                { icon: Heart, title: "Honestidad", desc: "Precios transparentes, sin letras pequeñas. Tecnología que funciona desde el día 1." },
                { icon: Shield, title: "Garantía", desc: "Todos nuestros equipos y servicios incluyen garantía completa." },
              ].map((val, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Card className="h-full text-center shadow-none border-pale-mist/70 bg-card">
                    <CardContent className="p-6 space-y-4">
                      <div className="w-12 h-12 mx-auto rounded-full bg-fog-white dark:bg-white/5 flex items-center justify-center text-sapphire dark:text-sky-signal">
                        <val.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-obsidian dark:text-foreground">{val.title}</h3>
                      <p className="text-sm text-pewter">{val.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Counters */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <AnimatedCounter target={500} label="Equipos Vendidos" suffix="+" />
              <AnimatedCounter target={200} label="Clientes Satisfechos" suffix="+" />
              <AnimatedCounter target={1500} label="Tickets Resueltos" suffix="+" />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════════════════════ */}
        <section id="faq" className="py-20 md:py-28 bg-gradient-to-b from-fog-white to-background">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl md:text-heading-lg font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground">Preguntas frecuentes</h2>
            </motion.div>

            <div className="max-w-2xl mx-auto bg-card rounded-3xl border border-pale-mist/70 p-6">
              <FaqItem
                question="¿Los equipos tienen garantía?"
                answer="Sí. Todos nuestros equipos nuevos y reacondicionados incluyen garantía. El período varía según el producto — consulta los detalles al momento de la compra."
              />
              <FaqItem
                question="¿Cómo funciona el sistema de gestión?"
                answer="Es una plataforma web (SaaS) a la que accedes desde cualquier navegador. Incluye inventario, tickets de soporte, clientes, facturación y reportes. Pagas una suscripción mensual o anual."
              />
              <FaqItem
                question="¿Puedo cancelar mi suscripción en cualquier momento?"
                answer="Sí, puedes cancelar cuando quieras desde tu panel de cuenta. No hay contratos de permanencia ni penalizaciones."
              />
              <FaqItem
                question="¿Ofrecen soporte técnico remoto?"
                answer="Sí. Podemos diagnosticar y resolver muchos problemas de forma remota. Si requiere intervención física, coordinamos una visita."
              />
              <FaqItem
                question="¿Hacen envíos a todo el país?"
                answer="Actualmente operamos en Santo Domingo y alrededores. Para otras provincias, contáctanos por WhatsApp para coordinar el envío."
              />
              <FaqItem
                question="¿Aceptan pagos con tarjeta?"
                answer="Sí. Para equipos puedes pagar con transferencia o efectivo. Para las suscripciones del sistema aceptamos tarjetas de crédito/débito internacionales vía Stripe."
              />
              <FaqItem
                question="¿El sistema incluye app móvil?"
                answer="Sí, el plan incluye acceso desde la app móvil para iOS y Android, con las mismas funcionalidades que la versión web."
              />
              <FaqItem
                question="¿Qué pasa si mi suscripción vence?"
                answer="Tu cuenta se desactiva temporalmente pero tus datos se conservan. Al renovar, todo vuelve a estar disponible exactamente como lo dejaste."
              />
            </div>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════════════
          FOOTER — dense link grid, hairline divider, no card chrome
      ══════════════════════════════════════════════════════════ */}
      <footer id="contacto" className="bg-fog-white dark:bg-white/[0.03] py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-obsidian dark:bg-white rounded-full flex items-center justify-center text-background dark:text-obsidian font-semibold">A</div>
                <div>
                  <span className="font-semibold text-sm text-obsidian dark:text-foreground">AVERO</span>
                  <span className="text-[9px] text-pewter uppercase tracking-widest ml-1">Technology</span>
                </div>
              </div>
              <p className="text-caption text-pewter">
                Tecnología clara, honesta y funcional, lista para trabajar desde el primer día.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-caption text-obsidian dark:text-foreground mb-3">Navegación</h4>
              <ul className="space-y-2 text-caption text-pewter">
                {navLinks.map(l => (
                  <li key={l.label}><button onClick={() => scrollTo(l.href)} className="hover:text-obsidian dark:hover:text-foreground transition-colors">{l.label}</button></li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold text-caption text-obsidian dark:text-foreground mb-3">Servicios</h4>
              <ul className="space-y-2 text-caption text-pewter">
                <li>Venta de Equipos</li>
                <li>Sistemas de Gestión</li>
                <li>Soporte Técnico</li>
                <li>Consultoría IT</li>
                <li>Redes y Servidores</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-caption text-obsidian dark:text-foreground mb-3">Contacto</h4>
              <ul className="space-y-2.5 text-caption text-pewter">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Santo Domingo, República Dominicana</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <a href="https://wa.me/18298122103" target="_blank" rel="noopener" className="hover:text-obsidian dark:hover:text-foreground transition-colors">(829)-812-2103</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>info@averotech.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-pale-mist mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-pewter">&copy; {new Date().getFullYear()} Avero Technology. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <Link href={isLoggedIn ? "/dashboard" : "/login"} className="text-[11px] text-sapphire dark:text-sky-signal hover:underline underline-offset-4">
                {isLoggedIn ? "Dashboard" : "Iniciar Sesión"}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
