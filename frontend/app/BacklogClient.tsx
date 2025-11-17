'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [extractedPdfText, setExtractedPdfText] = useState<string>('');
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      console.log('[extractTextFromPdf] Starting PDF extraction for file:', file.name, file.size);
      
      // Dynamically import pdfjs-dist only on client side
      const pdfjsLib = await import('pdfjs-dist');
      console.log('[extractTextFromPdf] PDF.js library loaded, version:', pdfjsLib.version);
      
      // Set up PDF.js worker - pdfjs-dist v5.x uses ES modules
      // Try different worker paths for compatibility
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        // For v5.x, worker files may be in different locations
        // Try multiple CDN paths and file extensions
        const workerPaths = [
          `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`,
          `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`,
          `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`,
          `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`,
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`,
        ];
        
        // Set to first option (will try to load it)
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerPaths[0];
        console.log('[extractTextFromPdf] Worker URL set to:', workerPaths[0]);
      }
      
      const arrayBuffer = await file.arrayBuffer();
      console.log('[extractTextFromPdf] File array buffer created, size:', arrayBuffer.byteLength);
      
      // Load PDF document with optimized settings
      // Try without worker first for better compatibility
      let loadingTask;
      try {
        // First attempt: try with worker disabled for maximum compatibility
        loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          useWorkerFetch: false,
          isEvalSupported: false,
          useSystemFonts: false,
          verbosity: 0,
        });
        console.log('[extractTextFromPdf] Using worker-disabled mode');
      } catch (configError) {
        console.warn('[extractTextFromPdf] Worker-disabled config failed, trying basic config:', configError);
        // Fallback: try with minimal configuration
        loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
        });
        console.log('[extractTextFromPdf] Using basic configuration');
      }
      
      const pdf = await loadingTask.promise;
      console.log('[extractTextFromPdf] PDF loaded successfully, pages:', pdf.numPages);
      
      let fullText = '';

      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`[extractTextFromPdf] Extracting text from page ${i}/${pdf.numPages}`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .filter((str: string) => str.trim().length > 0)
          .join(' ');
        fullText += pageText + '\n\n';
      }

      const extractedText = fullText.trim();
      console.log('[extractTextFromPdf] Text extraction complete, length:', extractedText.length);
      
      if (extractedText.length === 0) {
        console.warn('[extractTextFromPdf] No text extracted from PDF - may be image-based or encrypted');
        throw new Error('No text could be extracted from this PDF. The PDF may be image-based (scanned) or password-protected.');
      }
      
      return extractedText;
    } catch (err) {
      console.error('[extractTextFromPdf] Error details:', err);
      
      // Provide more specific error messages
      if (err instanceof Error) {
        if (err.message.includes('Invalid PDF')) {
          throw new Error('Invalid PDF file. Please ensure the file is a valid, unencrypted PDF.');
        } else if (err.message.includes('password')) {
          throw new Error('This PDF is password-protected. Please remove the password and try again.');
        } else if (err.message.includes('worker')) {
          throw new Error('PDF processing worker failed to load. Please try again or check your internet connection.');
        } else {
          throw new Error(`Failed to extract text from PDF: ${err.message}`);
        }
      }
      
      throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF.');
    }
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF file');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('PDF file size must be less than 10MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setPdfFile(file);
    setPdfFileName(file.name);
    setError(null);
    setIsExtractingPdf(true);

    try {
      const extractedText = await extractTextFromPdf(file);
      setExtractedPdfText(extractedText);
      
      // Append extracted text to existing spec
      if (spec.trim()) {
        setSpec((prev) => prev + '\n\n--- Extracted from PDF ---\n\n' + extractedText);
      } else {
        setSpec(extractedText);
      }
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to process PDF');
      setPdfFile(null);
      setPdfFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsExtractingPdf(false);
    }
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfFileName('');
    setExtractedPdfText('');
    
    // Remove PDF-extracted text from spec if it exists
    if (extractedPdfText && spec.includes('--- Extracted from PDF ---')) {
      const parts = spec.split('--- Extracted from PDF ---');
      setSpec(parts[0].trim());
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateTickets = async () => {
    const finalSpec = spec.trim();
    if (!finalSpec) {
      setError('Please enter a spec or upload a PDF');
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
        body: JSON.stringify({ spec: finalSpec }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate tickets');
      }

      // Success - refresh tickets
      await loadTickets();
      setSpec('');
      setPdfFile(null);
      setPdfFileName('');
      setExtractedPdfText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      medium: 'bg-yellow-400',
      low: 'bg-emerald-500',
    };
    return priorityMap[priority.toLowerCase()] || 'bg-gray-400';
  };

  const getColumnColor = (columnId: string): string => {
    const colorMap: Record<string, string> = {
      backlog: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
      in_sprint: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
      in_progress: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
      done: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
    };
    return colorMap[columnId] || 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700';
  };

  const getColumnHeaderColor = (columnId: string): string => {
    const colorMap: Record<string, string> = {
      backlog: 'text-purple-700 dark:text-purple-300',
      in_sprint: 'text-blue-700 dark:text-blue-300',
      in_progress: 'text-amber-700 dark:text-amber-300',
      done: 'text-emerald-700 dark:text-emerald-300',
    };
    return colorMap[columnId] || 'text-gray-700 dark:text-gray-300';
  };

  const getStatusBorderColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      backlog: 'border-l-4 border-l-purple-500',
      in_sprint: 'border-l-4 border-l-blue-500',
      in_progress: 'border-l-4 border-l-orange-500',
      done: 'border-l-4 border-l-emerald-500',
    };
    return colorMap[status] || 'border-l-4 border-l-gray-400';
  };

  const getTypeBadgeColor = (type: string): string => {
    const normalizedType = type.toLowerCase();
    if (normalizedType.includes('feature') || normalizedType.includes('feat')) {
      return 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    } else if (normalizedType.includes('bug') || normalizedType.includes('fix')) {
      return 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
    } else if (normalizedType.includes('chore') || normalizedType.includes('task')) {
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
    return 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-slide-in">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">Tickets</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Manage your backlog and track progress</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/sprint"
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 transition-all duration-300 ease-out shadow-md hover:shadow-xl hover:scale-105 active:scale-95 hover:-translate-y-0.5 flex items-center gap-2 group"
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Plan Sprint
          </Link>
          <Link
            href="/docs"
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 transition-all duration-300 ease-out shadow-md hover:shadow-xl hover:scale-105 active:scale-95 hover:-translate-y-0.5 flex items-center gap-2 group"
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Docs
          </Link>
          <NewTicketModal />
        </div>
      </div>

      {/* AI Generation Section */}
      <div className="mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 shadow-lg p-6 lg:p-8 animate-fade-in transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-xl flex items-center justify-center shadow-md transition-colors duration-300">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <label htmlFor="spec" className="text-lg font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-300">
            Generate Tickets with AI
          </label>
        </div>
        <textarea
          id="spec"
          rows={4}
          value={spec}
          onChange={(e) => setSpec(e.target.value)}
          placeholder="Describe the features, bugs, or improvements you'd like to create tickets for..."
          className="w-full px-4 py-3 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 resize-none mb-4 shadow-sm transition-all duration-200"
        />
        
        {/* PDF Upload Section */}
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handlePdfUpload}
            className="hidden"
            id="pdf-upload"
            disabled={isExtractingPdf || isGenerating}
          />
          <label
            htmlFor="pdf-upload"
            className={`inline-flex items-center gap-2 px-4 py-2.5 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
              isExtractingPdf || isGenerating
                ? 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-950/50'
            }`}
          >
            {isExtractingPdf ? (
              <>
                <div className="w-5 h-5 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Extracting text from PDF...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm font-medium">+ Attach PDF (optional)</span>
              </>
            )}
          </label>
          
          {/* PDF Preview/Remove */}
          {pdfFileName && !isExtractingPdf && (
            <div className="mt-3 flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 truncate">
                  {pdfFileName}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {extractedPdfText ? `${extractedPdfText.split('\n').filter(line => line.trim()).length} lines extracted` : 'Processing...'}
                </p>
              </div>
              <button
                onClick={handleRemovePdf}
                className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors duration-200 hover:scale-110 active:scale-95"
                title="Remove PDF"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleGenerateTickets}
            disabled={isGenerating || !spec.trim()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-xl hover:scale-105 active:scale-95 hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-md flex items-center gap-2 group"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate tickets with AI
              </>
            )}
          </button>
          {error && (
            <div className="px-4 py-2 bg-red-50 dark:bg-red-950/50 border-2 border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 font-medium animate-slide-in transition-colors duration-300">
              {error}
            </div>
          )}
        </div>
      </div>
      
      {/* Kanban Board */}
      <DragDropContext 
        onDragEnd={(result) => {
          document.body.style.cursor = '';
          handleDragEnd(result);
        }}
        onDragStart={() => {
          document.body.style.cursor = 'grabbing';
        }}
      >
        <div className="overflow-x-auto pb-6 -mx-2 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex gap-5 min-w-fit lg:min-w-0 lg:grid lg:grid-cols-4">
            {COLUMNS.map((column) => {
              const columnTickets = tickets.filter((ticket) => ticket.status === column.id);
              return (
                <Droppable key={column.id} droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-shrink-0 w-80 lg:w-full ${getColumnColor(column.id)} rounded-2xl border-2 p-4 lg:p-5 shadow-lg transition-all duration-300 animate-fade-in ${
                        snapshot.isDraggingOver ? 'ring-2 ring-blue-400 ring-opacity-50 shadow-xl' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-white/60 dark:border-gray-700/60 transition-colors duration-300">
                        <h2 className={`text-lg font-bold ${getColumnHeaderColor(column.id)} flex items-center gap-2 transition-colors duration-300`}>
                          <span className="w-2 h-2 rounded-full bg-current opacity-60"></span>
                          {column.title}
                        </h2>
                        <span className={`px-3 py-1 ${getColumnHeaderColor(column.id)} bg-white dark:bg-gray-800 rounded-full text-xs font-bold shadow-md min-w-[28px] text-center transition-colors duration-300`}>
                          {columnTickets.length}
                        </span>
                      </div>
                      <div className="space-y-3 min-h-[100px] transition-all duration-300">
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
                                  className={`group relative w-full rounded-xl bg-white dark:bg-gray-900 shadow-md text-left cursor-pointer transition-all duration-300 ease-out ${
                                    getStatusBorderColor(ticket.status)
                                  } ${
                                    snapshot.isDragging 
                                      ? 'shadow-2xl rotate-1 scale-[1.02] opacity-90 z-50' 
                                      : 'hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] border-r border-t border-b border-gray-200 dark:border-gray-700'
                                  }`}
                                  style={{
                                    ...provided.draggableProps.style,
                                    transition: snapshot.isDragging 
                                      ? undefined 
                                      : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                  }}
                                >
                                  {/* Card Content */}
                                  <div className="px-4 py-3.5">
                                    {/* Title */}
                                    <div className="font-semibold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 text-sm leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                      {ticket.title}
                                    </div>
                                    
                                    {/* Metadata Badges */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {/* Story Points Badge */}
                                      {ticket.story_points !== null && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold shadow-sm transition-all duration-200 hover:shadow-md">
                                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                          <span>{ticket.story_points}</span>
                                        </span>
                                      )}
                                      
                                      {/* Priority Badge */}
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold shadow-sm transition-all duration-200 hover:shadow-md">
                                        <span className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(ticket.priority)} shadow-sm animate-pulse`} />
                                        <span>{getPriorityLabel(ticket.priority)}</span>
                                      </span>
                                      
                                      {/* Type Badge */}
                                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-semibold uppercase tracking-wide shadow-sm transition-all duration-200 hover:shadow-md ${getTypeBadgeColor(ticket.type)}`}>
                                        {ticket.type}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Drag Handle Indicator */}
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm italic border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-900/50 transition-colors duration-300">
                            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
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

