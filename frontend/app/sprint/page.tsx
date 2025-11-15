import { createServerClient } from '@/lib/supabaseServer';
import SprintPlanner from './components/SprintPlanner';

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
      <div className="p-4 text-red-600">
        Error loading tickets: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <main className="w-full max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-6">Sprint Planning</h1>
        
        <SprintPlanner backlogTickets={tickets || []} />
      </main>
    </div>
  );
}

