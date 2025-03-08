
import React, { useEffect, useRef } from "react";

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

interface AssistantMessagesProps {
  messages: Message[];
}

export const AssistantMessages: React.FC<AssistantMessagesProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Uso de setTimeout para garantir que o scroll aconteça após o re-render completo
    setTimeout(() => {
      if (messagesEndRef.current && containerRef.current) {
        // Scroll apenas dentro do container de mensagens, não a página inteira
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 100);
  }, [messages]);

  return (
    <div 
      id="assistant-messages" 
      className="max-h-60 overflow-y-auto p-4 space-y-3"
      ref={containerRef}
    >
      {messages.map((message, index) => (
        <div 
          key={index} 
          className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
        >
          <div 
            className={`max-w-[80%] rounded-lg p-3 ${
              message.role === 'assistant' 
                ? 'bg-purple-100 text-purple-900' 
                : 'bg-gray-100 text-gray-900'
            }`}
            dangerouslySetInnerHTML={{ 
              __html: message.content.replace(/\*([^*]+)\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') 
            }}
          />
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
