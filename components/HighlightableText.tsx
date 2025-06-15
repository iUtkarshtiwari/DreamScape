import { useState } from 'react';
import { motion } from 'framer-motion';
import { Highlighter } from 'lucide-react';

interface Highlight {
  text: string;
  color: string;
  start: number;
  end: number;
}

interface HighlightableTextProps {
  content: string;
}

export function HighlightableText({ content }: HighlightableTextProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const highlightColors = [
    { name: 'Yellow', value: 'bg-yellow-200/50' },
    { name: 'Green', value: 'bg-green-200/50' },
    { name: 'Blue', value: 'bg-blue-200/50' },
    { name: 'Pink', value: 'bg-pink-200/50' },
  ];

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setShowHighlightMenu(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const text = selection.toString();
    setSelectedText(text);

    const rect = range.getBoundingClientRect();
    setMenuPosition({
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY,
    });
    setShowHighlightMenu(true);
  };

  const addHighlight = (color: string) => {
    const selection = window.getSelection();
    if (!selection) return;

    const range = selection.getRangeAt(0);
    const newHighlight: Highlight = {
      text: selectedText,
      color,
      start: range.startOffset,
      end: range.endOffset,
    };

    setHighlights([...highlights, newHighlight]);
    setShowHighlightMenu(false);
    selection.removeAllRanges();
  };

  const renderHighlightedText = () => {
    let lastIndex = 0;
    const elements: JSX.Element[] = [];

    highlights.forEach((highlight, index) => {
      // Add text before highlight
      if (highlight.start > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {content.slice(lastIndex, highlight.start)}
          </span>
        );
      }

      // Add highlighted text
      elements.push(
        <span
          key={`highlight-${index}`}
          className={`${highlight.color} rounded px-1`}
        >
          {highlight.text}
        </span>
      );

      lastIndex = highlight.end;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      elements.push(
        <span key="text-end">{content.slice(lastIndex)}</span>
      );
    }

    return elements;
  };

  return (
    <div className="relative">
      <div
        className="prose prose-invert max-w-none"
        onMouseUp={handleTextSelection}
      >
        {renderHighlightedText()}
      </div>

      {showHighlightMenu && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-2 flex gap-2"
          style={{
            left: menuPosition.x,
            top: menuPosition.y + 10,
          }}
        >
          {highlightColors.map((color) => (
            <button
              key={color.name}
              className={`w-6 h-6 rounded-full ${color.value} hover:scale-110 transition-transform`}
              onClick={() => addHighlight(color.value)}
              title={color.name}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
} 