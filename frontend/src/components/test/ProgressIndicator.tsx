import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface ProgressIndicatorProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: Set<number>;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentQuestion,
  totalQuestions,
  answeredQuestions
}) => {
  const progressPercentage = ((currentQuestion) / totalQuestions) * 100;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Progress</span>
          <span className="text-[#2563EB]">
            {currentQuestion} of {totalQuestions}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#2563EB] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Question Status Grid */}
      <div className="grid grid-cols-10 gap-2">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const questionNumber = index + 1;
          const isAnswered = answeredQuestions.has(questionNumber);
          const isCurrent = questionNumber === currentQuestion;
          
          return (
            <div
              key={questionNumber}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                isCurrent
                  ? 'bg-[#2563EB] text-white ring-2 ring-[#2563EB] ring-offset-2'
                  : isAnswered
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {isAnswered && !isCurrent ? (
                <CheckCircle size={16} />
              ) : (
                questionNumber
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>Answered: {answeredQuestions.size}</span>
        <span>Unanswered: {totalQuestions - answeredQuestions.size}</span>
      </div>
    </div>
  );
};