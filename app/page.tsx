"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles, Moon, Star } from "lucide-react"
import { BookCard } from "@/components/BookCard"
import { LoginModal } from "@/components/LoginModal"
import Link from "next/link"
import { useEffect, useState } from "react"

const sampleBooks = [
  {
    id: "1",
    title: "The Dream Weaver",
    author: "Sarah Mitchell",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000",
    description: "A journey through the realms of imagination",
    content: "Once upon a time, in a world not unlike our own, there lived a dream weaver..."
  },
  {
    id: "2",
    title: "Echoes of Tomorrow",
    author: "James Chen",
    coverImage: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1000",
    description: "A tale of time and destiny",
    content: "The clock tower stood silent, its hands frozen in time..."
  },
  {
    id: "3",
    title: "Whispers in the Dark",
    author: "Emma Thompson",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000",
    description: "A mystery that will keep you guessing",
    content: "The old mansion creaked in the wind, its secrets buried deep within..."
  }
];

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-70"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-20 text-purple-300"
        animate={{
          x: mousePosition.x * 0.02,
          y: mousePosition.y * 0.02,
        }}
      >
        <Moon size={40} />
      </motion.div>

      <motion.div
        className="absolute top-40 right-32 text-pink-300"
        animate={{
          x: mousePosition.x * -0.03,
          y: mousePosition.y * 0.01,
        }}
      >
        <Star size={30} />
      </motion.div>

      <motion.div
        className="absolute bottom-32 left-40 text-blue-300"
        animate={{
          x: mousePosition.x * 0.01,
          y: mousePosition.y * -0.02,
        }}
      >
        <Sparkles size={35} />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-12"
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent mb-6"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
            }}
          >
            DreamScape
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-xl md:text-2xl text-purple-200 mb-8 max-w-2xl"
          >
            Create beautiful mood boards and explore amazing stories
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/auth">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="mr-2" />
                Start Dreaming
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 max-w-4xl"
        >
          {[
            { icon: "🎨", title: "Create", desc: "Design stunning mood boards" },
            { icon: "✨", title: "Customize", desc: "Add images, text, and themes" },
            { icon: "💾", title: "Save", desc: "Keep your creations forever" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10, scale: 1.05 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-purple-200">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Book Section Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="text-3xl font-bold text-white mb-8"
        >
          Featured Stories
        </motion.h2>

        {/* Book Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl w-full px-4 mb-20"
        >
          {sampleBooks.map((book, index) => (
            <BookCard key={index} {...book} />
          ))}
        </motion.div>
      </div>

      {/* Login Modal */}
      <LoginModal />
    </div>
  )
}
