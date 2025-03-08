
import React from "react";
import { WifiOff } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export const OfflineAlert: React.FC = () => {
  return (
    <Alert variant="destructive" className="m-3 bg-red-50 text-red-700 border-red-200">
      <AlertTitle className="flex items-center gap-2">
        <WifiOff className="h-4 w-4" />
        Modo Offline
      </AlertTitle>
      <AlertDescription>
        O assistente está com problemas de conexão. Algumas funcionalidades podem estar limitadas, 
        mas você ainda pode adicionar eventos básicos.
      </AlertDescription>
    </Alert>
  );
};
