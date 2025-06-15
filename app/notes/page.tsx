"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Check, Calendar, Search, Star, Clock } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
  isPinned: boolean
  color: string
}

interface Todo {
  id: string
  title: string
  description: string
  completed: boolean
  priority: "low" | "medium" | "high"
  dueDate?: string
  createdAt: string
  tags: string[]
}

const noteColors = ["#FFE4E1", "#E6E6FA", "#F0FFFF", "#F5FFFA", "#FFF8DC", "#FFE4B5", "#E0FFFF", "#F0F8FF"]

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [isTodoDialogOpen, setIsTodoDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  useEffect(() => {
    // Load saved notes and todos
    const savedNotes = localStorage.getItem("dreamscape_notes")
    const savedTodos = localStorage.getItem("dreamscape_todos")

    if (savedNotes) setNotes(JSON.parse(savedNotes))
    if (savedTodos) setTodos(JSON.parse(savedTodos))
  }, [])

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes)
    localStorage.setItem("dreamscape_notes", JSON.stringify(updatedNotes))
  }

  const saveTodos = (updatedTodos: Todo[]) => {
    setTodos(updatedTodos)
    localStorage.setItem("dreamscape_todos", JSON.stringify(updatedTodos))
  }

  const createNote = (noteData: Partial<Note>) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: noteData.title || "Untitled Note",
      content: noteData.content || "",
      tags: noteData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      color: noteColors[Math.floor(Math.random() * noteColors.length)],
      ...noteData,
    }
    saveNotes([...notes, newNote])
    setIsNoteDialogOpen(false)
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note,
    )
    saveNotes(updatedNotes)
    setEditingNote(null)
    setIsNoteDialogOpen(false)
  }

  const deleteNote = (id: string) => {
    saveNotes(notes.filter((note) => note.id !== id))
  }

  const createTodo = (todoData: Partial<Todo>) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: todoData.title || "New Todo",
      description: todoData.description || "",
      completed: false,
      priority: todoData.priority || "medium",
      createdAt: new Date().toISOString(),
      tags: todoData.tags || [],
      ...todoData,
    }
    saveTodos([...todos, newTodo])
    setIsTodoDialogOpen(false)
  }

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    const updatedTodos = todos.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo))
    saveTodos(updatedTodos)
    setEditingTodo(null)
    setIsTodoDialogOpen(false)
  }

  const deleteTodo = (id: string) => {
    saveTodos(todos.filter((todo) => todo.id !== id))
  }

  const toggleTodo = (id: string) => {
    updateTodo(id, { completed: !todos.find((t) => t.id === id)?.completed })
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = !selectedTag || note.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch =
      todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = !selectedTag || todo.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const allTags = [...new Set([...notes.flatMap((n) => n.tags), ...todos.flatMap((t) => t.tags)])]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Notes & Todos</h1>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-200" size={16} />
                <Input
                  placeholder="Search notes and todos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                />
              </div>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white"
              >
                <option value="">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag} className="text-black">
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 mb-6">
            <TabsTrigger value="notes" className="text-white data-[state=active]:bg-purple-500">
              Notes ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="todos" className="text-white data-[state=active]:bg-purple-500">
              Todos ({todos.filter((t) => !t.completed).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">My Notes</h2>
              <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Plus className="mr-2" size={16} />
                    New Note
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>{editingNote ? "Edit Note" : "Create New Note"}</DialogTitle>
                  </DialogHeader>
                  <NoteForm
                    note={editingNote}
                    onSave={(noteData) => {
                      if (editingNote) {
                        updateNote(editingNote.id, noteData)
                      } else {
                        createNote(noteData)
                      }
                    }}
                    onCancel={() => {
                      setEditingNote(null)
                      setIsNoteDialogOpen(false)
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="h-full cursor-pointer hover:shadow-lg transition-all duration-300 border-white/20"
                    style={{ backgroundColor: note.color + "20" }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-white text-lg line-clamp-2">{note.title}</CardTitle>
                        <div className="flex gap-1">
                          {note.isPinned && <Star className="text-yellow-400" size={16} />}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingNote(note)
                              setIsNoteDialogOpen(true)
                            }}
                            className="text-white hover:bg-white/10 p-1"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNote(note.id)}
                            className="text-red-400 hover:bg-red-500/20 p-1"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-purple-100 text-sm line-clamp-4 mb-3">{note.content}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {note.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center text-xs text-purple-200">
                        <Clock size={12} className="mr-1" />
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="todos">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">My Todos</h2>
              <Dialog open={isTodoDialogOpen} onOpenChange={setIsTodoDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Plus className="mr-2" size={16} />
                    New Todo
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>{editingTodo ? "Edit Todo" : "Create New Todo"}</DialogTitle>
                  </DialogHeader>
                  <TodoForm
                    todo={editingTodo}
                    onSave={(todoData) => {
                      if (editingTodo) {
                        updateTodo(editingTodo.id, todoData)
                      } else {
                        createTodo(todoData)
                      }
                    }}
                    onCancel={() => {
                      setEditingTodo(null)
                      setIsTodoDialogOpen(false)
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {filteredTodos.map((todo, index) => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`bg-white/10 border-white/20 ${todo.completed ? "opacity-60" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleTodo(todo.id)}
                          className={`mt-1 p-1 ${todo.completed ? "text-green-400" : "text-white"}`}
                        >
                          {todo.completed ? (
                            <Check size={16} />
                          ) : (
                            <div className="w-4 h-4 border border-white/40 rounded" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <h3 className={`text-white font-semibold ${todo.completed ? "line-through" : ""}`}>
                            {todo.title}
                          </h3>
                          {todo.description && <p className="text-purple-200 text-sm mt-1">{todo.description}</p>}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant={
                                todo.priority === "high"
                                  ? "destructive"
                                  : todo.priority === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {todo.priority}
                            </Badge>
                            {todo.dueDate && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar size={10} className="mr-1" />
                                {new Date(todo.dueDate).toLocaleDateString()}
                              </Badge>
                            )}
                            {todo.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingTodo(todo)
                              setIsTodoDialogOpen(true)
                            }}
                            className="text-white hover:bg-white/10 p-1"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTodo(todo.id)}
                            className="text-red-400 hover:bg-red-500/20 p-1"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function NoteForm({
  note,
  onSave,
  onCancel,
}: {
  note: Note | null
  onSave: (data: Partial<Note>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(note?.title || "")
  const [content, setContent] = useState(note?.content || "")
  const [tags, setTags] = useState(note?.tags.join(", ") || "")

  const handleSave = () => {
    onSave({
      title,
      content,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    })
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Note title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-white/10 border-white/20 text-white"
      />
      <Textarea
        placeholder="Write your note here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        className="bg-white/10 border-white/20 text-white"
      />
      <Input
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="bg-white/10 border-white/20 text-white"
      />
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-purple-500 hover:bg-purple-600">
          {note ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  )
}

function TodoForm({
  todo,
  onSave,
  onCancel,
}: {
  todo: Todo | null
  onSave: (data: Partial<Todo>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(todo?.title || "")
  const [description, setDescription] = useState(todo?.description || "")
  const [priority, setPriority] = useState(todo?.priority || "medium")
  const [dueDate, setDueDate] = useState(todo?.dueDate || "")
  const [tags, setTags] = useState(todo?.tags.join(", ") || "")

  const handleSave = () => {
    onSave({
      title,
      description,
      priority: priority as "low" | "medium" | "high",
      dueDate: dueDate || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    })
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Todo title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-white/10 border-white/20 text-white"
      />
      <Textarea
        placeholder="Description (optional)..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="bg-white/10 border-white/20 text-white"
      />
      <div className="grid grid-cols-2 gap-4">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white"
        >
          <option value="low" className="text-black">
            Low Priority
          </option>
          <option value="medium" className="text-black">
            Medium Priority
          </option>
          <option value="high" className="text-black">
            High Priority
          </option>
        </select>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>
      <Input
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="bg-white/10 border-white/20 text-white"
      />
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-purple-500 hover:bg-purple-600">
          {todo ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  )
}
