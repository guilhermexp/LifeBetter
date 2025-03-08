
import { Bookmark, BookmarkCheck, ArrowRight, BookOpen, GraduationCap, Quote, Home, Briefcase, Heart, Wallet, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AITip } from "./types";
import type { AreaType } from "@/types/habits";

interface SuggestionCardProps {
  tip: AITip;
  isSaved: boolean;
  onSave: (tipId: string) => void;
  onAdd: (tip: AITip) => void;
  areaIcons: Record<AreaType, any>;
  areaNames: Record<AreaType, string>;
  sourceIcons: Record<string, any>;
}

export const SuggestionCard = ({
  tip,
  isSaved,
  onSave,
  onAdd,
  areaIcons,
  areaNames,
  sourceIcons
}: SuggestionCardProps) => {
  // Determinar o ícone de fonte com base no tipo de fonte
  const getSourceIcon = () => {
    if (tip.source_type === 'book') return <BookOpen className="h-3.5 w-3.5" />;
    if (tip.source_type === 'study') return <GraduationCap className="h-3.5 w-3.5" />;
    if (tip.source_type === 'quote') return <Quote className="h-3.5 w-3.5" />;
    return null;
  };

  // Função para obter o ícone da área
  const getAreaIcon = () => {
    switch(tip.area) {
      case 'family': return <Home className="h-5 w-5 text-white" />;
      case 'business': return <Briefcase className="h-5 w-5 text-white" />;
      case 'health': return <Heart className="h-5 w-5 text-white" />;
      case 'finances': return <Wallet className="h-5 w-5 text-white" />;
      case 'spirituality': return <Sun className="h-5 w-5 text-white" />;
      default: return null;
    }
  };

  // Função para obter a cor de fundo do ícone da área
  const getAreaColor = () => {
    switch(tip.area) {
      case 'family': return 'bg-pink-500';
      case 'business': return 'bg-blue-500';
      case 'health': return 'bg-green-500';
      case 'finances': return 'bg-yellow-500';
      case 'spirituality': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      <div className="flex items-start p-3 pb-2">
        <div className={`${getAreaColor()} rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 mr-3`}>
          {getAreaIcon()}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-gray-600 mb-0.5">
                {areaNames[tip.area]}
              </div>
              <h4 className="font-medium text-gray-900 text-base leading-tight">{tip.title}</h4>
            </div>
            
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7 rounded-full text-gray-400" 
              onClick={() => onSave(tip.id)}
            >
              {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </Button>
          </div>
          
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{tip.description}</p>
          
          {/* Tags */}
          {tip.tags && tip.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tip.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-[10px] bg-gray-100 text-gray-600 rounded-full py-0 px-2 h-4">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Source information */}
          {(tip.reference || tip.study || tip.quote) && (
            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
              <div className="text-purple-600">
                {getSourceIcon()}
              </div>
              <span className="truncate">
                {tip.reference ? tip.reference.title :
                 tip.study ? tip.study.source :
                 tip.quote ? `Journal of Family Psychology` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-3 pb-3 pt-1">
        <Button 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 text-sm font-medium h-9" 
          onClick={() => onAdd(tip)}
        >
          <span>Adicionar</span>
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
