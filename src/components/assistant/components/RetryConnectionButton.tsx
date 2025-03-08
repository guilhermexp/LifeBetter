
import React from "react";
import { RefreshCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RetryConnectionButtonProps {
  isRetrying: boolean;
  onRetry: () => Promise<void>;
}

export const RetryConnectionButton: React.FC<RetryConnectionButtonProps> = ({ 
  isRetrying, 
  onRetry 
}) => {
  return (
    <div className="p-3 border-t border-gray-100 flex justify-center">
      <Button 
        variant="outline" 
        size="sm"
        className="text-purple-600 border border-purple-200 hover:bg-purple-50"
        onClick={onRetry}
        disabled={isRetrying}
      >
        {isRetrying ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Conectando...
          </>
        ) : (
          <>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Tentar reconectar
          </>
        )}
      </Button>
    </div>
  );
};
