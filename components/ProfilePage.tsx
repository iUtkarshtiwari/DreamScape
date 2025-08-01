"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Mail, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Grid3X3,
  Heart,
  Upload,
  MessageCircle,
  Send,
  Trash2
} from 'lucide-react';

interface Post {
  id: string;
  image_url: string;
  caption: string;
  likes: string[];
  created_at: string;
}

export default function ProfilePage() {
  const { user, updateProfile, token } = useAuth();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [postCount, setPostCount] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar_url: user?.avatar_url || '',
  });
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    image_url: '',
    caption: '',
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [comments, setComments] = useState<{ [postId: string]: any[] }>({});
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [postId: string]: boolean }>({});
  const [modalPost, setModalPost] = useState<Post | null>(null);
  const [modalComments, setModalComments] = useState<any[]>([]);
  const [modalCommentInput, setModalCommentInput] = useState('');
  const [modalIsLiked, setModalIsLiked] = useState(false);
  const [modalLikeCount, setModalLikeCount] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  // Add state for custom avatar file
  const [customAvatarFile, setCustomAvatarFile] = useState<File | null>(null);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user && token) {
      setFormData({
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url || '',
      });
      loadUserPosts();
    }
  }, [user, token]);

  const loadUserPosts = async () => {
    if (!user || !token) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/my-posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUserPosts(data.posts);
        setPostCount(data.postCount);
        setTotalLikes(data.totalLikes);
        data.posts.forEach((post: any) => loadComments(post.id));
      }
    } catch (error) {
      console.error('Failed to load user posts:', error);
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

  const handleSave = async () => {
    let avatarUrl = formData.avatar_url;
    // If a custom avatar file is selected, upload it
    if (customAvatarFile) {
      const uploadData = new FormData();
      uploadData.append('image', customAvatarFile);
      // You need an endpoint to handle avatar uploads, e.g., /api/upload-avatar
      const response = await fetch('http://localhost:4000/api/upload-avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });
      const data = await response.json();
      if (data.success && data.url) {
        avatarUrl = data.url;
      }
    }
    const success = await updateProfile({ ...formData, avatar_url: avatarUrl });
    if (success) {
      setIsEditing(false);
      setCustomAvatarFile(null);
      setCustomAvatarPreview(null);
      // Removed window.location.reload();
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url || '',
      });
    }
    setIsEditing(false);
  };

  const createPost = async () => {
    if (!token || !uploadFile) return;
    try {
      const formData = new FormData();
      formData.append('image', uploadFile);
      formData.append('caption', uploadData.caption);
      const response = await fetch('http://localhost:4000/api/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setUserPosts([data.post, ...userPosts]);
        setUploadData({ image_url: '', caption: '' });
        setUploadFile(null);
        setShowUploadForm(false);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  // Add a function to handle file input and store the file
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadData((prev) => ({ ...prev, image_url: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Add a function to handle custom avatar file input
  const handleCustomAvatarInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomAvatarPreview(event.target?.result as string);
      setFormData((prev) => ({ ...prev, avatar_url: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
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
        setUserPosts(userPosts.map(post => post.id === postId ? data.post : post));
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
          [postId]: [...(prev[postId] || []), data.comment],
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

  const openPostModal = async (post: Post) => {
    if (!user) return;
    setModalPost(post);
    setModalIsLiked(post.likes.includes(user.id));
    setModalLikeCount(post.likes.length);
    // Fetch comments for this post
    try {
      const response = await fetch(`http://localhost:4000/api/comments?postId=${post.id}`);
      const data = await response.json();
      if (data.success) {
        setModalComments(data.comments);
      } else {
        setModalComments([]);
      }
    } catch {
      setModalComments([]);
    }
  };

  const closePostModal = () => {
    setModalPost(null);
    setModalComments([]);
    setModalCommentInput('');
  };

  const handleModalLike = async () => {
    if (!token || !modalPost || !user) return;
    try {
      if (modalIsLiked) {
        // Unlike
        const response = await fetch(`http://localhost:4000/api/posts/${modalPost.id}/like`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setModalIsLiked(false);
          setModalLikeCount(data.post.likes.length);
          setUserPosts(userPosts.map(p => p.id === modalPost.id ? data.post : p));
        }
      } else {
        // Like
        const response = await fetch(`http://localhost:4000/api/posts/${modalPost.id}/like`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setModalIsLiked(true);
          setModalLikeCount(data.post.likes.length);
          setUserPosts(userPosts.map(p => p.id === modalPost.id ? data.post : p));
        }
      }
    } catch {}
  };

  const handleModalAddComment = async () => {
    if (!token || !modalPost || !modalCommentInput.trim()) return;
    try {
      const response = await fetch('http://localhost:4000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          post_id: modalPost.id,
          content: modalCommentInput,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setModalComments([...modalComments, data.comment]);
        setModalCommentInput('');
      }
    } catch {}
  };

  const handleModalDeleteComment = async (commentId: string) => {
    if (!token || !modalPost) return;
    try {
      const response = await fetch(`http://localhost:4000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setModalComments(modalComments.filter(comment => comment.id !== commentId));
      }
    } catch {}
  };

  // Sample avatar URLs for selection
  const sampleAvatars = [
    'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  ];

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Profile
      </h1>
      {/* Upload Post Button */}
      <button
        onClick={() => setShowUploadForm(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
      >
        <Upload className="w-4 h-4" />
        <span>Upload Post</span>
      </button>
      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold mb-4">Upload New Post</h3>
          <div className="space-y-4">
            {/* File input for image upload */}
            <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {uploadData.image_url && (
              <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={uploadData.image_url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <textarea
              placeholder="Write a caption for your image..."
              value={uploadData.caption}
              onChange={(e) => setUploadData({ ...uploadData, caption: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUploadForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={createPost}
                disabled={!uploadFile}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Info */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src={formData.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
            {isEditing && (
              <button
                onClick={() => {
                  // Show avatar selection modal (simplified for demo)
                  const newAvatar = sampleAvatars[Math.floor(Math.random() * sampleAvatars.length)];
                  setFormData({ ...formData, avatar_url: newAvatar });
                }}
                className="absolute -bottom-2 -right-2 p-2 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-colors duration-200"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username (Fixed)
                  </label>
                  <input
                    type="text"
                    value={user.username}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                
                {/* Avatar Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Avatar
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {sampleAvatars.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setFormData({ ...formData, avatar_url: url });
                          setCustomAvatarFile(null);
                          setCustomAvatarPreview(null);
                        }}
                        className={`w-16 h-16 rounded-full overflow-hidden border-3 transition-all duration-200 ${
                          formData.avatar_url === url 
                            ? 'border-purple-500 scale-110' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Avatar ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomAvatarInput}
                      className="block"
                    />
                    {customAvatarPreview && (
                      <img
                        src={customAvatarPreview}
                        alt="Custom Avatar Preview"
                        className="w-12 h-12 rounded-full border-2 border-purple-500"
                      />
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-gray-600">@{user.username}</p>
                  <div className="flex items-center justify-center md:justify-start space-x-1 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-center md:justify-start space-x-6">
                  <div className="text-center md:text-left">
                    <div className="text-2xl font-bold text-gray-900">{postCount}</div>
                    <div className="text-sm text-gray-600">Posts</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-2xl font-bold text-gray-900">{totalLikes}</div>
                    <div className="text-sm text-gray-600">Likes</div>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 mx-auto md:mx-0"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Posts */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Grid3X3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">My Posts</h3>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="text-center py-12">
            <Grid3X3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h4>
            <p className="text-gray-500">Share your first image in the Explore section!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userPosts.map((post) => {
              const isLiked = post.likes.includes(user.id);
              return (
                <div key={post.id} className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => openPostModal(post)}>
                  <img
                    src={post.image_url}
                    alt={post.caption}
                    className="w-full h-full object-cover"
                  />
                  {/* Likes count badge */}
                  <div className="absolute top-2 right-2 bg-white/80 text-purple-600 font-bold px-3 py-1 rounded-full shadow text-sm">
                    {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
                  </div>
                  {post.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-sm truncate">{post.caption}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Modal for post detail, comments, and like */}
      {modalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={closePostModal}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative"
            onClick={e => e.stopPropagation()}
            ref={modalRef}
          >
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={closePostModal}>
              <X className="w-6 h-6" />
            </button>
            <img src={modalPost.image_url} alt={modalPost.caption} className="w-full rounded-lg mb-4" />
            <div className="flex items-center space-x-4 mb-2">
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                {modalLikeCount} {modalLikeCount === 1 ? 'Like' : 'Likes'}
              </span>
              <button
                onClick={handleModalLike}
                className={`flex items-center space-x-1 ${modalIsLiked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'}`}
              >
                <Heart className={`w-6 h-6 ${modalIsLiked ? 'fill-current' : ''}`} />
              </button>
              <span className="text-xs text-gray-400">{new Date(modalPost.created_at).toLocaleDateString()}</span>
            </div>
            <div className="mb-2">
              <p className="text-gray-800 font-semibold">{modalPost.caption}</p>
            </div>
            {/* Comments Section */}
            <div className="border-t pt-3 mt-3">
              <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
                {modalComments.map((comment) => (
                  <div key={comment.id} className="flex items-start justify-between space-x-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{comment.content}</p>
                      <p className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</p>
                    </div>
                    {comment.user_id === user.id && (
                      <button
                        onClick={() => handleModalDeleteComment(comment.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={modalCommentInput}
                  onChange={e => setModalCommentInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleModalAddComment()}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleModalAddComment}
                  disabled={!modalCommentInput.trim()}
                  className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}