
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { SmartTaskForm } from "./SmartTaskForm";
import { motion, AnimatePresence } from "framer-motion";

interface SmartTaskModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: any;
}

export const SmartTaskModal = ({ isOpen, onOpenChange, onSuccess, initialData }: SmartTaskModalProps) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-3xl mx-auto shadow-xl max-h-[90vh] overflow-y-auto border-0">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader className="px-6 pt-6 pb-4 flex justify-between items-center border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-700 text-white relative overflow-hidden">
                <motion.div 
                  className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mt-32 -mr-32"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.05, 0.08, 0.05]
                  }}
                  transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleClose} 
                    className="rounded-full absolute right-4 top-4 text-white hover:bg-white/20"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </motion.div>
                
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ rotate: -10, scale: 0.9 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/20 p-2 rounded-xl"
                  >
                    <Sparkles className="h-6 w-6 text-yellow-300" />
                  </motion.div>
                  <DialogTitle className="text-2xl font-bold">Tarefa Rápida</DialogTitle>
                </div>
              </DialogHeader>

              <motion.div 
                className="px-6 py-5 space-y-5 overflow-y-auto max-h-[60vh]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <SmartTaskForm 
                  onOpenChange={onOpenChange} 
                  onSuccess={onSuccess}
                  initialData={initialData}
                />
              </motion.div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};
