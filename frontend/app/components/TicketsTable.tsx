import { createServerClient } from '@/lib/supabaseServer';
import NewTicketModal from './NewTicketModal';

interface Ticket {
  id: string;
  title: string;
  type: string;
  priority: string;
  story_points: number | null;
  status: string;
}

export default async function TicketsTable() {
  const supabase = createServerClient();
  
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('id, title, type, priority, story_points, status')
    .in('status', ['backlog', 'in_sprint'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tickets:', error);
    return (
      <div className="p-4 text-red-600">
        Error loading tickets: {error.message}
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">Tickets</h1>
        <NewTicketModal />
      </div>
      
      <div className="overflow-x-auto bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800">
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

