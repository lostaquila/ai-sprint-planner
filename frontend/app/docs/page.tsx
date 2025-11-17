import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';

export default function DocumentationPage() {
  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'tech-stack', title: 'Tech Stack' },
    { id: 'how-to-use', title: 'How to Use' },
    { id: 'agentic-workflows', title: 'Agentic Workflows' },
    { id: 'database', title: 'Database' },
    { id: 'deployment', title: 'Deployment' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 font-sans transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b-2 border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity duration-200"
          >
            Momentum AI
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors duration-200"
            >
              Back to App
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-12 animate-slide-in">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
            Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Complete guide to using Momentum AI Sprint Planner
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-6 shadow-lg transition-colors duration-300 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
            Table of Contents
          </h2>
          <nav className="space-y-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 hover:translate-x-2"
              >
                → {section.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Overview Section */}
          <section id="overview" className="scroll-mt-24 bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8 shadow-lg transition-colors duration-300 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-xl flex items-center justify-center shadow-md transition-colors duration-300">
                <span className="text-2xl">📘</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                Overview
              </h2>
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-4 transition-colors duration-300">
                <strong className="text-indigo-600 dark:text-indigo-400">Momentum AI</strong> is an AI-powered sprint planning tool designed to streamline agile development workflows.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg transition-colors duration-300">
                The application converts feature specifications into structured user stories and plans optimal sprints using intelligent agent workflows. It helps development teams plan smarter and sprint faster by automating ticket creation and sprint planning.
              </p>
            </div>
          </section>

          {/* Tech Stack Section */}
          <section id="tech-stack" className="scroll-mt-24 bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8 shadow-lg transition-colors duration-300 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-600 dark:from-blue-600 dark:to-teal-700 rounded-xl flex items-center justify-center shadow-md transition-colors duration-300">
                <span className="text-2xl">⚙️</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                Tech Stack
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Next.js 16', description: 'React framework for frontend', color: 'from-black to-gray-800 dark:from-gray-700 dark:to-gray-900' },
                { name: 'Supabase', description: 'Backend database and authentication', color: 'from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700' },
                { name: 'Tailwind CSS', description: 'Utility-first CSS framework', color: 'from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700' },
                { name: 'n8n', description: 'Agentic AI workflows and automation', color: 'from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700' },
                { name: 'OpenRouter', description: 'LLM backend and model routing', color: 'from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700' },
                { name: 'Cursor', description: 'AI coding environment', color: 'from-gray-500 to-slate-600 dark:from-gray-600 dark:to-slate-700' },
              ].map((tech, index) => (
                <div
                  key={tech.name}
                  className="group p-6 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tech.color} mb-3 flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110`}>
                    <span className="text-white font-bold text-lg">{tech.name.charAt(0)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
                    {tech.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    {tech.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* How to Use Section */}
          <section id="how-to-use" className="scroll-mt-24 bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8 shadow-lg transition-colors duration-300 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 rounded-xl flex items-center justify-center shadow-md transition-colors duration-300">
                <span className="text-2xl">🚀</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                How to Use
              </h2>
            </div>
            <div className="space-y-6">
              {[
                {
                  step: '1',
                  title: 'Navigate to the Backlog',
                  description: 'Go to the main page to view all tickets organized in a Kanban board. You can create tickets manually or use AI generation.',
                },
                {
                  step: '2',
                  title: 'Generate Tickets with AI',
                  description: 'Enter a feature specification in the AI generation section and click "Generate tickets with AI" to automatically convert specs into structured story cards.',
                },
                {
                  step: '3',
                  title: 'Plan Your Sprint',
                  description: 'Navigate to the Sprint Planning page, enter your sprint capacity in story points, and click "Plan Sprint with AI" to get an optimized sprint plan.',
                },
                {
                  step: '4',
                  title: 'Start Sprint',
                  description: 'Review the AI-selected tickets and click "Start Sprint" to commit the plan. Selected tickets will be moved to "In Sprint" status.',
                },
              ].map((item, index) => (
                <div
                  key={item.step}
                  className="flex gap-4 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30 hover:shadow-md transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed transition-colors duration-300">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Agentic Workflows Section */}
          <section id="agentic-workflows" className="scroll-mt-24 bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8 shadow-lg transition-colors duration-300 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 rounded-xl flex items-center justify-center shadow-md transition-colors duration-300">
                <span className="text-2xl">🧠</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                Agentic Workflows
              </h2>
            </div>
            <div className="space-y-6">
              <div className="p-6 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 transition-colors duration-300">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 transition-colors duration-300">
                  <code className="px-3 py-1 bg-purple-200 dark:bg-purple-900 rounded-lg text-purple-800 dark:text-purple-200 font-mono text-sm">
                    /api/generate
                  </code>
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  <strong>Purpose:</strong> Converts feature specifications into structured tickets
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  <strong>Input:</strong> <code className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-sm">{'{ spec: string }'}</code>
                </p>
                <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  <strong>Output:</strong> Array of ticket objects with title, description, type, priority, and story points
                </p>
              </div>
              <div className="p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 transition-colors duration-300">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 transition-colors duration-300">
                  <code className="px-3 py-1 bg-blue-200 dark:bg-blue-900 rounded-lg text-blue-800 dark:text-blue-200 font-mono text-sm">
                    /api/ai/plan-sprint
                  </code>
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  <strong>Purpose:</strong> Plans an optimized sprint based on capacity and backlog
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  <strong>Input:</strong> <code className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-sm">{'{ tickets: Ticket[], capacity: number }'}</code>
                </p>
                <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  <strong>Output:</strong> Selected tickets with total story points that fit within capacity
                </p>
              </div>
            </div>
          </section>

          {/* Database Section */}
          <section id="database" className="scroll-mt-24 bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8 shadow-lg transition-colors duration-300 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 dark:from-teal-600 dark:to-emerald-700 rounded-xl flex items-center justify-center shadow-md transition-colors duration-300">
                <span className="text-2xl">💾</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                Database
              </h2>
            </div>
            
            <div className="space-y-6">
              {/* Tickets Table */}
              <div className="p-6 rounded-xl border-2 border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 transition-colors duration-300">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
                  <code className="px-3 py-1 bg-teal-200 dark:bg-teal-900 rounded-lg text-teal-800 dark:text-teal-200 font-mono">tickets</code> Table
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-teal-200 dark:border-teal-800">
                        <th className="px-4 py-3 text-gray-900 dark:text-gray-100 font-bold transition-colors duration-300">Field</th>
                        <th className="px-4 py-3 text-gray-900 dark:text-gray-100 font-bold transition-colors duration-300">Type</th>
                        <th className="px-4 py-3 text-gray-900 dark:text-gray-100 font-bold transition-colors duration-300">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-teal-200 dark:divide-teal-800">
                      {[
                        { field: 'id', type: 'uuid', desc: 'Unique identifier' },
                        { field: 'title', type: 'text', desc: 'Ticket title' },
                        { field: 'description', type: 'text', desc: 'Detailed description (optional)' },
                        { field: 'type', type: 'text', desc: 'Ticket type (FEATURE, BUG, CHORE)' },
                        { field: 'priority', type: 'text', desc: 'Priority level (low, medium, high, critical)' },
                        { field: 'story_points', type: 'integer', desc: 'Estimated story points' },
                        { field: 'status', type: 'text', desc: 'Current status (backlog, in_sprint, in_progress, done)' },
                        { field: 'sprint_id', type: 'uuid', desc: 'Associated sprint ID (nullable)' },
                        { field: 'created_at', type: 'timestamp', desc: 'Creation timestamp' },
                        { field: 'updated_at', type: 'timestamp', desc: 'Last update timestamp' },
                      ].map((row) => (
                        <tr key={row.field} className="hover:bg-teal-50/50 dark:hover:bg-teal-950/30 transition-colors duration-200">
                          <td className="px-4 py-3">
                            <code className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                              {row.field}
                            </code>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 transition-colors duration-300">{row.type}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400 transition-colors duration-300">{row.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sprints Table */}
              <div className="p-6 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 transition-colors duration-300">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
                  <code className="px-3 py-1 bg-indigo-200 dark:bg-indigo-900 rounded-lg text-indigo-800 dark:text-indigo-200 font-mono">sprints</code> Table
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-indigo-200 dark:border-indigo-800">
                        <th className="px-4 py-3 text-gray-900 dark:text-gray-100 font-bold transition-colors duration-300">Field</th>
                        <th className="px-4 py-3 text-gray-900 dark:text-gray-100 font-bold transition-colors duration-300">Type</th>
                        <th className="px-4 py-3 text-gray-900 dark:text-gray-100 font-bold transition-colors duration-300">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-200 dark:divide-indigo-800">
                      {[
                        { field: 'id', type: 'uuid', desc: 'Unique identifier' },
                        { field: 'capacity', type: 'integer', desc: 'Sprint capacity in story points' },
                        { field: 'total_story_points', type: 'integer', desc: 'Total story points in sprint' },
                        { field: 'created_at', type: 'timestamp', desc: 'Creation timestamp' },
                        { field: 'updated_at', type: 'timestamp', desc: 'Last update timestamp' },
                      ].map((row) => (
                        <tr key={row.field} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors duration-200">
                          <td className="px-4 py-3">
                            <code className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                              {row.field}
                            </code>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 transition-colors duration-300">{row.type}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400 transition-colors duration-300">{row.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Deployment Section */}
          <section id="deployment" className="scroll-mt-24 bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8 shadow-lg transition-colors duration-300 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 rounded-xl flex items-center justify-center shadow-md transition-colors duration-300">
                <span className="text-2xl">🛠️</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                Deployment
              </h2>
            </div>
            <div className="space-y-4">
              <div className="p-6 rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 transition-colors duration-300">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 transition-colors duration-300">
                  Hosting Platform
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  The application is hosted on <strong className="text-orange-600 dark:text-orange-400">Vercel</strong>, providing seamless deployment from Git commits.
                </p>
              </div>
              <div className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 transition-colors duration-300">
                  GitHub Repository
                </h3>
                <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  Source code is available on GitHub. <span className="text-gray-500 dark:text-gray-500 italic">[Add repository link here]</span>
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Back to Top Button */}
        <div className="mt-12 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Back to Top
          </a>
        </div>
      </main>
    </div>
  );
}

