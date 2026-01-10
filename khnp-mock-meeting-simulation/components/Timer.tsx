
import React, { useState, useEffect } from 'react';

interface TimerProps {
  startTime: number;
  durationMinutes: number;
  onEnd?: () => void;
}

export const Timer: React.FC<TimerProps> = ({ startTime, durationMinutes, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const end = startTime + durationMinutes * 60 * 1000;
      const remaining = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0 && onEnd) {
        onEnd();
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startTime, durationMinutes]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={`px-4 py-2 neo-border-sm font-black text-2xl tabular-nums ${timeLeft < 60 ? 'bg-red-500 text-white animate-pulse' : 'bg-black text-white'}`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};
