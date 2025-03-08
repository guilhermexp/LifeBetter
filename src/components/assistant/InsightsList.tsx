
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Calendar, TrendingDown, TrendingUp, Award, AlertTriangle, ArrowRight } from "lucide-react";
import { AgentInsight } from "@/hooks/useAgentInsights";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface InsightsListProps {
  insights: AgentInsight[];
}

export function InsightsList({ insights }: InsightsListProps) {
  const getIconForType = (type: string) => {
    switch (type) {
      case "progress":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "decline":
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      case "consistency":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "achievement":
        return <Award className="h-5 w-5 text-yellow-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Brain className="h-5 w-5 text-purple-500" />;
    }
  };

  const getTagColorForType = (type: string) => {
    switch (type) {
      case "progress":
        return "bg-green-100 text-green-800";
      case "decline":
        return "bg-red-100 text-red-800";
      case "consistency":
        return "bg-blue-100 text-blue-800";
      case "achievement":
        return "bg-yellow-100 text-yellow-800";
      case "warning":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-purple-100 text-purple-800";
    }
  };

  const getBackgroundGradient = (type: string) => {
    switch (type) {
      case "progress":
        return "bg-gradient-to-r from-green-50 to-emerald-50";
      case "decline":
        return "bg-gradient-to-r from-red-50 to-rose-50";
      case "consistency":
        return "bg-gradient-to-r from-blue-50 to-sky-50";
      case "achievement":
        return "bg-gradient-to-r from-yellow-50 to-amber-50";
      case "warning":
        return "bg-gradient-to-r from-amber-50 to-orange-50";
      default:
        return "bg-gradient-to-r from-purple-50 to-indigo-50";
    }
  };

  if (insights.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Brain className="h-5 w-5 text-purple-600" />
              Insights do Assistente IA
            </CardTitle>
            <CardDescription className="text-gray-600">
              Análise inteligente da sua rotina e hábitos
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <motion.div 
              className="flex flex-col items-center justify-center py-8 text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Brain className="h-16 w-16 text-purple-200 mb-4" />
              <p className="text-gray-700 font-medium text-lg">
                Ainda não temos insights suficientes para análise.
              </p>
              <p className="text-gray-500 mt-2 max-w-md">
                Continue usando o app para receber recomendações personalizadas baseadas nos seus hábitos e atividades.
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Brain className="h-5 w-5 text-purple-600" />
            Insights do Assistente IA
          </CardTitle>
          <CardDescription className="text-gray-600">
            Análise inteligente da sua rotina e hábitos
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="space-y-5">
            {insights.map((insight, index) => (
              <motion.li 
                key={index} 
                className={`p-5 rounded-xl shadow-md ${getBackgroundGradient(insight.type)} hover:shadow-lg transition-all duration-300`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start gap-4">
                  <motion.div 
                    className="p-3 bg-white rounded-xl shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {getIconForType(insight.type)}
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-800">{insight.title}</h4>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${getTagColorForType(insight.type)}`}>
                        {insight.area}
                      </span>
                    </div>
                    <p className="text-gray-700">{insight.description}</p>
                    {insight.action && (
                      <motion.div 
                        className="mt-4 pt-3 border-t border-gray-200"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-purple-700">Sugestão de ação:</p>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex items-center gap-1 text-purple-700 hover:text-purple-800 hover:bg-purple-100 rounded-lg"
                              onClick={() => {
                                // Scroll to habits tab and click it
                                const habitsTab = document.querySelector('[data-value="habits"]');
                                if (habitsTab && habitsTab instanceof HTMLElement) {
                                  habitsTab.click();
                                  setTimeout(() => {
                                    habitsTab.scrollIntoView({ behavior: 'smooth' });
                                  }, 100);
                                }
                              }}
                            >
                              Ver Hábitos
                              <ArrowRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                          </motion.div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{insight.action}</p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
