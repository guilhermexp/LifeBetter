
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NoteOptions } from "./NoteOptions";
import { NoteCategory } from "./NoteCategory";

interface NoteFormProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  isToday: boolean;
  setIsToday: (isToday: boolean) => void;
  hasDueDate: boolean;
  setHasDueDate: (hasDueDate: boolean) => void;
  isPriority: boolean;
  setIsPriority: (isPriority: boolean) => void;
  hasReminder: boolean;
  setHasReminder: (hasReminder: boolean) => void;
  category: string;
  setCategory: (category: string) => void;
}

export const NoteForm = ({
  title,
  setTitle,
  description,
  setDescription,
  isToday,
  setIsToday,
  hasDueDate,
  setHasDueDate,
  isPriority,
  setIsPriority,
  hasReminder,
  setHasReminder,
  category,
  setCategory
}: NoteFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Input
          placeholder="Digite sua nota..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-base border border-gray-200 focus:border-purple-400"
        />
      </div>
      
      <div>
        <Textarea
          placeholder="Descrição (Opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[80px] border border-gray-200 focus:border-purple-400"
        />
      </div>
      
      <NoteOptions
        isToday={isToday}
        setIsToday={setIsToday}
        hasDueDate={hasDueDate}
        setHasDueDate={setHasDueDate}
        isPriority={isPriority}
        setIsPriority={setIsPriority}
        hasReminder={hasReminder}
        setHasReminder={setHasReminder}
      />
      
      <NoteCategory
        category={category}
        setCategory={setCategory}
      />
    </div>
  );
};
