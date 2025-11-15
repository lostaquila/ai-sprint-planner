'use client';

import { useState, useEffect } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { supabase } from '@/lib/supabaseClient';
import NewTicketModal from './components/NewTicketModal';
import TicketModal from './components/TicketModal';

interface Ticket {
  id: string;
  title: string;
  description?: string | null;
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
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  const COLUMNS = [
    { id: 'backlog', title: 'Backlog' },
    { id: 'in_sprint', title: 'In Sprint' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ];

  const loadTickets = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('tickets')
        .select('id, title, description, type, priority, story_points, status')
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

  async function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const newStatus = destination.droppableId; // 'backlog' | 'in_sprint' | 'in_progress' | 'done'

    // 1) Optimistically update local state (move ticket to newStatus)
    setTickets(prev => {
      return prev.map(t =>
        t.id === draggableId ? { ...t, status: newStatus } : t
      );
    });

    // 2) Persist to Supabase
    const { error } = await supabase
      .from('tickets')
      .update({ status: newStatus })
      .eq('id', draggableId);

    if (error) {
      console.error('Failed to update status', error);
      // Revert state on error
      await loadTickets();
    }
  }

  const getPriorityLabel = (priority: string): string => {
    const priorityMap: Record<string, string> = {
      critical: 'P0',
      high: 'P1',
      medium: 'P2',
      low: 'P3',
    };
    return priorityMap[priority.toLowerCase()] || priority.toUpperCase();
  };

  const getPriorityColor = (priority: string): string => {
    const priorityMap: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500',
    };
    return priorityMap[priority.toLowerCase()] || 'bg-slate-500';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Tickets</h1>
        <NewTicketModal />
      </div>

      {/* AI Generation Section */}
      <div className="mb-6 bg-slate-950 rounded-lg border border-slate-800 p-6">
        <label htmlFor="spec" className="block text-sm font-medium text-slate-300 mb-2">
          Generate Tickets with AI
        </label>
        <textarea
          id="spec"
          rows={4}
          value={spec}
          onChange={(e) => setSpec(e.target.value)}
          placeholder="Enter spec for ticket generation..."
          className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600 resize-none mb-3"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateTickets}
            disabled={isGenerating || !spec.trim()}
            className="px-4 py-2 bg-slate-800 text-slate-100 rounded-lg font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate tickets with AI'}
          </button>
          {error && (
            <span className="text-sm text-red-400">{error}</span>
          )}
        </div>
      </div>
      
      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-fit md:min-w-0 md:grid md:grid-cols-4">
            {COLUMNS.map((column) => {
              const columnTickets = tickets.filter((ticket) => ticket.status === column.id);
              return (
                <Droppable key={column.id} droppableId={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-shrink-0 w-72 md:w-full bg-slate-950 rounded-lg border border-slate-800 p-4"
                    >
                      <h2 className="text-sm font-semibold text-slate-300 mb-3">
                        {column.title} ({columnTickets.length})
                      </h2>
                      <div className="space-y-2">
                        {columnTickets.length > 0 ? (
                          columnTickets.map((ticket, index) => (
                            <Draggable
                              key={ticket.id}
                              draggableId={ticket.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setEditingTicket(ticket)}
                                  className={`w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-left text-xs hover:bg-slate-800 transition cursor-pointer ${
                                    snapshot.isDragging ? 'bg-slate-800 shadow-md' : ''
                                  }`}
                                >
                                  {/* First row: title */}
                                  <div className="font-semibold text-slate-100 mb-1.5 truncate">
                                    {ticket.title}
                                  </div>
                                  {/* Second row: SP, priority, type */}
                                  <div className="flex items-center gap-2">
                                    {ticket.story_points !== null && (
                                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                                        SP: {ticket.story_points}
                                      </span>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                      <span className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(ticket.priority)}`} />
                                      <span className="text-slate-400 text-[10px]">
                                        {getPriorityLabel(ticket.priority)}
                                      </span>
                                    </div>
                                    <span className="text-slate-500 text-[10px] uppercase">
                                      {ticket.type}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <div className="text-xs text-slate-600 text-center py-4">
                            No tickets
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      {/* Edit Ticket Modal */}
      <TicketModal
        isOpen={editingTicket !== null}
        onClose={() => {
          setEditingTicket(null);
          loadTickets();
        }}
        onSuccess={() => {
          setEditingTicket(null);
          loadTickets();
        }}
        initialTicket={editingTicket}
        mode="edit"
      />
    </div>
  );
}

