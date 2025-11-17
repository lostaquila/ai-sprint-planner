import { createServerClient } from '@/lib/supabaseServer';
import SprintPlanner from './components/SprintPlanner';
import ThemeToggle from '../components/ThemeToggle';

interface Ticket {
  id: string;
  title: string;
  description: string | null;
  type: string;
  priority: string;
  story_points: number | null;
  status: string;
}

export default async function SprintPage() {
  const supabase = createServerClient();
  
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('id, title, description, type, priority, story_points, status')
    .eq('status', 'backlog')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching backlog tickets:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 font-sans transition-colors duration-300">
        <main className="w-full max-w-5xl mx-auto p-6">
          <div className="bg-red-50 dark:bg-red-950/50 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 font-medium transition-colors duration-300">
            Error loading tickets: {error.message}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 font-sans transition-colors duration-300">
      <main className="w-full max-w-5xl mx-auto p-6 lg:p-8">
        <div className="mb-8 animate-slide-in flex justify-between items-start gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">Sprint Planning</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">AI-powered sprint planning and ticket selection</p>
          </div>
          <ThemeToggle />
        </div>
        <SprintPlanner backlogTickets={tickets || []} />
      </main>
    </div>
  );
}

