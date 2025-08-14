import { useEffect, useRef } from 'react';

export const useAutoSave = (
  data: any,
  saveFunction: (data: any) => void,
  interval: number = 5000
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedData = useRef(data);

  useEffect(() => {
    const save = () => {
      if (JSON.stringify(data) !== JSON.stringify(lastSavedData.current)) {
        saveFunction(data);
        lastSavedData.current = data;
      }
    };

    intervalRef.current = setInterval(save, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        // Save one final time on cleanup
        save();
      }
    };
  }, [data, saveFunction, interval]);

  // Manual save function
  const saveNow = () => {
    saveFunction(data);
    lastSavedData.current = data;
  };

  return { saveNow };
};