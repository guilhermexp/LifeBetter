
import { useState } from "react";
import { Trophy } from "lucide-react";

export default function Achievements() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="p-4 pb-safe bg-gradient-to-b from-purple-50 to-white min-h-screen">
      <div className="max-w-md mx-auto">
        <div className="flex flex-col items-start gap-1 mb-6 py-0 my-0 mx-[34px]">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="h-8 w-8 text-purple-500" strokeWidth={2} />
            Conquistas
          </h1>
          <p className="text-slate-500 font-medium">Em breve</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 animate-fadeIn">
          <div className="text-center py-8">
            <p className="text-gray-500">Novas conquistas estarão disponíveis em breve.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
