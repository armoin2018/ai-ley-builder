import { useEffect, useRef, useState } from 'react';
import { Bot, ChevronDown, ChevronUp, Send, User, X } from 'lucide-react';
import { Button } from '../../../shared/components';
import { cn } from '../../../utils';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  className?: string;
}

export function ChatPanel({ className }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content:
        "Hello! I'm your AI assistant. I can help you build and optimize your workflows. What would you like to work on?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - 200,
    y: window.innerHeight - 400,
  });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!chatRef.current) return;

    setIsDragging(true);
    const rect = chatRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = Math.max(
      0,
      Math.min(window.innerWidth - 400, e.clientX - dragOffset.x)
    );
    const newY = Math.max(
      0,
      Math.min(window.innerHeight - 60, e.clientY - dragOffset.y)
    );

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(
      () => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content:
            'I understand you want to work on that. Let me help you with your workflow design. Would you like me to suggest some best practices or help you with specific node configurations?',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      },
      1000 + Math.random() * 2000
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized) {
      setIsExpanded(false);
    }
  };

  if (isMinimized) {
    return (
      <div
        className={cn(
          'fixed z-30 bg-blue-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors',
          className
        )}
        style={{
          left: `${position.x + 150}px`,
          bottom: '20px',
        }}
        onClick={toggleMinimize}
      >
        <div className="w-12 h-12 flex items-center justify-center">
          <Bot className="w-6 h-6" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={chatRef}
      className={cn(
        'fixed z-30 bg-white border border-slate-200 rounded-lg shadow-xl flex flex-col',
        'select-none backdrop-blur-sm bg-white/95',
        isDragging && 'cursor-grabbing',
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '400px',
        height: isExpanded ? '500px' : '300px',
      }}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50 rounded-t-lg',
          'cursor-grab active:cursor-grabbing'
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-slate-900">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpand}
            className="w-6 h-6 p-0 hover:bg-slate-200"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronUp className="w-3 h-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMinimize}
            className="w-6 h-6 p-0 hover:bg-slate-200"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map(message => (
          <div
            key={message.id}
            className={cn(
              'flex gap-2 max-w-[85%]',
              message.type === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                message.type === 'user'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-green-100 text-green-600'
              )}
            >
              {message.type === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div
              className={cn(
                'px-3 py-2 rounded-lg text-sm',
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-900'
              )}
            >
              <div>{message.content}</div>
              <div
                className={cn(
                  'text-xs mt-1 opacity-70',
                  message.type === 'user' ? 'text-blue-100' : 'text-slate-500'
                )}
              >
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-2 mr-auto max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 px-3 py-2 rounded-lg text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" />
                <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"
                  style={{ animationDelay: '0.2s' }}
                />
                <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"
                  style={{ animationDelay: '0.4s' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your workflow..."
            className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
