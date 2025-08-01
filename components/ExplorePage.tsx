"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Heart, 
  MessageCircle, 
  Upload, 
  Send, 
  Trash2,
  X,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string;
  likes: string[];
  created_at: string;
  user?: {
    _id: string;
    username: string;
    avatar_url: string;
    name: string;
  };
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export default function ExplorePage() {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    image_url: '',
    caption: '',
  });
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  // Removed showMyPosts state

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/posts');
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
        // Load comments for each post
        data.posts.forEach((post: Post) => {
          loadComments(post.id);
        });
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/comments?postId=${postId}`);
      const data = await response.json();
      if (data.success) {
        setComments(prev => ({ ...prev, [postId]: data.comments }));
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const createPost = async () => {
    if (!token || !uploadData.image_url.trim()) return;

    try {
      const response = await fetch('http://localhost:4000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(uploadData),
      });

      const data = await response.json();
      if (data.success) {
        setPosts([data.post, ...posts]);
        setUploadData({ image_url: '', caption: '' });
        setShowUploadForm(false);
        setComments(prev => ({ ...prev, [data.post.id]: [] }));
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:4000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setPosts(posts.map(post => 
          post.id === postId ? data.post : post
        ));
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const addComment = async (postId: string) => {
    if (!token || !commentInputs[postId]?.trim()) return;

    try {
      const response = await fetch('http://localhost:4000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          post_id: postId,
          content: commentInputs[postId],
        }),
      });

      const data = await response.json();
      if (data.success) {
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.comment]
        }));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const deleteComment = async (commentId: string, postId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:4000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setComments(prev => ({
          ...prev,
          [postId]: prev[postId]?.filter(comment => comment.id !== commentId) || []
        }));
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  // Sample image URLs for upload suggestions
  const sampleImages = [
    'https://images.pexels.com/photos/1496372/pexels-photo-1496372.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1612351/pexels-photo-1612351.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/2387819/pexels-photo-2387819.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1007025/pexels-photo-1007025.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg?auto=compress&cs=tinysrgb&w=600',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Explore
        </h1>
        {/* Removed My Posts toggle; always show all posts */}
        <button
          onClick={() => setShowUploadForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg"
        >
          <Upload className="w-4 h-4" />
          <span>Upload</span>
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Upload New Image</h3>
            <button
              onClick={() => setShowUploadForm(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={uploadData.image_url}
                onChange={(e) => setUploadData({ ...uploadData, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Sample Images */}
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Or choose a sample image:</p>
                <div className="grid grid-cols-3 gap-2">
                  {sampleImages.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setUploadData({ ...uploadData, image_url: url })}
                      className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-200"
                    >
                      <img
                        src={url}
                        alt={`Sample ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caption
              </label>
              <textarea
                placeholder="Write a caption for your image..."
                value={uploadData.caption}
                onChange={(e) => setUploadData({ ...uploadData, caption: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            
            {uploadData.image_url && (
              <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={uploadData.image_url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUploadForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={createPost}
                disabled={!uploadData.image_url.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Posts Grid */}
      {!isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              comments={comments[post.id] || []}
              commentInput={commentInputs[post.id] || ''}
              onToggleLike={() => toggleLike(post.id)}
              onAddComment={() => addComment(post.id)}
              onDeleteComment={(commentId) => deleteComment(commentId, post.id)}
              onCommentChange={(value) => setCommentInputs(prev => ({ ...prev, [post.id]: value }))}
              currentUserId={user?.id}
              isOwnPost={user?.id === post.user_id}
            />
          ))}
        </div>
      )}

      {posts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-500">Be the first to share an image!</p>
        </div>
      )}
    </div>
  );
}

interface PostCardProps {
  post: Post;
  comments: Comment[];
  commentInput: string;
  onToggleLike: () => void;
  onAddComment: () => void;
  onDeleteComment: (commentId: string) => void;
  onCommentChange: (value: string) => void;
  currentUserId?: string;
  isOwnPost?: boolean;
}

function PostCard({
  post,
  comments,
  commentInput,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onCommentChange,
  currentUserId,
  isOwnPost,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;
  const [likeAnimating, setLikeAnimating] = useState(false);

  // Double click handler for image
  const handleDoubleClick = () => {
    setLikeAnimating(true);
    onToggleLike();
    setTimeout(() => setLikeAnimating(false), 500);
  };

  // User avatar/profile link (use post.user if available)
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden relative">
      {post.user ? (
        <Link href={`/profile/${post.user._id}`}
          className="absolute top-2 left-2 z-10 flex items-center space-x-2">
          <img
            src={post.user.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'}
            alt={post.user.name || post.user.username || 'User'}
            className="w-8 h-8 rounded-full border-2 border-white shadow"
          />
        </Link>
      ) : (
        <span className="absolute top-2 left-2 z-10 flex items-center space-x-2">
          <img
            src={'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'}
            alt={'User'}
            className="w-8 h-8 rounded-full border-2 border-white shadow"
          />
        </span>
      )}
      {/* Image */}
      <div className="aspect-square" onDoubleClick={handleDoubleClick} style={{ cursor: 'pointer' }}>
        <img
          src={post.image_url}
          alt={post.caption}
          className="w-full h-full object-cover select-none"
        />
        {/* Optional: Like animation overlay */}
        {likeAnimating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart className="w-24 h-24 text-red-500 opacity-80 animate-ping" fill="red" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Caption */}
        {post.caption && (
          <p className="text-gray-800">{post.caption}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleLike}
              className={`flex items-center space-x-1 transition-colors duration-200 ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5`} fill={isLiked ? 'red' : 'none'} />
              <span className="text-sm">{post.likes.length}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors duration-200"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{comments.length}</span>
            </button>
          </div>
          <span className="text-xs text-gray-400">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-3 pt-3 border-t border-gray-200">
            {/* Add Comment */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentInput}
                onChange={(e) => onCommentChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onAddComment()}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={onAddComment}
                disabled={!commentInput.trim()}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start justify-between space-x-2">
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{comment.content}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {comment.user_id === currentUserId && (
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}