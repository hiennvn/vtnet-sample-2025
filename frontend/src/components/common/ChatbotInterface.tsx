import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { 
  sendMessage, 
  setGlobalMode
} from '../../redux/slices/chatSlice';
import './ChatbotInterface.css';

interface ChatbotInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: number;
  isDirector: boolean;
}

const ChatbotInterface: React.FC<ChatbotInterfaceProps> = ({ 
  isOpen, 
  onClose, 
  projectId,
  isDirector
}) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const chatState = useAppSelector((state) => state.chat);
  
  // Handle the case where chat state might be undefined
  const messages = chatState?.messages || [];
  const loading = chatState?.loading || false;
  const error = chatState?.error || null;
  const currentProjectId = chatState?.currentProjectId || null;
  const isGlobalMode = chatState?.isGlobalMode || false;
  
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState<string>(() => uuidv4());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate new session ID when route changes
  useEffect(() => {
    setSessionId(uuidv4());
  }, [location.pathname]);

  // Focus input when opened
  useEffect(() => {
    if (!isOpen) return;
    
    // Focus input when opened
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !dispatch) return;
    
    try {
      if (isGlobalMode) {
        dispatch(sendMessage({ message: inputValue, isGlobal: true, sessionId }));
      } else if (currentProjectId) {
        dispatch(sendMessage({ message: inputValue, projectId: currentProjectId.toString(), sessionId }));
      } else {
        console.warn('No project context or global mode set');
      }
      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleModeToggle = () => {
    if (isDirector && dispatch) {
      dispatch(setGlobalMode(!isGlobalMode));
    }
  };

  const suggestedQueries = [
    "What is this project about?",
    "List all documents in this project",
    "What is document [title] about?"
  ];

  const handleSuggestedQuery = (query: string) => {
    setInputValue(query);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-interface">
      <div className="chatbot-header">
        <h3>
          {isGlobalMode ? 'Global Assistant' : 'Project Assistant'}
        </h3>
        <div className="chatbot-controls">
          {isDirector && (
            <button 
              className={`mode-toggle ${isGlobalMode ? 'active' : ''}`}
              onClick={handleModeToggle}
              title={isGlobalMode ? 'Switch to project mode' : 'Switch to global mode'}
            >
              <i className={`fas ${isGlobalMode ? 'fa-globe' : 'fa-project-diagram'}`}></i>
            </button>
          )}
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.length === 0 && !loading && (
          <div className="welcome-message">
            <p>Hello! How can I help you with {isGlobalMode ? 'your projects' : 'this project'}?</p>
            <div className="suggested-queries">
              <p>Try asking:</p>
              <ul>
                {suggestedQueries.map((query, index) => (
                  <li key={index} onClick={() => handleSuggestedQuery(query)}>
                    {query}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {Array.isArray(messages) && messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.type === 'USER' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-content">
              {message.type === 'BOT' && (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              )}
              {message.type === 'USER' && message.content}
            </div>
            
            {message.type === 'BOT' && message.references && message.references.length > 0 && (
              <div className="message-sources">
                <p>Sources:</p>
                <ul>
                  {message.references.map((ref, idx) => (
                    <li key={idx}>
                      <a href={`#document-${idx}`}>
                        {ref}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="message-time">
              {new Date(message.sentAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message bot-message loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>Sorry, there was an error: {error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chatbot-input" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your question..."
          value={inputValue}
          onChange={handleInputChange}
          ref={inputRef}
        />
        <button type="submit" disabled={loading || !inputValue.trim()}>
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

export default ChatbotInterface; 