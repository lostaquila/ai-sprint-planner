import { createServerClient } from '@/lib/supabaseServer';
import BacklogClient from './BacklogClient';
import ThemeToggle from './components/ThemeToggle';

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 font-sans transition-colors duration-300">
        {/* Vibrant Header Section */}
        <header className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800 px-6 py-12 lg:py-16 transition-colors duration-300">
          {/* Theme Toggle Button */}
          <div className="absolute top-4 right-4 z-20">
            <ThemeToggle />
          </div>
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating Sparkles */}
            <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-300 rounded-full animate-float-1 opacity-70"></div>
            <div className="absolute top-32 right-20 w-2 h-2 bg-blue-300 rounded-full animate-float-2 opacity-60"></div>
            <div className="absolute bottom-20 left-32 w-2.5 h-2.5 bg-pink-300 rounded-full animate-float-3 opacity-70"></div>
            <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-cyan-300 rounded-full animate-float-4 opacity-60"></div>
            
            {/* AI Icons */}
            <div className="absolute top-20 right-32 animate-float-3 opacity-20">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>

          {/* Header Content */}
          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight animate-slide-in">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-white to-cyan-200 drop-shadow-2xl">
                Momentum AI
              </span>
              <span className="block mt-2 text-white">Plan Smarter, Sprint Faster</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-indigo-100 font-medium mt-4 animate-fade-in">
              AI-Powered Sprint Planning for Modern Teams
            </p>
          </div>
        </header>

        <main className="min-h-screen py-8">
          <div className="max-w-7xl mx-auto p-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 font-medium">
              Error loading tickets: {error.message}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 font-sans transition-colors duration-300">
      {/* Vibrant Header Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800 px-6 py-12 lg:py-16 transition-colors duration-300">
        {/* Theme Toggle Button */}
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Sparkles */}
          <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-300 rounded-full animate-float-1 opacity-70"></div>
          <div className="absolute top-32 right-20 w-2 h-2 bg-blue-300 rounded-full animate-float-2 opacity-60"></div>
          <div className="absolute bottom-20 left-32 w-2.5 h-2.5 bg-pink-300 rounded-full animate-float-3 opacity-70"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-cyan-300 rounded-full animate-float-4 opacity-60"></div>
          <div className="absolute bottom-32 right-16 w-2 h-2 bg-emerald-300 rounded-full animate-float-1 opacity-70"></div>
          
          {/* AI Icons */}
          <div className="absolute top-20 right-32 animate-float-3 opacity-20">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="absolute bottom-24 left-20 animate-float-2 opacity-20">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="absolute top-1/2 left-1/3 animate-float-4 opacity-20">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        {/* Header Content */}
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight animate-slide-in">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-white to-cyan-200 drop-shadow-2xl">
              Momentum AI
            </span>
            <span className="block mt-2 text-white">Plan Smarter, Sprint Faster</span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-indigo-100 font-medium mt-4 animate-fade-in">
            AI-Powered Sprint Planning for Modern Teams
          </p>
          
          {/* Decorative Elements */}
          <div className="flex justify-center items-center gap-2 mt-6 animate-fade-in">
            <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-cyan-300 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-pink-300 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 text-white fill-current" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C300,60 600,40 900,50 C1050,55 1150,45 1200,50 L1200,120 L0,120 Z" className="opacity-30"></path>
            <path d="M0,0 C300,70 600,50 900,60 C1050,65 1150,55 1200,60 L1200,120 L0,120 Z" className="opacity-20"></path>
          </svg>
        </div>
      </header>

      <main className="min-h-screen py-6 lg:py-8">
        <BacklogClient initialTickets={tickets || []} />
      </main>
    </div>
  );
}
