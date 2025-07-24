import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { 
  sendMessage, 
  fetchConversationHistory,
  fetchGlobalConversationHistory,
  setProjectContext,
  toggleGlobalMode
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
  const chatState = useAppSelector((state) => state.chat);
  
  // Handle the case where chat state might be undefined
  const messages = chatState?.messages || [];
  const loading = chatState?.loading || false;
  const error = chatState?.error || null;
  const currentProjectId = chatState?.currentProjectId || null;
  const isGlobalMode = chatState?.isGlobalMode || false;
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set project context when projectId changes
  useEffect(() => {
    if (projectId && dispatch && setProjectContext) {
      dispatch(setProjectContext(projectId));
    }
  }, [dispatch, projectId]);

  // Fetch conversation history when opened
  useEffect(() => {
    if (!isOpen || !dispatch) return;
    
    try {
      if (isGlobalMode) {
        dispatch(fetchGlobalConversationHistory(20));
      } else if (currentProjectId) {
        dispatch(fetchConversationHistory({ projectId: currentProjectId, limit: 20 }));
      }
      
      // Focus input when opened
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } catch (error) {
      console.error('Error fetching conversation history:', error);
    }
  }, [isOpen, dispatch, currentProjectId, isGlobalMode]);

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
        dispatch(sendMessage({ message: inputValue, isGlobal: true }));
      } else if (currentProjectId) {
        dispatch(sendMessage({ message: inputValue, projectId: currentProjectId }));
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
      dispatch(toggleGlobalMode());
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
            <div className="message-content">{message.content}</div>
            
            {message.type === 'BOT' && message.references && message.references.length > 0 && (
              <div className="message-sources">
                <p>Sources:</p>
                <ul>
                  {message.references.map((ref, idx) => (
                    <li key={idx}>
                      <a href={`#document-${ref.documentId}`}>
                        {ref.documentName}
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