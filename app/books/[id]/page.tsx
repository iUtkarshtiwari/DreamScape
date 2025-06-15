"use client"

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { HighlightableText } from '@/components/HighlightableText'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// This would typically come from a database
const books = [
  {
    id: "1",
    title: "The Dream Weaver",
    author: "Sarah Mitchell",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000",
    description: "A journey through the realms of imagination",
    content: `Once upon a time, in a world not unlike our own, there lived a dream weaver. Her name was Luna, and she had the extraordinary ability to spin dreams into reality.

    Every night, as the world slept, Luna would sit by her window, watching the stars twinkle in the velvet sky. She would take the dreams that floated through the air like dandelion seeds and weave them into beautiful tapestries of possibility.

    The townspeople would wake up each morning with a sense of wonder, their dreams lingering in their minds like the last notes of a beautiful song. They didn't know it was Luna's work, but they felt her magic in their hearts.

    One particularly cold winter night, Luna noticed that the dreams were becoming scarce. The people were losing their ability to dream, their imaginations clouded by the harsh realities of life. Luna knew she had to do something.

    She gathered all the remaining dreams she had collected over the years and began to weave them into a magnificent tapestry. As she worked, the dreams began to glow, casting a warm light that spread throughout the town.

    The next morning, the townspeople woke up to find their world transformed. The streets were lined with flowers that bloomed in impossible colors, and the air was filled with the sweet scent of possibility. Their dreams had returned, stronger than ever.

    From that day forward, Luna became known as the Dream Weaver, the guardian of imagination and hope. And every night, as the stars twinkled in the velvet sky, she would continue her work, weaving dreams into reality for all who believed in the power of possibility.`
  },
  {
    id: "2",
    title: "Echoes of Tomorrow",
    author: "James Chen",
    coverImage: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1000",
    description: "A tale of time and destiny",
    content: `The clock tower stood silent, its hands frozen in time. Dr. Eleanor Blackwood adjusted her glasses as she examined the ancient mechanism. The town's legend spoke of a time when the clock would strike thirteen, opening a portal to tomorrow.

    As a quantum physicist, Eleanor had spent her life studying the nature of time. The clock tower's anomaly had drawn her to this small town, and now she stood before it, her instruments recording strange fluctuations in the space-time continuum.

    "It's beautiful, isn't it?" a voice said behind her. Eleanor turned to see an old man, his eyes twinkling with wisdom. "The clock has been waiting for someone like you," he continued.

    That night, as the moon cast long shadows across the town square, Eleanor returned to the clock tower. Her instruments had detected a surge in temporal energy, and she knew this was the moment.

    As the clock struck midnight, something extraordinary happened. The hands began to move backward, and the air around the tower shimmered like a mirage. Eleanor felt a pull, a calling from beyond the veil of time.

    With a deep breath, she stepped forward, into the unknown. The world around her dissolved into a kaleidoscope of possibilities, and she found herself standing in a future that was both familiar and strange.

    The town had changed, yet remained the same. The clock tower still stood, but now it was surrounded by buildings that seemed to float in the air. People moved about their daily lives, their faces reflecting the peace of a world that had learned from its past.

    Eleanor realized that the clock tower wasn't just a portal to tomorrow—it was a bridge between what was and what could be. And she, as its guardian, had the power to shape the future by understanding the past.

    As the first light of dawn broke over the horizon, Eleanor returned to her own time, carrying with her the knowledge of what was possible. The clock tower's hands began to move forward again, but now they carried the promise of a better tomorrow.`
  },
  {
    id: "3",
    title: "Whispers in the Dark",
    author: "Emma Thompson",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000",
    description: "A mystery that will keep you guessing",
    content: `The old mansion creaked in the wind, its secrets buried deep within its walls. Detective Sarah Morgan stood at the threshold, her flashlight cutting through the darkness like a knife through butter.

    The case had brought her here—a series of strange occurrences that had the town's residents whispering about ghosts and curses. But Sarah didn't believe in the supernatural. There was always a logical explanation, even for the most mysterious of events.

    As she stepped inside, the floorboards groaned beneath her feet. The air was thick with dust and the scent of old paper. Her flashlight revealed a grand staircase, its banister covered in cobwebs, leading up to the second floor.

    "Hello?" she called out, her voice echoing through the empty halls. There was no response, but she could have sworn she heard a whisper, a voice so faint it might have been her imagination.

    The investigation led her through room after room, each one telling a story of the mansion's past. In the library, she found old journals filled with cryptic entries. In the study, a map of the town marked with strange symbols.

    As the night wore on, Sarah began to piece together the puzzle. The mansion had been home to a secret society, one that had conducted experiments in the pursuit of knowledge. But something had gone wrong, and the members had disappeared one by one.

    The whispers grew louder as she descended into the basement. There, hidden behind a false wall, she found the truth. The society's experiments had succeeded beyond their wildest dreams, but at a terrible cost.

    The members hadn't disappeared—they had transcended, becoming something between human and spirit. They were the source of the whispers, trying to communicate with the living, to warn them about the dangers of their research.

    As dawn broke, Sarah emerged from the mansion, her notebook filled with evidence and her mind racing with possibilities. The case was far from closed, but she had uncovered a truth that would change everything.

    The whispers followed her as she left, a constant reminder that some mysteries were meant to remain unsolved, some doors better left unopened. But Sarah knew she would return, drawn by the promise of answers and the thrill of the unknown.`
  }
];

export default function BookPage() {
  const params = useParams()
  const book = books.find(b => b.id === params.id)

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Book Not Found</h1>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <ArrowLeft className="mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="text-white mb-8">
            <ArrowLeft className="mr-2" />
            Back to Home
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20"
        >
          <h1 className="text-4xl font-bold text-white mb-4">{book.title}</h1>
          <p className="text-xl text-purple-200 mb-8">by {book.author}</p>
          
          <div className="prose prose-invert max-w-none">
            <HighlightableText content={book.content} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
