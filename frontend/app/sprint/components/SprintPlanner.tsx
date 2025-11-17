'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface Ticket {
  id: string;
  title: string;
  description: string | null;
  type: string;
  priority: string;
  story_points: number | null;
  status: string;
}

interface SprintPlannerProps {
  backlogTickets: Ticket[];
}

export default function SprintPlanner({ backlogTickets }: SprintPlannerProps) {
  const router = useRouter();
  const [capacity, setCapacity] = useState<number>(0);
  const [plannedSprint, setPlannedSprint] = useState<{ tickets: Ticket[]; total_points: number } | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalize whatever the AI / n8n returned into a tickets array
  function normalizeSprintResponse(raw: any) {
    let data = raw;

    // If n8n sent us a JSON string (because of JSON.stringify($json)), parse it
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (err) {
        console.error("Failed to JSON.parse AI response string:", data, err);
        throw new Error("Invalid JSON returned from AI service");
      }
    }

    // Now data should be object or array
    if (data == null) {
      throw new Error("AI response is empty");
    }

    let tickets: any[] = [];
    let totalPoints: number | undefined;

    // Format 1: { sprint_tickets: [...], total_points?: number }
    if (Array.isArray((data as any).sprint_tickets)) {
      tickets = (data as any).sprint_tickets;
      totalPoints = (data as any).total_points;
    }
    // Format 2: { tickets: [...], total_points?: number }
    else if (Array.isArray((data as any).tickets)) {
      tickets = (data as any).tickets;
      totalPoints = (data as any).total_points;
    }
    // Format 3: plain array: [ ... ]
    else if (Array.isArray(data)) {
      tickets = data as any[];
    } else {
      console.error("Unexpected AI response shape:", data);
      throw new Error("Invalid response format from AI service");
    }

    return { tickets, totalPoints };
  }

  const handlePlanSprint = async () => {
    if (!backlogTickets.length) {
      setError("Add some tickets before planning a sprint.");
      return;
    }

    setIsPlanning(true);
    setError(null);

    try {
      const n8nUrl = process.env.NEXT_PUBLIC_N8N_PLAN_SPRINT_URL;

      if (!n8nUrl) {
        throw new Error("N8N Plan Sprint URL is not configured");
      }

      const response = await fetch(n8nUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tickets: backlogTickets,
          capacity: capacity,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error("AI sprint planner HTTP error:", response.status, text);
        throw new Error(`AI sprint planner failed (${response.status})`);
      }

      // IMPORTANT: n8n is returning a JSON STRING from JSON.stringify($json)
      const raw = await response.text();
      const { tickets: plannedTickets, totalPoints } = normalizeSprintResponse(raw);

      // Save whatever shape your UI expects
      setPlannedSprint({
        tickets: plannedTickets,
        total_points:
          typeof totalPoints === "number"
            ? totalPoints
            : plannedTickets.reduce(
                (sum, t) => sum + (Number(t.story_points) || 0),
                0
              ),
      });

      setError(null);
    } catch (error) {
      console.error("Error planning sprint:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to plan sprint. Please try again.";
      setError(errorMessage);
    } finally {
      setIsPlanning(false);
    }
  };

  const totalPoints = plannedSprint?.total_points ?? 0;

  const handleStartSprint = async () => {
    if (!plannedSprint || plannedSprint.tickets.length === 0) {
      alert('No tickets selected to start sprint');
      return;
    }

    setIsStarting(true);
    setError(null);

    try {
      // Create a new sprint
      const { data: sprint, error: sprintError } = await supabase
        .from('sprints')
        .insert([
          {
            capacity,
            total_story_points: plannedSprint.total_points,
          },
        ])
        .select()
        .single();

      if (sprintError) throw sprintError;

      if (!sprint) {
        throw new Error('Failed to create sprint');
      }

      // Update all selected tickets to status = "in_sprint" and set sprint_id
      const ticketIds = plannedSprint.tickets.map((ticket) => ticket.id);
      const { error: updateError } = await supabase
        .from('tickets')
        .update({
          status: 'in_sprint',
          sprint_id: sprint.id,
        })
        .in('id', ticketIds);

      if (updateError) throw updateError;

      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error('Error starting sprint:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start sprint. Please try again.';
      setError(errorMessage);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-lg">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-2">
            AI Sprint Planner
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {backlogTickets.length} ticket{backlogTickets.length !== 1 ? 's' : ''} in backlog
          </p>
        </div>

        {/* Capacity Input and Plan Button */}
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label
              htmlFor="capacity"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Sprint Capacity (Story Points)
            </label>
            <input
              type="number"
              id="capacity"
              min="1"
              value={capacity || ''}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
              placeholder="Enter sprint capacity"
            />
          </div>
          <button
            onClick={handlePlanSprint}
            disabled={isPlanning || capacity <= 0}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isPlanning ? 'Planning...' : 'Plan Sprint with AI'}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Results Panel */}
        {plannedSprint && plannedSprint.tickets.length > 0 && (
          <div className="mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800 shadow-md">
              <div className="p-6">
                {/* Panel Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-black dark:text-zinc-50 mb-1">
                      AI-Selected Sprint
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {plannedSprint.tickets.length} ticket{plannedSprint.tickets.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {totalPoints}
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        / {capacity} story points
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((totalPoints / capacity) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Start Sprint Button */}
                <div className="mb-6 flex justify-end">
                  <button
                    onClick={handleStartSprint}
                    disabled={isStarting || !plannedSprint || plannedSprint.tickets.length === 0}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isStarting ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Starting Sprint...</span>
                      </>
                    ) : (
                      <span>Start Sprint</span>
                    )}
                  </button>
                </div>

                {/* Tickets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plannedSprint.tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-black dark:text-zinc-50 mb-2 line-clamp-2">
                            {ticket.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                            <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded capitalize">
                              {ticket.type}
                            </span>
                            <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded capitalize">
                              {ticket.priority}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">Story Points</span>
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold">
                            {ticket.story_points || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isPlanning && !error && (!plannedSprint || plannedSprint.tickets.length === 0) && (
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
            <div className="text-center py-12">
              <p className="text-zinc-500 dark:text-zinc-400 mb-2">
                Enter a sprint capacity and click "Plan Sprint with AI" to generate a sprint plan.
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isPlanning && (
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-zinc-500 dark:text-zinc-400">
                Planning your sprint...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

