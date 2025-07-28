"use client"
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  onTimeUp?: () => void;
  duration?: number; // in seconds
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

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration, onReset]);

  useEffect(() => {
    if (!isActive) return;

    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          onTimeUp?.();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isActive, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft <= 10;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
      isLowTime 
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