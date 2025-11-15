import { createServerClient } from '@/lib/supabaseServer';
import BacklogClient from './BacklogClient';

interface Ticket {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  priority: string;
  story_points: number | null;
  status: string;
}

export default async function Home() {
  const supabase = createServerClient();
  
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('id, title, description, type, priority, story_points, status')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tickets:', error);
    return (
      <div className="min-h-screen bg-slate-950 font-sans">
        <main className="min-h-screen py-8">
          <div className="p-4 text-red-400">
            Error loading tickets: {error.message}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <main className="min-h-screen py-8">
        <BacklogClient initialTickets={tickets || []} />
      </main>
    </div>
  );
}
