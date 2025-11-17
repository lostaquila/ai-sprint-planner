'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Ticket {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  priority: string;
  story_points: number | null;
  status?: string;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialTicket?: Ticket | null;
  mode?: 'create' | 'edit';
}

export default function TicketModal({ isOpen, onClose, onSuccess, initialTicket, mode = 'create' }: TicketModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    priority: '',
    story_points: '',
  });

  // Initialize form with initialTicket when in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialTicket) {
      setFormData({
        title: initialTicket.title || '',
        description: initialTicket.description || '',
        type: initialTicket.type || '',
        priority: initialTicket.priority || '',
        story_points: initialTicket.story_points?.toString() || '',
      });
    } else {
      // Reset form for create mode
      setFormData({
        title: '',
        description: '',
        type: '',
        priority: '',
        story_points: '',
      });
    }
  }, [initialTicket, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'edit' && initialTicket) {
        // Update existing ticket
        const { error } = await supabase
          .from('tickets')
          .update({
            title: formData.title,
            description: formData.description,
            type: formData.type,
            priority: formData.priority,
            story_points: formData.story_points ? parseInt(formData.story_points) : null,
          })
          .eq('id', initialTicket.id);

        if (error) throw error;
      } else {
        // Create new ticket
        const { error } = await supabase
          .from('tickets')
          .insert([
            {
              title: formData.title,
              description: formData.description,
              type: formData.type,
              priority: formData.priority,
              story_points: formData.story_points ? parseInt(formData.story_points) : null,
            },
          ]);

        if (error) throw error;
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        type: '',
        priority: '',
        story_points: '',
      });

      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} ticket:`, error);
      alert(`Failed to ${mode === 'edit' ? 'update' : 'create'} ticket. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-modal-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 lg:p-8 animate-modal-scale-in max-h-[90vh] overflow-y-auto transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
              {mode === 'edit' ? 'Edit Ticket' : 'Create New Ticket'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
              {mode === 'edit' ? 'Update ticket details' : 'Add a new item to your backlog'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 rounded-lg p-2 transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <svg className="w-6 h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Title <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
              placeholder="Enter ticket title..."
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 resize-none transition-all duration-200"
              placeholder="Enter ticket description..."
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Type <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="text"
              id="type"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
              placeholder="e.g., FEATURE, BUG, CHORE"
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Priority <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <select
              id="priority"
              required
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
            >
              <option value="">Select priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label htmlFor="story_points" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Story Points
            </label>
            <input
              type="number"
              id="story_points"
              min="0"
              value={formData.story_points}
              onChange={(e) => setFormData({ ...formData, story_points: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
              placeholder="0"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 active:bg-gray-100 dark:active:bg-gray-700 active:scale-95 transition-all duration-200 hover:shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-xl hover:scale-105 active:scale-95 hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-md"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {mode === 'edit' ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                mode === 'edit' ? 'Update Ticket' : 'Create Ticket'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

