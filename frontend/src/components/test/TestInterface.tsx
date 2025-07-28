"use client"
import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flag, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { QuestionCard } from './QuestionCard';
import { Timer } from './Timer';
import { ProgressIndicator } from './ProgressIndicator';
import { useParams } from 'next/navigation';
import axios from 'axios';

interface Question {
    question: string,
    option_1: string,
    option_2: string,
    option_3: string,
    option_4: string,
    question_number: number,
    correct_option: string,
    expected_time_sec: number,
}

interface TestState {
    currentQuestion: number;
    answers: { [key: number]: number };
    timeSpent: { [key: number]: number };
    isCompleted: boolean;
}

const totalQuestions = 20;

export const TestInterface: React.FC = () => {
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { topic } = useParams();
    const [selectedAnswer, setSelectedAnswer] = useState<string>("");
    const [startTime, setStartTime] = useState<number>(Date.now());

    const [testState, setTestState] = useState<TestState>({
        currentQuestion: 1,
        answers: {},
        timeSpent: {},
        isCompleted: false
    });

    const [timerKey, setTimerKey] = useState(0);

    const answeredQuestions = new Set(Object.keys(testState.answers).map(Number));

    const handleAnswerSelect = useCallback((answerIndex: number) => {
        const optionMap: { [key: number]: string } = {
            1: currentQuestion?.option_1 || "",
            2: currentQuestion?.option_2 || "",
            3: currentQuestion?.option_3 || "",
            4: currentQuestion?.option_4 || ""
        };

        setSelectedAnswer(optionMap[answerIndex] || "");
        setTestState(prev => ({
            ...prev,
            answers: {
                ...prev.answers,
                [prev.currentQuestion]: answerIndex
            }
        }));
    }, [currentQuestion]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/test/start/${topic}` || '');
                setCurrentQuestion(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error as Error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [topic]);

    const handleNextQuestion = useCallback(async (chosen_option: string, time_taken: number) => {
        try {
            setLoading(true);
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/test/answer`, {
                question: currentQuestion?.question,
                correct_option: currentQuestion?.correct_option,
                user_answer: chosen_option,
                time_taken: time_taken,
                expected_time: currentQuestion?.expected_time_sec,
                level: 3
            });
            setCurrentQuestion(response.data.next_question);
            setTestState(prev => ({
                ...prev,
                currentQuestion: prev.currentQuestion + 1
            }));
            setTimerKey(prev => prev + 1);
            setSelectedAnswer("");
            setStartTime(Date.now());
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error as Error);
        }
    }, [currentQuestion]);

    const handleTimeUp = useCallback(() => {
        if (testState.currentQuestion < totalQuestions) {
            handleNextQuestion("", 0);
        } else {
            setTestState(prev => ({ ...prev, isCompleted: true }));
        }
    }, [testState.currentQuestion, handleNextQuestion]);


    const handleSubmitTest = useCallback(() => {
        setTestState(prev => ({ ...prev, isCompleted: true }));
    }, []);

    const handleRestartTest = useCallback(() => {
        setTestState({
            currentQuestion: 1,
            answers: {},
            timeSpent: {},
            isCompleted: false
        });
        setTimerKey(prev => prev + 1);
    }, []);

    const calculateScore = () => {
        return { correct: 0, total: Object.keys(testState.answers).length };
    };

    if (testState.isCompleted) {
        const { correct, total } = calculateScore();
        const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Flag className="text-white" size={32} />
                        </div>
                        <h1 className="text-3xl mb-2 text-gray-800">Test Completed!</h1>
                        <p className="text-gray-600">You have successfully completed the SQL assessment.</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <div className="text-2xl text-[#2563EB]">{correct}</div>
                                <div className="text-gray-600">Correct Answers</div>
                            </div>
                            <div>
                                <div className="text-2xl text-gray-800">{total}</div>
                                <div className="text-gray-600">Questions Attempted</div>
                            </div>
                            <div>
                                <div className={`text-2xl ${percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {percentage}%
                                </div>
                                <div className="text-gray-600">Score</div>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleRestartTest}
                        className="bg-[#2563EB] hover:bg-blue-700"
                    >
                        <RotateCcw size={16} className="mr-2" />
                        Restart Test
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar with Progress and Timer */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6 sticky top-6">
                        <div>
                            <h3 className="text-lg mb-4 text-gray-800">Test Progress</h3>
                            <ProgressIndicator
                                currentQuestion={testState.currentQuestion}
                                totalQuestions={totalQuestions}
                                answeredQuestions={answeredQuestions}
                            />
                        </div>

                        <div>
                            <h3 className="text-lg mb-4 text-gray-800">Time Remaining</h3>
                            <Timer
                                key={timerKey}
                                duration={currentQuestion?.expected_time_sec || 90}
                                isActive={true}
                                onTimeUp={handleTimeUp}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Question Area */}
                <div className="lg:col-span-3">
                    <QuestionCard
                        question={currentQuestion}
                        selectedAnswer={testState.answers[testState.currentQuestion] ?? null}
                        onAnswerSelect={handleAnswerSelect}
                        questionNumber={currentQuestion?.question_number || 1}
                        totalQuestions={totalQuestions}
                    />

                    {/* Navigation Controls */}
                    <div className="flex justify-between items-center mt-6">
                        <div className="flex gap-3">
                            {testState.currentQuestion === totalQuestions ? (
                                <Button
                                    onClick={handleSubmitTest}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Flag size={16} className="mr-2" />
                                    Submit Test
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => {
                                        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
                                        handleNextQuestion(selectedAnswer, timeSpent);
                                    }}
                                    className="bg-[#2563EB] hover:bg-blue-700 cursor-pointer"
                                    disabled={testState.currentQuestion === totalQuestions || loading}
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};