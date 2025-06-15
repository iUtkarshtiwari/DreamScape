"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Mail,
  Calendar,
  BookOpen,
  StickyNote,
  PenTool,
  Settings,
  Camera,
  Palette,
  Bell,
  Shield,
  Download,
} from "lucide-react"

interface UserStats {
  moodBoards: number
  notes: number
  todos: number
  booksRead: number
  highlightsCreated: number
  daysActive: number
}

interface UserPreferences {
  theme: "light" | "dark" | "auto"
  notifications: boolean
  autoSave: boolean
  defaultNoteColor: string
  readingGoal: number
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<UserStats>({
    moodBoards: 0,
    notes: 0,
    todos: 0,
    booksRead: 0,
    highlightsCreated: 0,
    daysActive: 0,
  })
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "auto",
    notifications: true,
    autoSave: true,
    defaultNoteColor: "#FFFF00",
    readingGoal: 12,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<any>({})

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem("dreamscape_user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setEditedUser(parsedUser)
    }

    // Calculate stats
    const boards = JSON.parse(localStorage.getItem("dreamscape_boards") || "[]")
    const notes = JSON.parse(localStorage.getItem("dreamscape_notes") || "[]")
    const todos = JSON.parse(localStorage.getItem("dreamscape_todos") || "[]")
    const books = JSON.parse(localStorage.getItem("dreamscape_books") || "[]")

    const totalHighlights = books.reduce((acc: number, book: any) => acc + (book.highlights?.length || 0), 0)

    setStats({
      moodBoards: boards.length,
      notes: notes.length,
      todos: todos.length,
      booksRead: books.filter((book: any) => book.progress === 100).length,
      highlightsCreated: totalHighlights,
      daysActive: 30, // Mock data
    })

    // Load preferences
    const savedPrefs = localStorage.getItem("dreamscape_preferences")
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs))
    }
  }, [])

  const saveProfile = () => {
    localStorage.setItem("dreamscape_user", JSON.stringify(editedUser))
    setUser(editedUser)
    setIsEditing(false)
  }

  const savePreferences = () => {
    localStorage.setItem("dreamscape_preferences", JSON.stringify(preferences))
  }

  const exportData = () => {
    const data = {
      user,
      boards: JSON.parse(localStorage.getItem("dreamscape_boards") || "[]"),
      notes: JSON.parse(localStorage.getItem("dreamscape_notes") || "[]"),
      todos: JSON.parse(localStorage.getItem("dreamscape_todos") || "[]"),
      books: JSON.parse(localStorage.getItem("dreamscape_books") || "[]"),
      preferences,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "dreamscape-data.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
          <p className="text-purple-200">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="text-center">
                <div className="relative mx-auto mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-purple-500 text-white text-2xl">
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-purple-500 hover:bg-purple-600"
                  >
                    <Camera size={14} />
                  </Button>
                </div>
                <CardTitle className="text-white text-xl">{user.name}</CardTitle>
                <p className="text-purple-200">{user.email}</p>
                <Badge variant="secondary" className="mt-2">
                  Member since {new Date(user.joinedAt || Date.now()).getFullYear()}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">{stats.daysActive}</div>
                      <div className="text-sm text-purple-200">Days Active</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {stats.moodBoards + stats.notes + stats.todos}
                      </div>
                      <div className="text-sm text-purple-200">Total Items</div>
                    </div>
                  </div>
                  <Button onClick={() => setIsEditing(!isEditing)} className="w-full bg-purple-500 hover:bg-purple-600">
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 mt-6">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PenTool className="text-purple-300" size={16} />
                      <span className="text-white text-sm">Mood Boards</span>
                    </div>
                    <Badge variant="secondary">{stats.moodBoards}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StickyNote className="text-purple-300" size={16} />
                      <span className="text-white text-sm">Notes</span>
                    </div>
                    <Badge variant="secondary">{stats.notes}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="text-purple-300" size={16} />
                      <span className="text-white text-sm">Books Read</span>
                    </div>
                    <Badge variant="secondary">{stats.booksRead}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="text-purple-300" size={16} />
                      <span className="text-white text-sm">Highlights</span>
                    </div>
                    <Badge variant="secondary">{stats.highlightsCreated}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/10">
                <TabsTrigger value="profile" className="text-white data-[state=active]:bg-purple-500">
                  Profile
                </TabsTrigger>
                <TabsTrigger value="preferences" className="text-white data-[state=active]:bg-purple-500">
                  Preferences
                </TabsTrigger>
                <TabsTrigger value="data" className="text-white data-[state=active]:bg-purple-500">
                  Data
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="text-white text-sm font-medium mb-2 block">Full Name</label>
                          <Input
                            value={editedUser.name || ""}
                            onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-white text-sm font-medium mb-2 block">Email</label>
                          <Input
                            value={editedUser.email || ""}
                            onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-white text-sm font-medium mb-2 block">Bio</label>
                          <Input
                            value={editedUser.bio || ""}
                            onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                        <Button onClick={saveProfile} className="bg-purple-500 hover:bg-purple-600">
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <User className="text-purple-300" size={20} />
                          <div>
                            <div className="text-white font-medium">{user.name}</div>
                            <div className="text-purple-200 text-sm">Full Name</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="text-purple-300" size={20} />
                          <div>
                            <div className="text-white font-medium">{user.email}</div>
                            <div className="text-purple-200 text-sm">Email Address</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="text-purple-300" size={20} />
                          <div>
                            <div className="text-white font-medium">
                              {new Date(user.joinedAt || Date.now()).toLocaleDateString()}
                            </div>
                            <div className="text-purple-200 text-sm">Member Since</div>
                          </div>
                        </div>
                        {user.bio && (
                          <div className="flex items-start gap-3">
                            <User className="text-purple-300 mt-1" size={20} />
                            <div>
                              <div className="text-white font-medium">{user.bio}</div>
                              <div className="text-purple-200 text-sm">Bio</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">App Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Theme</label>
                      <select
                        value={preferences.theme}
                        onChange={(e) => {
                          const newPrefs = { ...preferences, theme: e.target.value as "light" | "dark" | "auto" }
                          setPreferences(newPrefs)
                          savePreferences()
                        }}
                        className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white w-full"
                      >
                        <option value="light" className="text-black">
                          Light
                        </option>
                        <option value="dark" className="text-black">
                          Dark
                        </option>
                        <option value="auto" className="text-black">
                          Auto
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Reading Goal (books per year)</label>
                      <Input
                        type="number"
                        value={preferences.readingGoal}
                        onChange={(e) => {
                          const newPrefs = { ...preferences, readingGoal: Number.parseInt(e.target.value) || 0 }
                          setPreferences(newPrefs)
                          savePreferences()
                        }}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="text-purple-300" size={16} />
                          <span className="text-white text-sm">Notifications</span>
                        </div>
                        <Button
                          size="sm"
                          variant={preferences.notifications ? "default" : "outline"}
                          onClick={() => {
                            const newPrefs = { ...preferences, notifications: !preferences.notifications }
                            setPreferences(newPrefs)
                            savePreferences()
                          }}
                        >
                          {preferences.notifications ? "On" : "Off"}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Settings className="text-purple-300" size={16} />
                          <span className="text-white text-sm">Auto Save</span>
                        </div>
                        <Button
                          size="sm"
                          variant={preferences.autoSave ? "default" : "outline"}
                          onClick={() => {
                            const newPrefs = { ...preferences, autoSave: !preferences.autoSave }
                            setPreferences(newPrefs)
                            savePreferences()
                          }}
                        >
                          {preferences.autoSave ? "On" : "Off"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="data">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Data Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-white font-medium mb-2">Export Data</h3>
                      <p className="text-purple-200 text-sm mb-4">
                        Download all your DreamScape data including mood boards, notes, todos, and books.
                      </p>
                      <Button onClick={exportData} className="bg-purple-500 hover:bg-purple-600">
                        <Download className="mr-2" size={16} />
                        Export All Data
                      </Button>
                    </div>

                    <div className="border-t border-white/20 pt-4">
                      <h3 className="text-white font-medium mb-2">Data Summary</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-purple-200">Mood Boards:</div>
                          <div className="text-white font-medium">{stats.moodBoards} items</div>
                        </div>
                        <div>
                          <div className="text-purple-200">Notes:</div>
                          <div className="text-white font-medium">{stats.notes} items</div>
                        </div>
                        <div>
                          <div className="text-purple-200">Todos:</div>
                          <div className="text-white font-medium">{stats.todos} items</div>
                        </div>
                        <div>
                          <div className="text-purple-200">Books:</div>
                          <div className="text-white font-medium">{stats.booksRead} completed</div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/20 pt-4">
                      <h3 className="text-red-400 font-medium mb-2">Danger Zone</h3>
                      <p className="text-purple-200 text-sm mb-4">
                        Permanently delete all your data. This action cannot be undone.
                      </p>
                      <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                        <Shield className="mr-2" size={16} />
                        Delete All Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
