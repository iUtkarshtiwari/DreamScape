// Simulated database operations for todos, sketches, posts, etc.

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
}

export interface Sketch {
  id: string;
  user_id: string;
  title: string;
  canvas_data: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string;
  likes: string[];
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

// Simulated in-memory storage
let todos: Todo[] = [];
let sketches: Sketch[] = [];
let posts: Post[] = [
  {
    id: '1',
    user_id: '1',
    image_url: 'https://images.pexels.com/photos/1496372/pexels-photo-1496372.jpeg?auto=compress&cs=tinysrgb&w=600',
    caption: 'Beautiful sunset landscape',
    likes: [],
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    image_url: 'https://images.pexels.com/photos/1612351/pexels-photo-1612351.jpeg?auto=compress&cs=tinysrgb&w=600',
    caption: 'Modern architecture design',
    likes: [],
    created_at: new Date().toISOString(),
  }
];
let comments: Comment[] = [];

// Todo operations
export function getTodosByUser(userId: string): Todo[] {
  return todos.filter(todo => todo.user_id === userId);
}

export function createTodo(todoData: Omit<Todo, 'id' | 'created_at'>): Todo {
  const newTodo: Todo = {
    ...todoData,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  };
  todos.push(newTodo);
  return newTodo;
}

export function updateTodo(id: string, updates: Partial<Todo>): Todo | null {
  const todoIndex = todos.findIndex(todo => todo.id === id);
  if (todoIndex === -1) return null;
  
  todos[todoIndex] = { ...todos[todoIndex], ...updates };
  return todos[todoIndex];
}

export function deleteTodo(id: string): boolean {
  const todoIndex = todos.findIndex(todo => todo.id === id);
  if (todoIndex === -1) return false;
  
  todos.splice(todoIndex, 1);
  return true;
}

// Sketch operations
export function getSketchesByUser(userId: string): Sketch[] {
  return sketches.filter(sketch => sketch.user_id === userId);
}

export function createSketch(sketchData: Omit<Sketch, 'id' | 'created_at'>): Sketch {
  const newSketch: Sketch = {
    ...sketchData,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  };
  sketches.push(newSketch);
  return newSketch;
}

export function getSketchById(id: string): Sketch | null {
  return sketches.find(sketch => sketch.id === id) || null;
}

// Post operations
export function getAllPosts(): Post[] {
  return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getPostsByUser(userId: string): Post[] {
  return posts.filter(post => post.user_id === userId);
}

export function createPost(postData: Omit<Post, 'id' | 'created_at' | 'likes'>): Post {
  const newPost: Post = {
    ...postData,
    id: Date.now().toString(),
    likes: [],
    created_at: new Date().toISOString(),
  };
  posts.push(newPost);
  return newPost;
}

export function toggleLike(postId: string, userId: string): Post | null {
  const postIndex = posts.findIndex(post => post.id === postId);
  if (postIndex === -1) return null;
  
  const post = posts[postIndex];
  const likeIndex = post.likes.indexOf(userId);
  
  if (likeIndex === -1) {
    post.likes.push(userId);
  } else {
    post.likes.splice(likeIndex, 1);
  }
  
  return post;
}

// Comment operations
export function getCommentsByPost(postId: string): Comment[] {
  return comments.filter(comment => comment.post_id === postId);
}

export function createComment(commentData: Omit<Comment, 'id' | 'created_at'>): Comment {
  const newComment: Comment = {
    ...commentData,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  };
  comments.push(newComment);
  return newComment;
}

export function deleteComment(id: string, userId: string): boolean {
  const commentIndex = comments.findIndex(comment => comment.id === id && comment.user_id === userId);
  if (commentIndex === -1) return false;
  
  comments.splice(commentIndex, 1);
  return true;
}