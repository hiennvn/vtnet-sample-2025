import React from 'react';
import './ChatbotButton.css';

interface ChatbotButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const ChatbotButton: React.FC<ChatbotButtonProps> = ({ onClick, isOpen }) => {
  return (
    <button 
      className={`chatbot-button ${isOpen ? 'active' : ''}`}
      onClick={onClick}
      aria-label="Toggle chatbot"
    >
      {isOpen ? (
        <i className="fas fa-times"></i>
      ) : (
        <i className="fas fa-comment-dots"></i>
      )}
    </button>
  );
};

export default ChatbotButton; 