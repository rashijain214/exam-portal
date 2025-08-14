import { useEffect, useRef } from 'react';

interface UseTabSwitchingProps {
  onViolation: () => void;
  maxViolations: number;
  onMaxViolations: () => void;
}

export const useTabSwitching = ({ 
  onViolation, 
  maxViolations, 
  onMaxViolations 
}: UseTabSwitchingProps) => {
  const violationCount = useRef(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        violationCount.current += 1;
        onViolation();
        
        if (violationCount.current >= maxViolations) {
          onMaxViolations();
        }
      }
    };

    const handleBlur = () => {
      violationCount.current += 1;
      onViolation();
      
      if (violationCount.current >= maxViolations) {
        onMaxViolations();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [onViolation, onMaxViolations, maxViolations]);

  return { violationCount: violationCount.current };
};