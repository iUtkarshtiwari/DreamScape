"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Check, 
  Trash2, 
  Edit3, 
  X, 
  Save,
  CheckSquare,
  Square
} from 'lucide-react';

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
}

export default function TodoApp() {
  const { token } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/todos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setTodos(data.todos.map((todo: any) => ({ ...todo, id: todo._id })));
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTodo = async () => {
    if (!token || !formData.title.trim()) return;

    try {
      const response = await fetch('http://localhost:4000/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setTodos([{ ...data.todo, id: data.todo._id }, ...todos]);
        setFormData({ title: '', description: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:4000/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (data.success) {
        setTodos(todos.map(todo => todo.id === id ? { ...data.todo, id: data.todo._id } : todo));
        setEditingId(null);
      }
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:4000/api/todos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setTodos(todos.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const toggleComplete = async (todo: Todo) => {
    await updateTodo(todo.id, { completed: !todo.completed });
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setFormData({ title: todo.title, description: todo.description });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '' });
  };

  const saveEdit = async () => {
    if (!editingId || !formData.title.trim()) return;
    await updateTodo(editingId, formData);
    setFormData({ title: '', description: '' });
  };

  const completedTodos = todos.filter(todo => todo.completed);
  const pendingTodos = todos.filter(todo => !todo.completed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            Todo App
          </h1>
          <p className="text-gray-600 mt-1">
            {pendingTodos.length} pending, {completedTodos.length} completed
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Todo</span>
        </button>
      </div>

      {/* Add Todo Form */}
      {showAddForm && (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Todo</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Todo title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={createTodo}
                disabled={!formData.title.trim()}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Add Todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      )}

      {/* Todo Lists */}
      {!isLoading && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Todos */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <Square className="w-5 h-5 text-amber-500" />
              <span>Pending ({pendingTodos.length})</span>
            </h2>
            {pendingTodos.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 text-center">
                <p className="text-gray-500">No pending todos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    isEditing={editingId === todo.id}
                    formData={formData}
                    onToggleComplete={toggleComplete}
                    onStartEdit={startEdit}
                    onCancelEdit={cancelEdit}
                    onSaveEdit={saveEdit}
                    onDelete={deleteTodo}
                    onFormChange={setFormData}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Completed Todos */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-emerald-500" />
              <span>Completed ({completedTodos.length})</span>
            </h2>
            {completedTodos.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 text-center">
                <p className="text-gray-500">No completed todos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    isEditing={editingId === todo.id}
                    formData={formData}
                    onToggleComplete={toggleComplete}
                    onStartEdit={startEdit}
                    onCancelEdit={cancelEdit}
                    onSaveEdit={saveEdit}
                    onDelete={deleteTodo}
                    onFormChange={setFormData}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface TodoCardProps {
  todo: Todo;
  isEditing: boolean;
  formData: { title: string; description: string };
  onToggleComplete: (todo: Todo) => void;
  onStartEdit: (todo: Todo) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: (id: string) => void;
  onFormChange: (data: { title: string; description: string }) => void;
}

function TodoCard({
  todo,
  isEditing,
  formData,
  onToggleComplete,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onFormChange,
}: TodoCardProps) {
  return (
    <div className={`bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 transition-all duration-200 ${
      todo.completed ? 'opacity-75' : ''
    }`}>
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <textarea
            value={formData.description}
            onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          />
          <div className="flex space-x-2">
            <button
              onClick={onSaveEdit}
              className="flex items-center space-x-1 px-3 py-1 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200 text-sm"
            >
              <Save className="w-3 h-3" />
              <span>Save</span>
            </button>
            <button
              onClick={onCancelEdit}
              className="flex items-center space-x-1 px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
            >
              <X className="w-3 h-3" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <button
                onClick={() => onToggleComplete(todo)}
                className={`mt-1 p-1 rounded transition-colors duration-200 ${
                  todo.completed
                    ? 'text-emerald-500 hover:text-emerald-600'
                    : 'text-gray-400 hover:text-emerald-500'
                }`}
              >
                {todo.completed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              </button>
              <div className="flex-1">
                <h3 className={`font-medium ${
                  todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                }`}>
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className={`text-sm mt-1 ${
                    todo.completed ? 'line-through text-gray-400' : 'text-gray-600'
                  }`}>
                    {todo.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(todo.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onStartEdit(todo)}
                className="p-1 text-gray-400 hover:text-blue-500 transition-colors duration-200"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(todo.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}