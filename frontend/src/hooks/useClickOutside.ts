import { useEffect, RefObject } from 'react';

/**
 * Hook that alerts when you click outside of the passed ref
 * @param ref Reference to the element to detect clicks outside of
 * @param callback Function to call when a click outside is detected
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  callback: () => void
): void {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      // Unbind the event listener on cleanup
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
} 