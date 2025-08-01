"use client";

import { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Palette, 
  Square, 
  Circle, 
  Minus, 
  Download, 
  Upload, 
  Save, 
  RotateCcw, 
  Plus,
  FolderOpen,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Sketch {
  id: string;
  title: string;
  image_url: string;
  created_at: string;
}

export default function SketchBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user, token } = useAuth();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'line' | 'rectangle' | 'circle'>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [sketchTitle, setSketchTitle] = useState('');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const { toast } = useToast();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set default styles
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    loadSketches();
  }, []);

  const loadSketches = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:4000/api/sketches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSketches(data.sketches);
      }
    } catch (error) {
      console.error('Failed to load sketches:', error);
    }
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPos(pos);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = lineWidth;

    if (currentTool === 'pen') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getMousePos(e);

    if (currentTool === 'pen') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getMousePos(e);

    if (currentTool === 'line') {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (currentTool === 'rectangle') {
      const width = pos.x - startPos.x;
      const height = pos.y - startPos.y;
      ctx.strokeRect(startPos.x, startPos.y, width, height);
    } else if (currentTool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveSketch = async () => {
    if (!canvasRef.current || !token || !sketchTitle.trim()) return;

    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('image', blob, 'sketch.png');
      formData.append('title', sketchTitle);

      try {
        const response = await fetch('http://localhost:4000/api/sketches', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();
        if (data.success) {
          setShowSaveDialog(false);
          setSketchTitle('');
          loadSketches();
          toast({ title: 'Sketch saved successfully!' });
        }
      } catch (error) {
        console.error('Failed to save sketch:', error);
      }
    }, 'image/png');
  };

  const loadSketch = async (sketchId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:4000/api/sketches/${sketchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
          clearCanvas();
          ctx.drawImage(img, 0, 0);
        };
        img.src = data.sketch.image_url; // Use image_url from backend
        setShowLoadDialog(false);
      }
    } catch (error) {
      console.error('Failed to load sketch:', error);
    }
  };

  const downloadSketch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'sketch.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  // Add a function to load an image file onto the canvas
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvasRef.current) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const tools = [
    { id: 'pen', icon: Palette, name: 'Pen' },
    { id: 'line', icon: Minus, name: 'Line' },
    { id: 'rectangle', icon: Square, name: 'Rectangle' },
    { id: 'circle', icon: Circle, name: 'Circle' },
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#A52A2A'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Sketch Board
        </h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowLoadDialog(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Load</span>
          </button>
          {/* File input for loading images */}
          <label className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Import</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </label>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button
            onClick={downloadSketch}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex flex-wrap items-center gap-6">
          {/* Tools */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Tools:</span>
            <div className="flex space-x-1">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setCurrentTool(tool.id as any)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    currentTool === tool.id
                      ? 'bg-violet-100 text-violet-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={tool.name}
                >
                  <tool.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Color:</span>
            <div className="flex space-x-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 ${
                    currentColor === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                className="w-8 h-8 rounded-lg border-2 border-gray-200 cursor-pointer"
              />
            </div>
          </div>

          {/* Line Width */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600 w-6">{lineWidth}</span>
          </div>

          {/* Clear Button */}
          <button
            onClick={clearCanvas}
            className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-96 border border-gray-300 rounded-lg cursor-crosshair"
        />
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Save Sketch</h3>
            <input
              type="text"
              placeholder="Enter sketch title"
              value={sketchTitle}
              onChange={(e) => setSketchTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={saveSketch}
                disabled={!sketchTitle.trim()}
                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Load Sketch</h3>
            {sketches.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No saved sketches found</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {sketches.map((sketch) => (
                  <div
                    key={sketch.id}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    onClick={() => loadSketch(sketch.id)}
                  >
                    <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
                      <img
                        src={sketch.image_url}
                        alt={sketch.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-medium text-sm truncate">{sketch.title}</h4>
                    <p className="text-xs text-gray-500">
                      {new Date(sketch.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowLoadDialog(false)}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}