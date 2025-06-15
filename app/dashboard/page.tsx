"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Eye, Trash2, Copy, Download, CheckSquare, BookOpen, StickyNote } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Board {
  id: string
  title: string
  theme: string
  createdAt: string
  thumbnail: string
  elements: any[]
}

export default function Dashboard() {
  const [boards, setBoards] = useState<Board[]>([])
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const [notes, setNotes] = useState<any[]>([])
  const [todos, setTodos] = useState<any[]>([])
  const [books, setBooks] = useState<any[]>([])

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("dreamscape_token")
    const userData = localStorage.getItem("dreamscape_user")

    if (!token || !userData) {
      router.push("/auth")
      return
    }

    setUser(JSON.parse(userData))

    // Load all data for stats
    const notesData = JSON.parse(localStorage.getItem("dreamscape_notes") || "[]")
    const todosData = JSON.parse(localStorage.getItem("dreamscape_todos") || "[]")
    const booksData = JSON.parse(localStorage.getItem("dreamscape_books") || "[]")

    setNotes(notesData)
    setTodos(todosData)
    setBooks(booksData)
  }, [router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Your Dream Gallery</h1>
              <p className="text-purple-200 mt-1">Welcome back, {user.name}!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4 text-center">
              <StickyNote className="mx-auto text-purple-300 mb-2" size={24} />
              <div className="text-2xl font-bold text-white">{notes.length}</div>
              <div className="text-purple-200 text-sm">Notes</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4 text-center">
              <CheckSquare className="mx-auto text-purple-300 mb-2" size={24} />
              <div className="text-2xl font-bold text-white">{todos.filter((t) => !t.completed).length}</div>
              <div className="text-purple-200 text-sm">Active Todos</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4 text-center">
              <BookOpen className="mx-auto text-purple-300 mb-2" size={24} />
              <div className="text-2xl font-bold text-white">{books.length}</div>
              <div className="text-purple-200 text-sm">Books</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
