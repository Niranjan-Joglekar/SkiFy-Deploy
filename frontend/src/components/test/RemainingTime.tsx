"use client"
import { useState, useEffect } from 'react';
import { Clock } from "lucide-react"

export default function RemainingTime({ initialTime = 300 }) { // 5 minutes default
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="font-mono whitespace-nowrap mt-7">
            <Clock className="inline size-5 align-middle" />
            <div className='mx-2 inline align-middle'>
                Time Remaining 
            </div>
            <div className={`inline bg-[#a2daf9] rounded-sm p-3 ml-3 align-middle`}>
                {formatTime(timeLeft) }
            </div>
        </div>
    );
}