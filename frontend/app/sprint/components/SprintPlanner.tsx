'use client';

import { useState } from 'react';

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
  const [capacity, setCapacity] = useState<number>(0);
  const [proposedTickets, setProposedTickets] = useState<Ticket[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);

  const handlePlanSprint = async () => {
    if (capacity <= 0) {
      alert('Please enter a valid capacity (greater than 0)');
      return;
    }

    setIsPlanning(true);
    // TODO: Implement AI planning logic here
    // For now, just set empty array as placeholder
    setTimeout(() => {
      setProposedTickets([]);
      setIsPlanning(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Capacity Input and Plan Button Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="capacity" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Sprint Capacity (Story Points)
            </label>
            <input
              type="number"
              id="capacity"
              min="0"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              placeholder="Enter capacity"
            />
          </div>
          <button
            onClick={handlePlanSprint}
            disabled={isPlanning || capacity <= 0}
            className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isPlanning ? 'Planning...' : 'Plan sprint with AI'}
          </button>
        </div>
      </div>

      {/* Backlog Tickets Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">
          Backlog Tickets ({backlogTickets.length})
        </h2>
        {backlogTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Story Points
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {backlogTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <td className="px-4 py-3 text-sm font-medium text-black dark:text-zinc-50">
                      {ticket.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {ticket.type}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {ticket.priority}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {ticket.story_points ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No backlog tickets available.</p>
        )}
      </div>

      {/* Proposed Sprint Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">
          Proposed Sprint
        </h2>
        {proposedTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Story Points
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {proposedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <td className="px-4 py-3 text-sm font-medium text-black dark:text-zinc-50">
                      {ticket.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {ticket.type}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {ticket.priority}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {ticket.story_points ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No proposed tickets yet. Click "Plan sprint with AI" to generate a sprint plan.
          </p>
        )}
      </div>
    </div>
  );
}

