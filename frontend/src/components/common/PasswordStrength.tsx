import { useState, useEffect } from 'react'
import './PasswordStrength.css'

interface PasswordStrengthProps {
  password: string
}

// Password strength levels
enum StrengthLevel {
  WEAK = 'weak',
  MEDIUM = 'medium',
  STRONG = 'strong',
  VERY_STRONG = 'very-strong'
}

function PasswordStrength({ password }: PasswordStrengthProps) {
  const [strength, setStrength] = useState<StrengthLevel>(StrengthLevel.WEAK)
  const [score, setScore] = useState(0)
  
  useEffect(() => {
    // Calculate password strength
    const calculateStrength = (pwd: string): [StrengthLevel, number] => {
      if (!pwd) return [StrengthLevel.WEAK, 0]
      
      let score = 0
      
      // Length check
      if (pwd.length >= 8) score += 1
      if (pwd.length >= 12) score += 1
      
      // Character variety checks
      if (/[A-Z]/.test(pwd)) score += 1 // Has uppercase
      if (/[a-z]/.test(pwd)) score += 1 // Has lowercase
      if (/[0-9]/.test(pwd)) score += 1 // Has number
      if (/[^A-Za-z0-9]/.test(pwd)) score += 1 // Has special char
      
      // Determine strength level based on score
      let strengthLevel: StrengthLevel
      if (score <= 2) {
        strengthLevel = StrengthLevel.WEAK
      } else if (score <= 4) {
        strengthLevel = StrengthLevel.MEDIUM
      } else if (score <= 5) {
        strengthLevel = StrengthLevel.STRONG
      } else {
        strengthLevel = StrengthLevel.VERY_STRONG
      }
      
      return [strengthLevel, score]
    }
    
    const [newStrength, newScore] = calculateStrength(password)
    setStrength(newStrength)
    setScore(newScore)
  }, [password])
  
  // Get color based on strength
  const getColor = (): string => {
    switch (strength) {
      case StrengthLevel.WEAK:
        return '#e81123' // Red
      case StrengthLevel.MEDIUM:
        return '#ff8c00' // Orange
      case StrengthLevel.STRONG:
        return '#107c10' // Green
      case StrengthLevel.VERY_STRONG:
        return '#0078d4' // Blue
      default:
        return '#e81123' // Red
    }
  }
  
  // Get label based on strength
  const getLabel = (): string => {
    switch (strength) {
      case StrengthLevel.WEAK:
        return 'Weak'
      case StrengthLevel.MEDIUM:
        return 'Medium'
      case StrengthLevel.STRONG:
        return 'Strong'
      case StrengthLevel.VERY_STRONG:
        return 'Very Strong'
      default:
        return 'Weak'
    }
  }
  
  // Calculate width percentage based on score (max score is 6)
  const getWidthPercentage = (): string => {
    return `${(score / 6) * 100}%`
  }
  
  return (
    <div className="password-strength">
      <div className="password-strength-meter">
        <div 
          className="password-strength-meter-fill" 
          style={{ 
            width: getWidthPercentage(), 
            backgroundColor: getColor() 
          }}
        ></div>
      </div>
      <div className="password-strength-label" style={{ color: getColor() }}>
        Password strength: <strong>{getLabel()}</strong>
      </div>
      <ul className="password-requirements">
        <li className={password.length >= 8 ? 'met' : ''}>
          At least 8 characters
        </li>
        <li className={/[A-Z]/.test(password) ? 'met' : ''}>
          At least one uppercase letter
        </li>
        <li className={/[a-z]/.test(password) ? 'met' : ''}>
          At least one lowercase letter
        </li>
        <li className={/[0-9]/.test(password) ? 'met' : ''}>
          At least one number
        </li>
        <li className={/[^A-Za-z0-9]/.test(password) ? 'met' : ''}>
          At least one special character
        </li>
      </ul>
    </div>
  )
}

export default PasswordStrength 