import React from 'react';
import { Question } from '@/lib/types';

interface QuestionCardProps {
    question: Question | null;
    selectedAnswer: number | null;
    onAnswerSelect: (answerIndex: number) => void;
    questionNumber: number;
    totalQuestions: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    selectedAnswer,
    onAnswerSelect,
    questionNumber,
    totalQuestions
}) => {

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-[#2563EB]">Question</span>
                </div>
                <div className="text-gray-500">
                    {questionNumber} / {totalQuestions}
                </div>
            </div>

            {/* Question Text */}
            <div className="mb-6">
                <h2 className="text-xl mb-4 text-gray-800">
                    {question?.question}
                </h2>

                {/* Code Block if present */}
                {question?.code && (
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4">
                        <div className="text-gray-400 mb-2">// Given:</div>
                        {question.code}
                    </div>
                )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
                {question?.options
                    .map((option, index) => (
                        <div
                            key={index}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${selectedAnswer === index
                                ? 'border-[#2563EB] bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                            onClick={() => onAnswerSelect(index)}
                        >
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className={`min-w-8 min-h-8 rounded-full flex items-center justify-center border-2 transition-all ${selectedAnswer === index
                                    ? 'border-[#2563EB] bg-[#2563EB] text-white'
                                    : 'border-gray-300 bg-white text-gray-600'
                                    }`}>
                                    {index + 1}
                                </div>
                                <span className={`${selectedAnswer === index ? 'text-[#2563EB]' : 'text-gray-700'
                                    }`}>
                                    {option}
                                </span>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Selection Indicator */}
            {selectedAnswer !== null && (
                <div className="mt-4 text-sm text-[#2563EB] flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#2563EB] rounded-full"></div>
                    Selected: Option {selectedAnswer + 1}
                </div>
            )}
        </div>
    );
};