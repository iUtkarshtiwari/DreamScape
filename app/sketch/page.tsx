'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Square, Circle, Triangle, Star, Trash2, Download, ArrowRight, ImagePlus, Maximize2 } from "lucide-react";

interface Point {
  x: number;
  y: number;
}

interface DrawingShape {
  type: string;
  points: Point[];
  color: string;
  lineWidth: number;
  imageUrl?: string;
  width?: number;
  height?: number;
  isResizing?: boolean;
}

export default function SketchPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [shapes, setShapes] = useState<DrawingShape[]>([]);
  const [selectedTool, setSelectedTool] = useState('pencil');
  const [currentColor, setCurrentColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(2);
  const [pencilPoints, setPencilPoints] = useState<Point[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartPoint, setResizeStartPoint] = useState<Point | null>(null);

  const colors = ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

  const shapeTools = [
    { type: 'pencil', label: 'Pencil', icon: Pencil },
    { type: 'arrow', label: 'Arrow', icon: ArrowRight },
    { type: 'square', label: 'Square', icon: Square },
    { type: 'circle', label: 'Circle', icon: Circle },
    { type: 'triangle', label: 'Triangle', icon: Triangle },
    { type: 'star', label: 'Star', icon: Star },
    { type: 'eraser', label: 'Eraser', icon: Pencil },
  ];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size to match window size
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      // Set canvas size to match display size
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Scale context to match display size
      ctx.scale(dpr, dpr);
      
      // Set canvas style size to match display size
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      // Set line styles
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Redraw everything after resize
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Calculate the exact mouse position relative to the canvas
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;

    return { x, y };
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    const headLength = 20;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    
    // Draw the line
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    
    // Draw the arrow head
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLength * Math.cos(angle - Math.PI / 6),
      end.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      end.x - headLength * Math.cos(angle + Math.PI / 6),
      end.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  };

  const drawShape = (ctx: CanvasRenderingContext2D, shape: DrawingShape, index: number) => {
    ctx.strokeStyle = shape.color;
    ctx.fillStyle = shape.color;
    ctx.lineWidth = shape.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    switch (shape.type) {
      case 'image':
        if (shape.imageUrl) {
          const img = new Image();
          img.src = shape.imageUrl;
          ctx.drawImage(img, shape.points[0].x, shape.points[0].y, shape.width || 200, shape.height || 200);
          
          // Draw resize handle if image is selected
          if (selectedImageIndex === index) {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            const handleSize = 10;
            const handleX = shape.points[0].x + (shape.width || 200);
            const handleY = shape.points[0].y + (shape.height || 200);
            ctx.beginPath();
            ctx.arc(handleX, handleY, handleSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        }
        return;
      case 'pencil':
        if (shape.points.length < 2) return;
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        break;
      case 'arrow':
        if (shape.points.length !== 2) return;
        drawArrow(ctx, shape.points[0], shape.points[1]);
        return;
      case 'square':
        if (shape.points.length !== 2) return;
        const [start, end] = shape.points;
        const width = end.x - start.x;
        const height = end.y - start.y;
        ctx.rect(start.x, start.y, width, height);
        break;
      case 'circle':
        if (shape.points.length !== 2) return;
        const [center, radiusPoint] = shape.points;
        const radius = Math.sqrt(
          Math.pow(radiusPoint.x - center.x, 2) + Math.pow(radiusPoint.y - center.y, 2)
        );
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        break;
      case 'triangle':
        if (shape.points.length !== 2) return;
        const [p1, p2] = shape.points;
        ctx.moveTo(p1.x, p2.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo((p1.x + p2.x) / 2, p1.y);
        ctx.closePath();
        break;
      case 'star':
        if (shape.points.length !== 2) return;
        const [starCenter, starPoint] = shape.points;
        const starRadius = Math.sqrt(
          Math.pow(starPoint.x - starCenter.x, 2) + Math.pow(starPoint.y - starCenter.y, 2)
        );
        const spikes = 5;
        const outerRadius = starRadius;
        const innerRadius = starRadius / 2;

        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI * i) / spikes;
          const x = starCenter.x + Math.cos(angle) * radius;
          const y = starCenter.y + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
      case 'eraser':
        if (shape.points.length < 2) return;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        ctx.globalCompositeOperation = 'source-over';
        break;
    }

    ctx.stroke();
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all shapes
    shapes.forEach((shape, index) => {
      drawShape(ctx, shape, index);
    });

    // Draw current shape being drawn
    if (isDrawing && startPoint && currentPoint) {
      const currentShape: DrawingShape = {
        type: selectedTool,
        points: selectedTool === 'pencil' || selectedTool === 'eraser' ? pencilPoints : [startPoint, currentPoint],
        color: selectedTool === 'eraser' ? '#1a1a1a' : currentColor,
        lineWidth: selectedTool === 'eraser' ? 20 : lineWidth
      };
      drawShape(ctx, currentShape, -1);
    }
  };

  useEffect(() => {
    redrawCanvas();
  }, [shapes, isDrawing, startPoint, currentPoint, pencilPoints]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    
    // Check if clicking on an image resize handle
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      if (shape.type === 'image' && isPointInResizeHandle(point, shape)) {
        setIsResizing(true);
        setResizeStartPoint(point);
        setSelectedImageIndex(i);
        return;
      }
    }

    // Check if clicking on an image
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      if (shape.type === 'image' && isPointInImage(point, shape)) {
        setSelectedImageIndex(i);
        return;
      }
    }

    setSelectedImageIndex(null);
    setIsDrawing(true);
    setStartPoint(point);
    setCurrentPoint(point);
    setPencilPoints([point]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    setCurrentPoint(point);

    if (isResizing && selectedImageIndex !== null && resizeStartPoint) {
      const shape = shapes[selectedImageIndex];
      if (shape.type === 'image') {
        const newShapes = [...shapes];
        newShapes[selectedImageIndex] = {
          ...shape,
          width: Math.max(50, point.x - shape.points[0].x),
          height: Math.max(50, point.y - shape.points[0].y)
        };
        setShapes(newShapes);
      }
      return;
    }

    if (isDrawing) {
      if (selectedTool === 'pencil' || selectedTool === 'eraser') {
        setPencilPoints(prev => [...prev, point]);
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      if (startPoint && currentPoint) {
        const newShape: DrawingShape = {
          type: selectedTool,
          points: selectedTool === 'pencil' || selectedTool === 'eraser' ? pencilPoints : [startPoint, currentPoint],
          color: selectedTool === 'eraser' ? '#1a1a1a' : currentColor,
          lineWidth: selectedTool === 'eraser' ? 20 : lineWidth
        };
        setShapes(prev => [...prev, newShape]);
      }
    }
    setIsDrawing(false);
    setIsResizing(false);
    setResizeStartPoint(null);
    setStartPoint(null);
    setCurrentPoint(null);
    setPencilPoints([]);
  };

  const handleShapeToolClick = (shapeTool: typeof shapeTools[0]) => {
    setSelectedTool(shapeTool.type);
    if (shapeTool.type === 'eraser') {
      setLineWidth(20);
    } else {
      setLineWidth(2);
    }
  };

  const handleClearCanvas = () => {
    setShapes([]);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'sketch.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newShape: DrawingShape = {
          type: 'image',
          points: [{ x: 100, y: 100 }],
          color: '#ffffff',
          lineWidth: 2,
          imageUrl: event.target?.result as string,
          width: 200,
          height: 200
        };
        setShapes(prev => [...prev, newShape]);
      };
      reader.readAsDataURL(file);
    }
  };

  const isPointInImage = (point: Point, shape: DrawingShape) => {
    if (shape.type !== 'image' || !shape.width || !shape.height) return false;
    return (
      point.x >= shape.points[0].x &&
      point.x <= shape.points[0].x + shape.width &&
      point.y >= shape.points[0].y &&
      point.y <= shape.points[0].y + shape.height
    );
  };

  const isPointInResizeHandle = (point: Point, shape: DrawingShape) => {
    if (shape.type !== 'image' || !shape.width || !shape.height) return false;
    const handleSize = 10;
    const handleX = shape.points[0].x + shape.width;
    const handleY = shape.points[0].y + shape.height;
    return (
      point.x >= handleX - handleSize &&
      point.x <= handleX + handleSize &&
      point.y >= handleY - handleSize &&
      point.y <= handleY + handleSize
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 text-white">
      {/* Left Sidebar */}
      <div className="fixed left-0 top-0 h-full w-16 bg-purple-800/80 backdrop-blur-sm flex flex-col items-center py-4 gap-4 z-50">
        {shapeTools.map((shapeTool) => (
          <Button
            key={shapeTool.label}
            variant="outline"
            size="icon"
            className={`w-10 h-10 bg-white/10 hover:bg-white/20 ${
              selectedTool === shapeTool.type ? 'bg-white/30 ring-2 ring-white' : ''
            }`}
            onClick={() => handleShapeToolClick(shapeTool)}
          >
            <shapeTool.icon className="h-5 w-5 text-white" />
          </Button>
        ))}
        <div className="w-full h-px bg-white/20 my-2" />
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 bg-white/10 hover:bg-white/20"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="h-5 w-5 text-white" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 bg-white/10 hover:bg-white/20"
          onClick={handleDownload}
        >
          <Download className="h-5 w-5 text-white" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 bg-white/10 hover:bg-white/20 text-red-400 hover:text-red-300"
          onClick={handleClearCanvas}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Color Picker */}
      <div className="fixed top-4 left-20 z-10 flex gap-2 bg-purple-800/80 backdrop-blur-sm p-2 rounded-lg">
        {colors.map((color) => (
          <button
            key={color}
            className={`w-8 h-8 rounded-full ${
              currentColor === color ? 'ring-2 ring-white' : ''
            }`}
            style={{ backgroundColor: color }}
            onClick={() => setCurrentColor(color)}
          />
        ))}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
} 