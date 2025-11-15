'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import NewTicketModal from './components/NewTicketModal';

interface Ticket {
  id: string;
  title: string;
  type: string;
  priority: string;
  story_points: number | null;
  status: string;
}

interface BacklogClientProps {
  initialTickets: Ticket[];
}

export default function BacklogClient({ initialTickets }: BacklogClientProps) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [spec, setSpec] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTickets = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('tickets')
        .select('id, title, type, priority, story_points, status')
        .in('status', ['backlog', 'in_sprint'])
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      if (data) setTickets(data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  // Load tickets on mount
  useEffect(() => {
    loadTickets();
  }, []);

  // Sync tickets when initialTickets prop changes (e.g., after router.refresh())
  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  const handleGenerateTickets = async () => {
    if (!spec.trim()) {
      setError('Please enter a spec');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spec }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate tickets');
      }

      // Success - refresh tickets
      await loadTickets();
      setSpec('');
    } catch (err) {
      console.error('Error generating tickets:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate tickets');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">Tickets</h1>
        <NewTicketModal />
      </div>

      {/* AI Generation Section */}
      <div className="mb-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
        <label htmlFor="spec" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Generate Tickets with AI
        </label>
        <textarea
          id="spec"
          rows={4}
          value={spec}
          onChange={(e) => setSpec(e.target.value)}
          placeholder="Enter spec for ticket generation..."
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none mb-3"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateTickets}
            disabled={isGenerating || !spec.trim()}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate tickets with AI'}
          </button>
          {error && (
            <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
          )}
        </div>
      </div>
      
      {/* Tickets Table */}
      <div className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Story Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {tickets && tickets.length > 0 ? (
              tickets.map((ticket: Ticket) => (
                <tr key={ticket.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black dark:text-zinc-50">
                    {ticket.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                    {ticket.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                    {ticket.priority}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                    {ticket.story_points ?? '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                      {ticket.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No tickets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

