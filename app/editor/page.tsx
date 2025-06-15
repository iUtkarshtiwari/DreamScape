"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Download, Share, ImageIcon, Type, Palette, Music, Trash2, RotateCcw, Square, Circle, Triangle, Star, Heart, Sparkles, Moon, Sun, Cloud, Flower, Leaf, Mountain, Waves, Pencil, Eraser, Upload } from "lucide-react"
import { useRouter } from "next/navigation"

interface Point {
  x: number
  y: number
}

interface DrawingShape {
  type: 'pencil' | 'line' | 'rectangle' | 'circle' | 'triangle' | 'star'
  points: Point[]
  color: string
  lineWidth: number
}

interface ShapeTool {
  icon: React.ElementType;
  label: string;
  type: DrawingShape['type'];
}

interface BoardElement {
  id: string
  type: "image" | "text" | "sticker"
  content: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
}

interface ImageElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  title?: string;
  description?: string;
}

const themes = [
  {
    name: 'Dreamy',
    colors: ['#FFB6C1', '#87CEEB', '#DDA0DD', '#F0E68C'],
    background: 'bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900'
  },
  {
    name: 'Nature',
    colors: ['#98FB98', '#90EE90', '#3CB371', '#2E8B57'],
    background: 'bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-900'
  },
  {
    name: 'Ocean',
    colors: ['#1E90FF', '#00BFFF', '#87CEEB', '#B0E0E6'],
    background: 'bg-gradient-to-br from-blue-900 via-cyan-900 to-blue-900'
  },
  {
    name: 'Sunset',
    colors: ['#FFA07A', '#FF7F50', '#FF6347', '#FF4500'],
    background: 'bg-gradient-to-br from-orange-900 via-red-900 to-orange-900'
  }
]

const stickers = ["✨", "��", "⭐", "🦋", "🌸", "🍃", "💫", "🌈", "🔮", "��"]

const symbols = [
  { icon: Star, label: 'Star', emoji: '⭐' },
  { icon: Heart, label: 'Heart', emoji: '❤️' },
  { icon: Sparkles, label: 'Sparkles', emoji: '✨' },
  { icon: Moon, label: 'Moon', emoji: '🌙' },
  { icon: Sun, label: 'Sun', emoji: '☀️' },
  { icon: Cloud, label: 'Cloud', emoji: '☁️' },
  { icon: Flower, label: 'Flower', emoji: '🌸' },
  { icon: Leaf, label: 'Leaf', emoji: '🍃' },
  { icon: Mountain, label: 'Mountain', emoji: '⛰️' },
  { icon: Waves, label: 'Waves', emoji: '🌊' }
]

const shapeTools: ShapeTool[] = [
  { icon: Pencil, label: 'Pencil', type: 'pencil' },
  { icon: Square, label: 'Square', type: 'rectangle' },
  { icon: Circle, label: 'Circle', type: 'circle' },
  { icon: Triangle, label: 'Triangle', type: 'triangle' },
  { icon: Star, label: 'Star', type: 'star' },
  { icon: Eraser, label: 'Eraser', type: 'pencil' }
]

const colors = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#FFA500', '#800080', '#008000', '#800000', '#008080', '#000080'
]

const drawShape = (ctx: CanvasRenderingContext2D, shape: DrawingShape) => {
  ctx.strokeStyle = shape.color;
  ctx.lineWidth = shape.lineWidth;
  ctx.beginPath();

  switch (shape.type) {
    case 'pencil':
      if (shape.points.length > 0) {
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
      }
      break;
    case 'line':
      if (shape.points.length === 2) {
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        ctx.lineTo(shape.points[1].x, shape.points[1].y);
      }
      break;
    case 'rectangle':
      if (shape.points.length === 2) {
        const width = shape.points[1].x - shape.points[0].x;
        const height = shape.points[1].y - shape.points[0].y;
        ctx.rect(shape.points[0].x, shape.points[0].y, width, height);
      }
      break;
    case 'circle':
      if (shape.points.length === 2) {
        const radius = Math.sqrt(
          Math.pow(shape.points[1].x - shape.points[0].x, 2) +
          Math.pow(shape.points[1].y - shape.points[0].y, 2)
        );
        ctx.arc(shape.points[0].x, shape.points[0].y, radius, 0, Math.PI * 2);
      }
      break;
    case 'triangle':
      if (shape.points.length === 2) {
        const startX = shape.points[0].x;
        const startY = shape.points[0].y;
        const endX = shape.points[1].x;
        const endY = shape.points[1].y;
        
        // Calculate the third point to form a triangle
        const midX = (startX + endX) / 2;
        const height = endY - startY;
        
        ctx.moveTo(startX, endY);
        ctx.lineTo(endX, endY);
        ctx.lineTo(midX, startY);
        ctx.closePath();
      }
      break;
    case 'star':
      if (shape.points.length === 2) {
        const centerX = shape.points[0].x;
        const centerY = shape.points[0].y;
        const radius = Math.sqrt(
          Math.pow(shape.points[1].x - centerX, 2) +
          Math.pow(shape.points[1].y - centerY, 2)
        );
        
        const spikes = 5;
        const outerRadius = radius;
        const innerRadius = radius * 0.4;
        
        for (let i = 0; i < spikes * 2; i++) {
          const r = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI * i) / spikes;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
      }
      break;
  }
  
  ctx.stroke();
};

export default function EditorPage() {
  const [elements, setElements] = useState<BoardElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [boardTitle, setBoardTitle] = useState("Untitled Board")
  const [currentTheme, setCurrentTheme] = useState(themes[0])
  const [draggedElement, setDraggedElement] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentShape, setCurrentShape] = useState<DrawingShape['type']>('pencil')
  const [shapes, setShapes] = useState<DrawingShape[]>([])
  const [currentColor, setCurrentColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(2)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null)
  const [pencilPoints, setPencilPoints] = useState<Point[]>([])
  const boardRef = useRef<HTMLDivElement>(null)
  const [activeMode, setActiveMode] = useState<'draw' | 'board'>('draw')
  const [images, setImages] = useState<ImageElement[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isAddingText, setIsAddingText] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [textPosition, setTextPosition] = useState<Point | null>(null)

  const addElement = (type: BoardElement["type"], content: string) => {
    const newElement: BoardElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content,
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      rotation: 0,
      zIndex: elements.length
    }
    setElements([...elements, newElement])
  }

  const updateElement = (id: string, updates: Partial<BoardElement>) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, ...updates } : el)))
  }

  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id))
    setSelectedElement(null)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeMode !== 'draw') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentPoint({ x, y });

    if (currentShape === 'pencil') {
      setPencilPoints([{ x, y }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeMode !== 'draw') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentPoint({ x, y });

    if (currentShape === 'pencil') {
      setPencilPoints(prev => [...prev, { x, y }]);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw all previous shapes
    shapes.forEach(shape => drawShape(ctx, shape));
    
    // Draw current shape
    if (startPoint && currentPoint) {
      const currentShapeObj: DrawingShape = {
        type: currentShape,
        points: currentShape === 'pencil' ? pencilPoints : [startPoint, currentPoint],
        color: currentColor,
        lineWidth: lineWidth
      };
      drawShape(ctx, currentShapeObj);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || activeMode !== 'draw') return;

    if (startPoint && currentPoint) {
      const newShape: DrawingShape = {
        type: currentShape,
        points: currentShape === 'pencil' ? pencilPoints : [startPoint, currentPoint],
        color: currentColor,
        lineWidth: lineWidth
      };
      setShapes(prev => [...prev, newShape]);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
    setPencilPoints([]);
  };

  const handleClearCanvas = () => {
    setShapes([]);
    setPencilPoints([]);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }

  const handleMouseDownBoard = (e: React.MouseEvent<HTMLDivElement>, elementId: string) => {
    setDraggedElement(elementId)
    setSelectedElement(elementId)
  }

  const handleMouseMoveBoard = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggedElement) return
    const element = elements.find(el => el.id === draggedElement)
    if (!element) return

    const board = boardRef.current
    if (!board) return

    const rect = board.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setElements(elements.map(el =>
      el.id === draggedElement
        ? { ...el, x, y }
        : el
    ))
  }

  const handleMouseUpBoard = () => {
    setDraggedElement(null)
  }

  const saveBoard = () => {
    const board = {
      id: Date.now().toString(),
      title: boardTitle,
      theme: currentTheme.name,
      createdAt: new Date().toISOString(),
      thumbnail: "",
      elements,
    }

    const savedBoards = JSON.parse(localStorage.getItem("dreamscape_boards") || "[]")
    savedBoards.push(board)
    localStorage.setItem("dreamscape_boards", JSON.stringify(savedBoards))

    router.push("/dashboard")
  }

  const exportBoard = () => {
    // Implement export functionality
    console.log('Exporting board...')
  }

  const shareBoard = () => {
    // Implement share functionality
    console.log('Sharing board...')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const newImage: ImageElement = {
          id: Date.now().toString(),
          src: event.target?.result as string,
          x: 100,
          y: 100,
          width: img.width,
          height: img.height,
          rotation: 0
        };
        setImages(prev => [...prev, newImage]);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageDragStart = (e: React.MouseEvent<HTMLDivElement>, image: ImageElement) => {
    setSelectedImage(image);
  };

  const handleImageDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedImage) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setImages(prev => prev.map(img => 
      img.id === selectedImage.id 
        ? { ...img, x, y }
        : img
    ));
  };

  const handleImageDragEnd = () => {
    setSelectedImage(null);
  };

  const handleImageDelete = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleShapeToolClick = (shapeTool: ShapeTool) => {
    if (shapeTool.label === 'Eraser') {
      setCurrentColor('#1a1a2e');
      setLineWidth(20);
    } else {
      setCurrentColor('#000000');
      setLineWidth(2);
    }
    setCurrentShape(shapeTool.type);
  };

  const handleImageClick = (image: ImageElement) => {
    setSelectedImage(image);
  };

  const handleAddText = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedImage) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setTextPosition({ x, y });
    setIsAddingText(true);
  };

  const handleTextSubmit = () => {
    if (!selectedImage || !textPosition || !textInput) return;

    setImages(prev => prev.map(img => 
      img.id === selectedImage.id 
        ? { ...img, text: textInput, textPosition }
        : img
    ));

    setTextInput('');
    setIsAddingText(false);
    setTextPosition(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      redrawShapes()
    }

    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  useEffect(() => {
    redrawShapes()
    // eslint-disable-next-line
  }, [shapes])

  const redrawShapes = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    shapes.forEach(shape => {
      drawShape(ctx, shape)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Input
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              className="bg-transparent border-none text-2xl font-bold text-white placeholder:text-purple-200 max-w-md"
              placeholder="Board Title"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Share className="mr-2" size={16} />
                Share
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Download className="mr-2" size={16} />
                Export
              </Button>
              <Button
                onClick={saveBoard}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Save className="mr-2" size={16} />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="bg-white/10 rounded-lg overflow-hidden group relative"
            >
              <img
                src={image.src}
                alt="Uploaded"
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h3 className="font-medium mb-2">{image.title}</h3>
                {image.description && (
                  <p className="text-sm text-white/70">{image.description}</p>
                )}
              </div>
              <button
                onClick={() => handleImageDelete(image.id)}
                className="absolute top-2 right-2 p-2 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
