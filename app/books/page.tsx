"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Plus, Search, Star, Clock, StickyNote } from "lucide-react"
import Link from "next/link"

interface Book {
  id: string
  title: string
  author: string
  content: string
  coverUrl: string
  addedAt: string
  lastRead?: string
  progress: number
  totalPages: number
  currentPage: number
  genre: string
  rating?: number
  notes: BookNote[]
  highlights: Highlight[]
}

interface BookNote {
  id: string
  content: string
  pageNumber: number
  createdAt: string
  color: string
}

interface Highlight {
  id: string
  text: string
  pageNumber: number
  color: string
  note?: string
  createdAt: string
}

const sampleBooks: Book[] = [
  {
    id: "1",
    title: "The Art of Creative Thinking",
    author: "Jane Smith",
    content: `Chapter 1: Introduction to Creative Thinking

Creative thinking is the ability to consider something in a new way. It might be a new approach to a problem, a resolution to a conflict between employees, or a new result from a data set.

Creative thinking involves:
- Looking at things from different perspectives
- Challenging assumptions
- Thinking outside conventional boundaries
- Finding innovative solutions

The creative process often involves several stages:
1. Preparation - gathering information and resources
2. Incubation - letting ideas develop subconsciously  
3. Illumination - the "aha!" moment when solutions emerge
4. Verification - testing and refining ideas

Creative thinking is not just for artists and designers. It's a valuable skill in every field, from business and science to education and technology. By developing your creative thinking abilities, you can become more innovative, solve problems more effectively, and find new opportunities.

Chapter 2: Techniques for Enhanced Creativity

There are many techniques you can use to boost your creative thinking:

Brainstorming: Generate as many ideas as possible without judgment. The goal is quantity, not quality initially.

Mind Mapping: Create visual representations of ideas and their connections. This helps you see relationships and patterns.

SCAMPER Method: A checklist of idea-spurring questions:
- Substitute: What can be substituted?
- Combine: What can be combined?
- Adapt: What can be adapted?
- Modify: What can be modified?
- Put to other uses: How can this be used differently?
- Eliminate: What can be removed?
- Reverse: What can be reversed or rearranged?

The key to creative thinking is practice. The more you exercise your creative muscles, the stronger they become.`,
    coverUrl: "/placeholder.svg?height=300&width=200",
    addedAt: "2024-01-15",
    lastRead: "2024-01-20",
    progress: 45,
    totalPages: 200,
    currentPage: 90,
    genre: "Self-Help",
    rating: 4,
    notes: [],
    highlights: [],
  },
  {
    id: "2",
    title: "Digital Minimalism",
    author: "Cal Newport",
    content: `Introduction: Digital Minimalism

In recent years, something has gone wrong with how we interact with our devices and digital services. What was once a helpful tool has become a source of constant distraction and anxiety.

Digital minimalism is a philosophy of technology use in which you focus your online time on a small number of carefully selected and optimized activities that strongly support things you value, and then give everything else the boot.

This approach requires you to be much more intentional about the technologies you allow into your life. Instead of accepting whatever new digital tool or service comes along, you carefully consider whether it truly adds value to your life.

The core principles of digital minimalism are:

1. Clutter is costly - Digital clutter is stressful and overwhelming
2. Optimization matters - How you use technology is more important than what technology you use  
3. Intentionality is satisfying - Being deliberate about technology use leads to greater satisfaction

Chapter 1: A Lopsided Arms Race

The technologies that define our current moment are not neutral tools, waiting passively to be put to good use. They're products that have been carefully engineered to be as addictive as possible.

Tech companies employ teams of neuroscientists, behavioral economists, and data scientists to make their products irresistible. They use techniques like:

- Variable ratio reinforcement schedules (like slot machines)
- Social approval feedback loops  
- Fear of missing out (FOMO)
- Attention residue effects

Understanding these manipulation techniques is the first step toward reclaiming control over your digital life.`,
    coverUrl: "/placeholder.svg?height=300&width=200",
    addedAt: "2024-01-10",
    progress: 20,
    totalPages: 280,
    currentPage: 56,
    genre: "Technology",
    notes: [],
    highlights: [],
  },
]

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>(sampleBooks)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("")
  const [isAddBookOpen, setIsAddBookOpen] = useState(false)

  useEffect(() => {
    const savedBooks = localStorage.getItem("dreamscape_books")
    if (savedBooks) {
      setBooks(JSON.parse(savedBooks))
    } else {
      localStorage.setItem("dreamscape_books", JSON.stringify(sampleBooks))
    }
  }, [])

  const saveBooks = (updatedBooks: Book[]) => {
    setBooks(updatedBooks)
    localStorage.setItem("dreamscape_books", JSON.stringify(updatedBooks))
  }

  const addBook = (bookData: Partial<Book>) => {
    const newBook: Book = {
      id: Date.now().toString(),
      title: bookData.title || "Untitled Book",
      author: bookData.author || "Unknown Author",
      content: bookData.content || "",
      coverUrl: bookData.coverUrl || "/placeholder.svg?height=300&width=200",
      addedAt: new Date().toISOString(),
      progress: 0,
      totalPages: 100,
      currentPage: 0,
      genre: bookData.genre || "General",
      notes: [],
      highlights: [],
      ...bookData,
    }
    saveBooks([...books, newBook])
    setIsAddBookOpen(false)
  }

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGenre = !selectedGenre || book.genre === selectedGenre
    return matchesSearch && matchesGenre
  })

  const genres = [...new Set(books.map((book) => book.genre))]
  const recentBooks = books
    .filter((book) => book.lastRead)
    .sort((a, b) => new Date(b.lastRead!).getTime() - new Date(a.lastRead!).getTime())
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">My Library</h1>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-200" size={16} />
                <Input
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                />
              </div>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white"
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre} className="text-black">
                    {genre}
                  </option>
                ))}
              </select>
            </div>
            <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <Plus className="mr-2" size={16} />
                  Add Book
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>Add New Book</DialogTitle>
                </DialogHeader>
                <AddBookForm onSave={addBook} onCancel={() => setIsAddBookOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 mb-6">
            <TabsTrigger value="library" className="text-white data-[state=active]:bg-purple-500">
              Library ({books.length})
            </TabsTrigger>
            <TabsTrigger value="reading" className="text-white data-[state=active]:bg-purple-500">
              Currently Reading
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-white data-[state=active]:bg-purple-500">
              Notes & Highlights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library">
            {/* Recently Read */}
            {recentBooks.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Continue Reading</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentBooks.map((book) => (
                    <Card key={book.id} className="bg-white/10 border-white/20">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <img
                            src={book.coverUrl || "/placeholder.svg"}
                            alt={book.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-sm line-clamp-2">{book.title}</h3>
                            <p className="text-purple-200 text-xs">{book.author}</p>
                            <div className="mt-2">
                              <div className="w-full bg-white/20 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                  style={{ width: `${book.progress}%` }}
                                />
                              </div>
                              <p className="text-xs text-purple-200 mt-1">{book.progress}% complete</p>
                            </div>
                            <Link href={`/books/${book.id}`}>
                              <Button size="sm" className="mt-2 bg-purple-500 hover:bg-purple-600">
                                Continue Reading
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Books */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
                    <CardHeader className="pb-2">
                      <div className="aspect-[3/4] mb-3">
                        <img
                          src={book.coverUrl || "/placeholder.svg"}
                          alt={book.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <CardTitle className="text-white text-lg line-clamp-2">{book.title}</CardTitle>
                      <p className="text-purple-200 text-sm">{book.author}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {book.genre}
                          </Badge>
                          {book.rating && (
                            <div className="flex items-center">
                              <Star className="text-yellow-400 fill-current" size={14} />
                              <span className="text-white text-sm ml-1">{book.rating}</span>
                            </div>
                          )}
                        </div>

                        {book.progress > 0 && (
                          <div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                style={{ width: `${book.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-purple-200 mt-1">{book.progress}% complete</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Link href={`/books/${book.id}`} className="flex-1">
                            <Button size="sm" className="w-full bg-purple-500 hover:bg-purple-600">
                              <BookOpen className="mr-2" size={14} />
                              {book.progress > 0 ? "Continue" : "Start Reading"}
                            </Button>
                          </Link>
                        </div>

                        <div className="flex items-center text-xs text-purple-200">
                          <Clock size={12} className="mr-1" />
                          Added {new Date(book.addedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reading">
            <div className="text-center py-20">
              <BookOpen className="mx-auto text-purple-300 mb-4" size={64} />
              <h2 className="text-2xl font-semibold text-white mb-4">No books currently being read</h2>
              <p className="text-purple-200 mb-8">Start reading a book to see it here!</p>
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <div className="text-center py-20">
              <StickyNote className="mx-auto text-purple-300 mb-4" size={64} />
              <h2 className="text-2xl font-semibold text-white mb-4">No notes or highlights yet</h2>
              <p className="text-purple-200 mb-8">Start reading and taking notes to see them here!</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function AddBookForm({
  onSave,
  onCancel,
}: {
  onSave: (data: Partial<Book>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [genre, setGenre] = useState("")
  const [content, setContent] = useState("")

  const handleSave = () => {
    onSave({ title, author, genre, content })
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Book title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-white/10 border-white/20 text-white"
      />
      <Input
        placeholder="Author..."
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        className="bg-white/10 border-white/20 text-white"
      />
      <Input
        placeholder="Genre..."
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        className="bg-white/10 border-white/20 text-white"
      />
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-purple-500 hover:bg-purple-600">
          Add Book
        </Button>
      </div>
    </div>
  )
}
