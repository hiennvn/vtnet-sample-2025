import React from 'react';
import './PasswordStrength.css';

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const calculateStrength = (password: string): { score: number; label: string; color: string } => {
    // Simple password strength algorithm
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) score += 1; // Has uppercase
    if (/[a-z]/.test(password)) score += 1; // Has lowercase
    if (/[0-9]/.test(password)) score += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special character
    
    // Return score and corresponding label/color
    switch (true) {
      case (score <= 2):
        return { score, label: 'Weak', color: 'red' };
      case (score <= 4):
        return { score, label: 'Moderate', color: 'orange' };
      case (score <= 5):
        return { score, label: 'Strong', color: 'yellowgreen' };
      default:
        return { score, label: 'Very Strong', color: 'green' };
    }
  };
  
  const { score, label, color } = calculateStrength(password);
  const strengthPercentage = (score / 6) * 100;
  
  return (
    <div className="password-strength">
      <div className="password-strength-bar">
        <div 
          className="password-strength-progress" 
          style={{ 
            width: `${strengthPercentage}%`,
            backgroundColor: color
          }}
        ></div>
      </div>
      <div className="password-strength-label" style={{ color }}>
        {label}
      </div>
    </div>
  );
};

export default PasswordStrength; 