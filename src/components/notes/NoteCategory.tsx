
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Inbox } from "lucide-react";

interface NoteCategoryProps {
  category: string;
  setCategory: (category: string) => void;
}

export const NoteCategory = ({ category, setCategory }: NoteCategoryProps) => {
  return (
    <div className="pt-3 border-t border-gray-100">
      <Label htmlFor="category" className="block text-sm font-medium text-gray-500 mb-2">
        Categoria
      </Label>
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-full border border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-gray-500" />
            <SelectValue placeholder="Selecione uma categoria" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="inbox">Entrada</SelectItem>
          <SelectItem value="draft">Rascunho</SelectItem>
          <SelectItem value="personal">Pessoal</SelectItem>
          <SelectItem value="work">Trabalho</SelectItem>
          <SelectItem value="study">Estudos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
