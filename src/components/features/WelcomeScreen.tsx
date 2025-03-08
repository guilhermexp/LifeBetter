
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div className="text-center animate-fadeIn w-full flex flex-col items-center justify-center min-h-[80vh] px-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        Bem-vindo ao Life Harmony
      </h1>
      <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-lg mx-auto">
        Vamos começar avaliando as diferentes áreas da sua vida para criar seu perfil personalizado.
      </p>
      <Button
        onClick={onStart}
        className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-lg transition-all duration-300 hover:scale-105"
      >
        Começar Avaliação
      </Button>
    </div>
  );
};
