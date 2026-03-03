import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import './Message.css';

type MessageType = 'success' | 'error' | 'warning' | 'info';

interface MessageContextType {
  showMessage: (type: MessageType, content: string) => void;
}

const MessageContext = createContext<MessageContextType | null>(null);

export function useMessage() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within MessageProvider');
  }
  return context;
}

interface MessageProviderProps {
  children: React.ReactNode;
}

export function MessageProvider({ children }: MessageProviderProps) {
  const [messages, setMessages] = useState<Array<{ id: number; type: MessageType; content: string }>>([]);

  const showMessage = useCallback((type: MessageType, content: string) => {
    const id = Date.now();
    setMessages((prev) => [...prev, { id, type, content }]);
  }, []);

  // 设置全局回调
  useEffect(() => {
    (window as unknown as { __MESSAGE_SHOW__: typeof showMessage }).__MESSAGE_SHOW__ = showMessage;
  }, [showMessage]);

  const removeMessage = useCallback((id: number) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  return (
    <MessageContext.Provider value={{ showMessage }}>
      {children}
      <div className="message-container">
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            type={msg.type}
            content={msg.content}
            onClose={() => removeMessage(msg.id)}
          />
        ))}
      </div>
    </MessageContext.Provider>
  );
}

interface MessageItemProps {
  type: MessageType;
  content: string;
  onClose: () => void;
}

function MessageItem({ type, content, onClose }: MessageItemProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons: Record<MessageType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`message-item message-${type}`}>
      <span className="message-icon">{icons[type]}</span>
      <span className="message-content">{content}</span>
      <button className="message-close" onClick={onClose}>×</button>
    </div>
  );
}

// 便捷函数 - 使用全局回调
export function showMessage(type: MessageType, content: string) {
  const fn = (window as unknown as { __MESSAGE_SHOW__?: (type: MessageType, content: string) => void }).__MESSAGE_SHOW__;
  if (fn) {
    fn(type, content);
  } else {
    console.log(`[${type}] ${content}`);
  }
}

export const Message = {
  success: (content: string) => showMessage('success', content),
  error: (content: string) => showMessage('error', content),
  warning: (content: string) => showMessage('warning', content),
  info: (content: string) => showMessage('info', content),
};
