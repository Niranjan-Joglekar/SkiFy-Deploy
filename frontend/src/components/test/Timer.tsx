"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  onTimeUp?: () => void;
  duration?: number;
  isActive: boolean;
  onReset?: () => void;
}

export const Timer: React.FC<TimerProps> = ({
  onTimeUp,
  duration = 60,
  isActive,
  onReset
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration, onReset]);

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      onTimeUp?.();
    }
  }, [timeLeft, isActive, onTimeUp]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [isActive]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft <= 10;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${isLowTime
        ? 'border-red-500 bg-red-50 text-red-700'
        : 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
      }`}>
      <Clock size={18} />
      <span className="font-mono">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};
