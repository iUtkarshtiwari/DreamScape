import { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, BookOpen, Star } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  content: string;
}

export function BookCard({ id, title, author, coverImage, description, content }: BookCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated, showLoginModal } = useAuth();
  const router = useRouter();

  const handleReadClick = () => {
    if (!isAuthenticated) {
      showLoginModal();
      return;
    }
    router.push(`/books/${id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 shadow-lg">
        <div className="relative aspect-[3/4]">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-purple-200 mb-3">{author}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-purple-200">4.5</span>
            </div>
            
            <Button
              variant="ghost"
              className="text-purple-200 hover:text-white hover:bg-purple-500/20"
              onClick={handleReadClick}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Read
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 