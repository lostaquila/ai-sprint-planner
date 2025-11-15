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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black dark:text-zinc-50">
            {mode === 'edit' ? 'Edit Ticket' : 'Create New Ticket'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Type *
            </label>
            <input
              type="text"
              id="type"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Priority *
            </label>
            <select
              id="priority"
              required
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            >
              <option value="">Select priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label htmlFor="story_points" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Story Points
            </label>
            <input
              type="number"
              id="story_points"
              min="0"
              value={formData.story_points}
              onChange={(e) => setFormData({ ...formData, story_points: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update Ticket' : 'Create Ticket')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

