"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Home, StickyNote, BookOpen, User, LogOut, Menu, X, Sparkles, Pencil } from "lucide-react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("dreamscape_user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("dreamscape_token")
    localStorage.removeItem("dreamscape_user")
    router.push("/")
  }

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/sketch", icon: Pencil, label: "Sketch" },
    { href: "/notes", icon: StickyNote, label: "Notes & Todos" },
    { href: "/books", icon: BookOpen, label: "Reading" },
    { href: "/profile", icon: User, label: "Profile" },
  ]

  if (pathname === "/" || pathname === "/auth") return null

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between w-full">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Sparkles className="text-purple-300" size={24} />
            <span className="text-xl font-bold text-white">DreamScape</span>
          </Link>

          {user && (
            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`text-white hover:bg-white/10 ${pathname === item.href ? "bg-white/20" : ""}`}
                  >
                    <item.icon className="mr-2" size={16} />
                    {item.label}
                  </Button>
                </Link>
              ))}
              <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-white/10">
                <LogOut className="mr-2" size={16} />
                Logout
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Sparkles className="text-purple-300" size={20} />
            <span className="text-lg font-bold text-white">DreamScape</span>
          </Link>

          {user && (
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        {isOpen && user && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md border-b border-white/20"
          >
            <div className="px-4 py-2 space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-white hover:bg-white/10 ${
                      pathname === item.href ? "bg-white/20" : ""
                    }`}
                  >
                    <item.icon className="mr-2" size={16} />
                    {item.label}
                  </Button>
                </Link>
              ))}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-white hover:bg-white/10"
              >
                <LogOut className="mr-2" size={16} />
                Logout
              </Button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-16" />
    </>
  )
}
