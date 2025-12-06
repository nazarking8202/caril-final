import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, X, Check, LogOut } from 'lucide-react';
import { API_CONFIG } from './config';

interface Task {
  id?: number;
  title: string;
  description: string;
  status: string;
  created_at?: string;
}

interface TaskManagerProps {
  user: any;
  onLogout: () => void;
}

const API_URL = API_CONFIG.API_URL;

const styles = {
  appContainer: { minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' },
  contentWrapper: { maxWidth: '1152px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' as const, gap: '1rem' },
  headerTitle: { fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' },
  headerSubtitle: { color: '#6b7280', marginTop: '0.5rem' },
  btnAddTask: { backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'background-color 0.2s' },
  btnLogout: { backgroundColor: '#dc2626', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'background-color 0.2s' },
  taskGrid: { display: 'grid', gap: '1rem' },
  emptyState: { backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '3rem', textAlign: 'center' as const },
  emptyText: { color: '#6b7280', fontSize: '1.125rem' },
  taskCard: { backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', transition: 'box-shadow 0.2s' },
  taskContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: '1rem' },
  taskInfo: { flex: 1, minWidth: '250px' },
  taskHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' as const },
  taskTitle: { fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' },
  statusBadge: { padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, border: '1px solid' },
  statusPending: { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fcd34d' },
  statusInProgress: { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#93c5fd' },
  statusCompleted: { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#6ee7b7' },
  taskDescription: { color: '#6b7280', marginBottom: '0.75rem' },
  taskDate: { fontSize: '0.875rem', color: '#9ca3af' },
  taskActions: { display: 'flex', gap: '0.5rem' },
  btnAction: { padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s', backgroundColor: 'transparent' },
  btnEdit: { color: '#2563eb' },
  btnDelete: { color: '#dc2626' },
  modalOverlay: { position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 },
  modalContainer: { backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', maxWidth: '28rem', width: '100%', padding: '1.5rem' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  modalTitle: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' },
  btnClose: { color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' },
  formGroup: { marginBottom: '1rem' },
  formLabel: { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' },
  formInput: { width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' },
  formTextarea: { width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem', resize: 'vertical' as const, fontFamily: 'inherit' },
  formSelect: { width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' },
  formActions: { display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' },
  btnCancel: { flex: 1, padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: 'white', cursor: 'pointer', transition: 'background-color 0.2s' },
  btnSubmit: { flex: 1, padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background-color 0.2s' }
};

export default function TaskManager({ user, onLogout }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<Task>({
    title: '',
    description: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}?user_id=${user.id}`);
      const data = await response.json();
      if (data.error) {
        console.error('Error:', data.error);
        setTasks([]);
      } else {
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a task title');
      return;
    }
    
    try {
      if (editingTask) {
        await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: editingTask.id, user_id: user.id })
        });
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, user_id: user.id })
        });
      }
      
      fetchTasks();
      closeModal();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await fetch(API_URL, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, user_id: user.id })
        });
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status
      });
    } else {
      setEditingTask(null);
      setFormData({ title: '', description: '', status: 'pending' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setFormData({ title: '', description: '', status: 'pending' });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return { ...styles.statusBadge, ...styles.statusPending };
      case 'in-progress': return { ...styles.statusBadge, ...styles.statusInProgress };
      case 'completed': return { ...styles.statusBadge, ...styles.statusCompleted };
      default: return styles.statusBadge;
    }
  };

  return (
    <div style={styles.appContainer}>
      <div style={styles.contentWrapper}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>Task Management System</h1>
            <p style={styles.headerSubtitle}>Welcome, <strong>{user.username}</strong>!</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const }}>
            <button onClick={() => openModal()} style={styles.btnAddTask}>
              <Plus size={20} />
              Add New Task
            </button>
            <button onClick={onLogout} style={styles.btnLogout}>
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        <div style={styles.taskGrid}>
          {tasks.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No tasks yet. Create your first task!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} style={styles.taskCard}>
                <div style={styles.taskContent}>
                  <div style={styles.taskInfo}>
                    <div style={styles.taskHeader}>
                      <h3 style={styles.taskTitle}>{task.title}</h3>
                      <span style={getStatusStyle(task.status)}>
                        {task.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p style={styles.taskDescription}>{task.description || 'No description'}</p>
                    {task.created_at && (
                      <p style={styles.taskDate}>
                        Created: {new Date(task.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div style={styles.taskActions}>
                    <button
                      onClick={() => openModal(task)}
                      style={{ ...styles.btnAction, ...styles.btnEdit }}
                      title="Edit"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id!)}
                      style={{ ...styles.btnAction, ...styles.btnDelete }}
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button onClick={closeModal} style={styles.btnClose}>
                <X size={24} />
              </button>
            </div>

            <div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={styles.formInput}
                  placeholder="Enter task title"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={styles.formTextarea}
                  placeholder="Enter task description"
                  rows={4}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={styles.formSelect}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div style={styles.formActions}>
                <button onClick={closeModal} style={styles.btnCancel}>
                  Cancel
                </button>
                <button onClick={handleSubmit} style={styles.btnSubmit}>
                  <Check size={20} />
                  {editingTask ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}