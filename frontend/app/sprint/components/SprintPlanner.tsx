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
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-xl overflow-hidden animate-fade-in transition-colors duration-300">
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                  AI Sprint Planner
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                  {backlogTickets.length} ticket{backlogTickets.length !== 1 ? 's' : ''} in backlog
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Capacity Input and Plan Button */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-6 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label
                htmlFor="capacity"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
              >
                Sprint Capacity (Story Points)
              </label>
              <input
                type="number"
                id="capacity"
                min="1"
                value={capacity || ''}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 shadow-sm"
                placeholder="Enter sprint capacity"
              />
            </div>
            <button
              onClick={handlePlanSprint}
              disabled={isPlanning || capacity <= 0}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-md hover:shadow-xl hover:scale-105 active:scale-95 hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-md flex items-center gap-2 group"
            >
              {isPlanning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Planning...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Plan Sprint with AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/50 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 animate-slide-in transition-colors duration-300">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300 transition-colors duration-300">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Results Panel */}
        {plannedSprint && plannedSprint.tickets.length > 0 && (
          <div className="mt-6 animate-fade-in">
            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/50 dark:via-green-950/50 dark:to-teal-950/50 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 shadow-xl overflow-hidden transition-colors duration-300">
              <div className="p-6 lg:p-8">
                {/* Panel Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 rounded-xl flex items-center justify-center shadow-md transition-colors duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                          AI-Selected Sprint
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                          {plannedSprint.tickets.length} ticket{plannedSprint.tickets.length !== 1 ? 's' : ''} selected
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 px-5 py-3 shadow-sm transition-colors duration-300">
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent transition-colors duration-300">
                        {totalPoints}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">
                        / {capacity} story points
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="w-full bg-white dark:bg-gray-800 rounded-full h-4 overflow-hidden border-2 border-emerald-200 dark:border-emerald-800 shadow-sm transition-colors duration-300">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500 rounded-full transition-all duration-500 ease-out shadow-sm"
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
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 active:from-emerald-800 active:to-teal-800 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-xl hover:scale-105 active:scale-95 hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-md group"
                  >
                    {isStarting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Starting Sprint...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <span>Start Sprint</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Tickets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plannedSprint.tickets.map((ticket, index) => (
                    <div
                      key={ticket.id}
                      className="p-4 bg-white dark:bg-gray-900 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200 animate-fade-in transition-colors duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 text-sm transition-colors duration-300">
                            {ticket.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg capitalize font-medium transition-colors duration-300">
                              {ticket.type}
                            </span>
                            <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg capitalize font-medium transition-colors duration-300">
                              {ticket.priority}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">Story Points</span>
                          <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-bold shadow-sm transition-colors duration-300">
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
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-12 text-center transition-colors duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm transition-colors duration-300">
              <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-1 transition-colors duration-300">
              Ready to plan your sprint?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 transition-colors duration-300">
              Enter a sprint capacity and click "Plan Sprint with AI" to generate a sprint plan.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isPlanning && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-12 text-center transition-colors duration-300">
            <div className="inline-block w-16 h-16 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin mb-4 transition-colors duration-300"></div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold mb-1 transition-colors duration-300">
              Planning your sprint...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
              Our AI is analyzing your backlog and selecting the best tickets.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

