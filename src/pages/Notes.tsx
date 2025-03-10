import React, { useState, useEffect, useRef } from "react";
import { Link, Share, CalendarClock, FileText, Image, Search, Plus, Mic, X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AIAnalysisService } from "@/services/aiAnalysisService";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

// Types
interface MemoryItem {
  id: string;
  content: string;
  type: "link" | "text" | "image" | "meeting" | "document";
  timestamp: string;
  metadata?: {
    title?: string;
    description?: string;
    imageUrl?: string;
    tags?: string[];
    source?: string;
  };
  highlights?: string[];
  analyzed: boolean;
}

// Header Icon component
const NotesIcon = () => (
  <div className="flex items-center justify-center">
    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
      <FileText className="h-5 w-5" />
    </div>
  </div>
);

  // Modal to display detailed note information
const NoteDetailModal = ({ 
  isOpen, 
  onClose, 
  item 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  item: MemoryItem | null;
}) => {
  if (!item) return null;
  
  const [status, setStatus] = useState<'pending' | 'reviewed' | 'favorite'>('pending');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Reduzindo a lista de categorias para mostrar apenas as mais relevantes
  const [categories] = useState([
    'Trabalho', 'Pessoal', 'Ideias', 'Projetos', 'Outros'
  ]);

  // Format a more readable timestamp
  const formatDate = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return timestamp;
    }
  };
  
  const isLink = item.type === "link";
  const title = item.metadata?.title || (isLink ? "Link Analisado" : "Nota");

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex flex-col bg-white",
      isOpen ? "block" : "hidden"
    )}>
      {/* Header bar with source and action buttons */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center">
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 mr-2"
          >
            <ChevronLeft className="h-6 w-6 text-gray-500" />
          </button>
        
          {isLink && item.metadata?.source && (
            <div className="flex items-center gap-2">
              <Link className="h-4 w-4 text-indigo-500" />
              <span className="text-sm text-gray-600 font-medium">{item.metadata.source}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
            onClick={() => setStatus(status === 'favorite' ? 'pending' : 'favorite')}
          >
            {status === 'favorite' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            )}
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1 bg-white rounded-lg shadow-lg border border-gray-200">
              <DropdownMenuItem className="px-2 py-2 text-sm rounded-md hover:bg-gray-100">
                Marcar como lido
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 border-t border-gray-200" />
              <DropdownMenuItem className="px-2 py-2 text-sm rounded-md text-red-500 hover:bg-red-50">
                Excluir nota
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      {/* Scrollable content area - com barra de rolagem explícita e estilo de rolagem melhorado */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        maxHeight: '75vh' // Limitando a altura para garantir que a rolagem funcione
      }}>
        {/* Title and metadata section */}
        <div className="p-4 bg-indigo-50/50 border-b border-gray-100 space-y-3">
          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            {title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              {formatDate(item.timestamp)}
            </span>
            
            {isLink && (
              <a 
                href={item.content} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-indigo-600 hover:underline"
              >
                <Link className="h-3.5 w-3.5" />
                Abrir link
              </a>
            )}
          </div>
          
          {/* Category selector */}
          <div className="pt-1">
            <p className="text-xs font-medium text-gray-500 mb-1.5">Categoria:</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(
                    selectedCategory === category ? null : category
                  )}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full border transition-colors",
                    selectedCategory === category 
                      ? "bg-indigo-100 border-indigo-200 text-indigo-800" 
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tags */}
          {item.metadata?.tags && item.metadata.tags.length > 0 && (
            <div className="pt-1">
              <p className="text-xs font-medium text-gray-500 mb-1.5">Tags:</p>
              <div className="flex flex-wrap gap-1.5">
                {item.metadata.tags.map((tag, i) => (
                  <span 
                    key={i} 
                    className="text-xs bg-indigo-100/80 text-indigo-800 px-2.5 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Main content */}
        <div className="p-4 space-y-6">
          {/* Content (URL or Text) */}
          <div className="space-y-4">
            {isLink ? (
              <>
                <div className="flex items-start">
                  {item.metadata?.imageUrl && (
                    <div className="flex-shrink-0">
                      <img 
                        src={item.metadata.imageUrl} 
                        alt={item.metadata.title || "Preview"} 
                        className="h-20 w-20 rounded-lg object-cover mr-4" 
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 break-words font-mono text-xs mb-2">
                      {item.content}
                    </p>
                    
                    {item.metadata?.description && (
                      <div className="bg-white p-3 rounded-lg border border-gray-100">
                        <p className="text-gray-700 text-sm">
                          {item.metadata.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-gray-800 whitespace-pre-wrap">{item.content}</p>
              </div>
            )}
          </div>
          
          {/* AI Analysis - Highlights section (sempre visível mesmo sem destacques) */}
          <div className="mt-6 rounded-xl overflow-hidden border border-indigo-100">
            <div className="py-3 px-4 flex items-center gap-2 bg-indigo-50">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h2 className="text-sm font-semibold text-gray-900">Análise da IA</h2>
            </div>
            
            <div className="p-4 bg-white">
              {item.highlights && item.highlights.length > 0 ? (
                item.highlights.map((highlight, i) => (
                  <div key={i} className="mb-4 last:mb-0 border-l-2 border-indigo-200 pl-3">
                    <p className="text-gray-700 text-sm">{highlight}</p>
                  </div>
                ))
              ) : (
                <div className="border-l-2 border-indigo-200 pl-3">
                  <p className="text-gray-700 text-sm">
                    Esta nota contém informações sobre "{item.content}". 
                    {item.type === "link" ? " Considere abrir o link para ver mais detalhes." : 
                    " Considere adicionar mais contexto para uma análise mais detalhada."}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Suggested actions based on content */}
          <div className="mt-6 rounded-xl overflow-hidden border border-gray-200">
            <div className="py-3 px-4 flex items-center gap-2 bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              <h2 className="text-sm font-semibold text-gray-900">Sugestões</h2>
            </div>
            
            <div className="p-4 bg-white">
              <div className="space-y-2">
                {isLink ? (
                  <>
                    <button className="flex w-full items-center justify-between p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-gray-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                        </svg>
                        Salvar para leitura posterior
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                    <button className="flex w-full items-center justify-between p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-gray-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                        </svg>
                        Adicionar ao planner
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  </>
                ) : (
                  <>
                    <button className="flex w-full items-center justify-between p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-gray-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                        </svg>
                        Transformar em tarefa
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                    <button className="flex w-full items-center justify-between p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-gray-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                        </svg>
                        Agendar
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Add personal notes section */}
        <div className="p-4 border-t border-gray-100">
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <label htmlFor="personalNotes" className="block text-xs font-medium text-gray-700 mb-2">
              Adicionar anotação pessoal
            </label>
            <textarea
              id="personalNotes"
              rows={3}
              className="w-full bg-gray-50 rounded-md border-0 p-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Adicione suas próprias observações sobre este conteúdo..."
            ></textarea>
            <div className="mt-2 flex justify-end">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Salvar anotação
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed bottom action bar */}
      <footer className="border-t border-gray-100 p-3 flex items-center justify-between bg-white shadow-inner">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="min-w-[80px] text-gray-700"
          size="sm"
        >
          Fechar
        </Button>
        
        {isLink && (
          <Button
            className="min-w-[120px] bg-indigo-600 hover:bg-indigo-700 text-white"
            size="sm"
            onClick={() => {
              // Open link in new tab
              window.open(item.content, '_blank');
            }}
          >
            Abrir Link
          </Button>
        )}
      </footer>
    </div>
  );
};

// Note Card Component
const NoteCard: React.FC<{ item: MemoryItem; onClick: () => void }> = ({ item, onClick }) => {
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return format(date, "h:mm a", { locale: ptBR });
    } catch (error) {
      return timestamp;
    }
  };

  const renderContent = () => {
    switch (item.type) {
      case "link":
        return (
          <div className="rounded-lg p-4">
            <div className="flex items-start space-x-3">
              {item.metadata?.imageUrl && (
                <img 
                  src={item.metadata.imageUrl} 
                  alt={item.metadata.title || "Link preview"} 
                  className="h-16 w-16 rounded-lg object-cover" 
                />
              )}
              <div className="flex-1">
                {item.metadata?.source && (
                  <div className="flex items-center space-x-1">
                    {item.metadata.source.includes("instagram") ? (
                      <img src="/instagram-icon.svg" alt="Instagram" className="h-4 w-4" />
                    ) : (
                      <Link className="h-4 w-4 text-indigo-500" />
                    )}
                    <span className="text-xs font-medium text-gray-600">
                      {item.metadata.source}
                    </span>
                  </div>
                )}
                <h3 className="mt-1 font-medium text-gray-900 line-clamp-1">
                  {item.metadata?.title || "Link sem título"}
                </h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {item.metadata?.description || item.content}
                </p>
                
                {item.metadata?.tags && item.metadata.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.metadata.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case "text":
        return (
          <div className="rounded-lg p-4">
            <p className="text-gray-700 line-clamp-3">{item.content}</p>
            
            {item.metadata?.tags && item.metadata.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {item.metadata.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <div className="rounded-lg p-4">
            <p className="text-gray-700 line-clamp-3">{item.content}</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-4"
      onClick={onClick}
    >
      <div className="mb-1 text-xs text-gray-500">
        {formatTimestamp(item.timestamp)}
      </div>
      
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer">
        {renderContent()}
        
        {item.highlights && item.highlights.length > 0 && (
          <div className="border-t border-gray-100 bg-slate-50 p-3">
            <div className="flex items-center mb-2">
              <div className="text-indigo-600">
                <span>✨</span>
              </div>
              <h4 className="ml-2 text-xs font-medium text-gray-700">Destaques</h4>
            </div>
            <p className="text-xs text-gray-700 line-clamp-2">{item.highlights[0]}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Loading Animation
const LoadingAnalysis = () => (
  <div className="flex h-20 items-center justify-center rounded-lg bg-gray-50 p-4">
    <div className="flex items-center space-x-3">
      <div className="h-5 w-5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]"></div>
      <div className="h-5 w-5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.15s]"></div>
      <div className="h-5 w-5 animate-bounce rounded-full bg-indigo-600"></div>
    </div>
  </div>
);

// Main Component
export default function Notes() {
  const [activeTab, setActiveTab] = useState("all");
  const [inputValue, setInputValue] = useState("");
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showInputOptions, setShowInputOptions] = useState(false);
  const [selectedNote, setSelectedNote] = useState<MemoryItem | null>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endOfListRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new items are added
  useEffect(() => {
    if (endOfListRef.current && memories.length > 0) {
      endOfListRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [memories.length]);

  // Filter memories based on active tab
  const getFilteredMemories = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (activeTab) {
      case "today":
        return memories.filter(item => {
          const itemDate = new Date(item.timestamp);
          itemDate.setHours(0, 0, 0, 0);
          return itemDate.getTime() === today.getTime();
        });
      case "memory":
        return memories.filter(item => item.analyzed);
      default:
        return memories;
    }
  };

  // Função para analisar conteúdo com IA - melhorada para garantir que sempre temos análise
  const analyzeContent = async (content: string, type: MemoryItem["type"] = "text") => {
    setIsAnalyzing(true);
    
    // Gerar um novo item de memória
    const newItem: MemoryItem = {
      id: Date.now().toString(),
      content,
      type,
      timestamp: new Date().toISOString(),
      analyzed: false
    };
    
    // Adicionar o item não analisado primeiro
    setMemories(prev => [newItem, ...prev]);
    
    try {
      // Analisar o conteúdo com o serviço de IA
      let analysisResult;
      
      try {
        analysisResult = type === "link" 
          ? await AIAnalysisService.analyzeUrl(content)
          : await AIAnalysisService.analyzeText(content);
      } catch (analysisError) {
        console.error("Erro no serviço de IA, usando análise padrão:", analysisError);
        
        // Usar uma análise padrão se o serviço falhar
        analysisResult = {
          title: type === "link" ? "Link: " + content : "Nota de Texto",
          description: content.substring(0, 100) + (content.length > 100 ? "..." : ""),
          imageUrl: type === "link" ? "/placeholder.svg" : undefined,
          tags: [type === "link" ? "link" : "nota", "texto"],
          highlights: [
            `Este é um conteúdo do tipo ${type === "link" ? "link" : "texto"} que você salvou.`,
            `Recomendamos revisitar este conteúdo para aproveitá-lo melhor.`,
            `Conteúdo: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`
          ]
        };
      }
      
      // Garantir que sempre temos uma fonte para links
      let source;
      if (type === "link") {
        try {
          source = new URL(content).hostname;
          // Detectar fontes comuns
          if (source.includes("instagram")) {
            source = "Instagram";
          } else if (source.includes("facebook")) {
            source = "Facebook";
          } else if (source.includes("twitter") || source.includes("x.com")) {
            source = "Twitter";
          } else if (source.includes("linkedin")) {
            source = "LinkedIn";
          }
        } catch {
          source = "Link externo";
        }
      }
      
      // Atualizar o item com os resultados da análise
      const analyzedItem: MemoryItem = {
        ...newItem,
        analyzed: true,
        metadata: {
          title: analysisResult.title || (type === "link" ? "Link Salvo" : "Nota de Texto"),
          description: analysisResult.description || content.substring(0, 100),
          imageUrl: analysisResult.imageUrl,
          tags: analysisResult.tags || [type],
          source: source
        },
        highlights: analysisResult.highlights || [
          "Este conteúdo foi salvo para sua referência futura.",
          `Você salvou isto como um ${type === "link" ? "link" : "texto"}.`
        ]
      };
      
      // Salvar análise no banco de dados (em produção)
      // await AIAnalysisService.saveAnalysis(newItem.id, analysisResult);
      
      // Atualizar o item na lista
      setMemories(prev => 
        prev.map(item => item.id === newItem.id ? analyzedItem : item)
      );
    } catch (error) {
      console.error("Erro ao analisar conteúdo:", error);
      
      // Em caso de erro, marcar o item como analisado com dados básicos
      const fallbackItem: MemoryItem = {
        ...newItem,
        analyzed: true,
        metadata: {
          title: type === "link" ? "Link Salvo" : "Nota de Texto",
          tags: [type],
        },
        highlights: [
          "Este conteúdo foi salvo para sua referência futura.",
          "A análise detalhada não está disponível no momento."
        ]
      };
      
      setMemories(prev => 
        prev.map(item => item.id === newItem.id ? fallbackItem : item)
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle submitting content - com dados de exemplo para testes
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Detect if input is a URL
    const isUrl = /^(https?:\/\/)/i.test(inputValue.trim());
    
    // Se estiver em modo de teste e o inputValue for "instagram", criar um exemplo de teste
    if (inputValue.toLowerCase().includes("instagram")) {
      const instagramExample: MemoryItem = {
        id: Date.now().toString(),
        content: "https://www.instagram.com/p/example",
        type: "link",
        timestamp: new Date().toISOString(),
        analyzed: true,
        metadata: {
          title: "Post do Instagram",
          description: "Conteúdo do Instagram que você salvou",
          imageUrl: "/placeholder.svg",
          tags: ["instagram", "social", "mídia"],
          source: "Instagram"
        },
        highlights: [
          "Este post do Instagram parece conter informações relevantes para seus interesses.",
          "Considere salvar este conteúdo para referência futura.",
          "O Instagram é uma plataforma útil para acompanhar tendências visuais e conteúdo de criadores."
        ]
      };
      
      setMemories(prev => [instagramExample, ...prev]);
      setInputValue("");
      setShowInputOptions(false);
      return;
    }
    
    analyzeContent(inputValue.trim(), isUrl ? "link" : "text");
    setInputValue("");
    setShowInputOptions(false);
  };

  // Handle specific content types
  const handleContentType = (type: MemoryItem["type"]) => {
    if (type === "link") {
      toast({
        title: "Cole o link abaixo",
        description: "Cole o endereço do site ou mídia social que deseja analisar",
      });
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else if (type === "image") {
      toast({
        title: "Função em desenvolvimento",
        description: "O upload de imagens estará disponível em breve!",
      });
    } else {
      toast({
        title: "Função em desenvolvimento",
        description: `O suporte para ${type} estará disponível em breve!`,
      });
    }
    
    setShowInputOptions(false);
  };

  return (
    <div className="flex h-full flex-col bg-white pb-16">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white pt-10 pb-1 shadow-sm">
        <div className="px-5 mb-3 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Notas
            </h1>
            <p className="text-sm text-gray-500">Organize suas ideias e informações</p>
          </div>
          <NotesIcon />
        </div>
        
        <div className="px-3">
          <Tabs 
            defaultValue="all" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="all"
                className="flex-1 rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
              >
                Todas
              </TabsTrigger>
              <TabsTrigger 
                value="memory"
                className="flex-1 rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
              >
                Memória
              </TabsTrigger>
              <TabsTrigger 
                value="today"
                className="flex-1 rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
              >
                Hoje
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="mt-2 h-px w-full bg-gray-200" />
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-auto px-4 py-2">
        <AnimatePresence>
          {getFilteredMemories().length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-40 flex-col items-center justify-center"
            >
              <p className="text-gray-500">
                {activeTab === "today" 
                  ? "Nenhuma nota hoje. Compartilhe algo!" 
                  : "Sem notas disponíveis"}
              </p>
            </motion.div>
          ) : (
            getFilteredMemories().map(item => (
              <NoteCard 
                key={item.id} 
                item={item} 
                onClick={() => setSelectedNote(item)} 
              />
            ))
          )}
          
          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4"
            >
              <div className="mb-1 text-xs text-gray-500">
                {format(new Date(), "h:mm a", { locale: ptBR })}
              </div>
              <LoadingAnalysis />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Empty div for scrolling to bottom */}
        <div ref={endOfListRef} />
      </div>
      
      {/* Expandable Input Field */}
      <div className="fixed bottom-28 right-5 z-50">
        <AnimatePresence>
          {!showInputOptions ? (
            <motion.button
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/90 text-white shadow-sm backdrop-blur-sm"
              onClick={() => setShowInputOptions(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          ) : (
            <motion.div
              initial={{ width: 48, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 48, opacity: 0 }}
              className="flex h-12 items-center overflow-hidden rounded-full bg-gray-900/90 pr-[1px] shadow-sm backdrop-blur-sm"
              onClick={(e) => {
                // If user clicks on the container but not in the input or submit button, 
                // close it only if there's no text in the input
                if ((e.target as HTMLElement).tagName !== 'INPUT' && 
                    !(e.target as HTMLElement).closest('button') &&
                    !inputValue.trim()) {
                  setShowInputOptions(false);
                }
              }}
            >
              <form onSubmit={handleSubmit} className="flex w-full items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Digite sua nota..."
                  className="h-full flex-1 bg-transparent px-4 text-white focus:outline-none min-w-[200px]"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className={cn(
                    "flex h-[calc(100%-2px)] w-[calc(100%-2px)] items-center justify-center rounded-full",
                    inputValue.trim() 
                      ? "bg-indigo-500 text-white" 
                      : "bg-gray-700 text-gray-400"
                  )}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Note Detail Modal */}
      <NoteDetailModal 
        isOpen={selectedNote !== null} 
        onClose={() => setSelectedNote(null)}
        item={selectedNote}
      />
    </div>
  );
}
