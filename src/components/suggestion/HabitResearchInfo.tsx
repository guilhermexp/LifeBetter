
import { HabitPlan } from "./types";
import { Clock, Calendar, CheckCircle, BookOpen, GraduationCap, Quote, ArrowRight, Info, Lightbulb, BookMarked, FileText } from "lucide-react";
import { AITip } from "./types";

interface HabitResearchInfoProps {
  plan: HabitPlan;
  habit: AITip;
}

export function HabitResearchInfo({ plan, habit }: HabitResearchInfoProps) {
  return (
    <div className="text-sm">
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-purple-50 rounded-xl p-3 flex flex-col items-center text-center shadow-sm">
          <Calendar className="h-5 w-5 text-purple-600 mb-1" />
          <p className="text-xs text-gray-600 mb-0.5">Frequência</p>
          <p className="font-medium text-gray-800">{
            plan.frequency === 'daily' ? 'Diário' : 
            plan.frequency === 'weekly' ? 'Semanal' : 
            plan.frequency === 'monthly' ? 'Mensal' : plan.frequency
          }</p>
        </div>
        
        <div className="bg-indigo-50 rounded-xl p-3 flex flex-col items-center text-center shadow-sm">
          <Clock className="h-5 w-5 text-indigo-600 mb-1" />
          <p className="text-xs text-gray-600 mb-0.5">Melhor horário</p>
          <p className="font-medium text-gray-800">{plan.bestTime}</p>
        </div>
        
        <div className="bg-violet-50 rounded-xl p-3 flex flex-col items-center text-center shadow-sm">
          <CheckCircle className="h-5 w-5 text-violet-600 mb-1" />
          <p className="text-xs text-gray-600 mb-0.5">Duração</p>
          <p className="font-medium text-gray-800">{plan.suggestedDuration}</p>
        </div>
      </div>
      
      {plan.implementation && (
        <div className="space-y-4">
          {plan.implementation.progressionSteps && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <details>
                <summary className="font-medium text-purple-700 cursor-pointer flex items-center">
                  <ArrowRight className="h-4 w-4 mr-1.5 text-purple-500" />
                  <span>Passos para Progressão</span>
                </summary>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  {plan.implementation.progressionSteps.map((step, index) => (
                    <li key={index} className="text-gray-700">{step}</li>
                  ))}
                </ul>
              </details>
            </div>
          )}
          
          {plan.implementation.adaptationTips && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <details>
                <summary className="font-medium text-purple-700 cursor-pointer flex items-center">
                  <Lightbulb className="h-4 w-4 mr-1.5 text-purple-500" />
                  <span>Dicas de Adaptação</span>
                </summary>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  {plan.implementation.adaptationTips.map((tip, index) => (
                    <li key={index} className="text-gray-700">{tip}</li>
                  ))}
                </ul>
              </details>
            </div>
          )}
          
          {plan.implementation.scientificBasis && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <details>
                <summary className="font-medium text-purple-700 cursor-pointer flex items-center">
                  <Info className="h-4 w-4 mr-1.5 text-purple-500" />
                  <span>Base Científica</span>
                </summary>
                <p className="text-gray-700 mt-2 pl-2 border-l-2 border-purple-100 py-1">
                  {plan.implementation.scientificBasis}
                </p>
              </details>
            </div>
          )}
          
          {habit.study && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <details>
                <summary className="font-medium text-purple-700 cursor-pointer flex items-center">
                  <FileText className="h-4 w-4 mr-1.5 text-purple-500" />
                  <span>Estudo relacionado</span>
                </summary>
                <div className="mt-2 pl-3 border-l-2 border-indigo-100 py-1 space-y-1">
                  <p className="text-gray-700"><span className="font-medium text-indigo-700">Fonte:</span> {habit.study.source}</p>
                  <p className="text-gray-700"><span className="font-medium text-indigo-700">Descoberta:</span> {habit.study.finding}</p>
                  {habit.study.application && (
                    <p className="text-gray-700"><span className="font-medium text-indigo-700">Aplicação:</span> {habit.study.application}</p>
                  )}
                </div>
              </details>
            </div>
          )}
          
          {habit.reference && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <details>
                <summary className="font-medium text-purple-700 cursor-pointer flex items-center">
                  <BookMarked className="h-4 w-4 mr-1.5 text-purple-500" />
                  <span>Referência bibliográfica</span>
                </summary>
                <div className="mt-2 pl-3 border-l-2 border-purple-100 py-1 space-y-1">
                  <p className="text-gray-700"><span className="font-medium text-purple-700">Livro:</span> {habit.reference.title}</p>
                  <p className="text-gray-700"><span className="font-medium text-purple-700">Autor:</span> {habit.reference.author}</p>
                </div>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
