"use client"
import React, { useState, useCallback, useEffect } from 'react';
import { CircleCheckBig } from 'lucide-react';
import { Button } from '../ui/button';
import { QuestionCard } from './QuestionCard';
import { Timer } from './Timer';
import { ProgressIndicator } from './ProgressIndicator';
import { redirect, useParams } from 'next/navigation';
import axios from 'axios';
import { Question } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import logo from "../../../public/logo.png"

interface TestState {
    currentQuestion: number;
    answers: { [key: number]: number };
    timeSpent: { [key: number]: number };
    isCompleted: boolean;
}

const totalQuestions = 10;

export const TestInterface: React.FC = () => {
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { topic } = useParams();
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
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
        setSelectedAnswer(answerIndex);
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

    const handleNextQuestion = useCallback(async (chosen_option: number | null, time_taken: number) => {
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
            setSelectedAnswer(chosen_option);
            setStartTime(Date.now());
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error as Error);
        }
    }, [currentQuestion]);

    const handleTimeUp = useCallback(() => {
        const timeLimit = currentQuestion?.expected_time_sec || 90;

        if (testState.currentQuestion < totalQuestions) {
            handleNextQuestion(null, timeLimit);
        } else {
            setTestState(prev => ({ ...prev, isCompleted: true }));
        }
    }, [testState.currentQuestion, handleNextQuestion, currentQuestion]);


    const handleSubmitTest = useCallback(async () => {
        setTestState(prev => ({ ...prev, isCompleted: true }));
        redirect('/test/report')
    }, [topic]);

    // const handleRestartTest = useCallback(() => {
    //     setTestState({
    //         currentQuestion: 1,
    //         answers: {},
    //         timeSpent: {},
    //         isCompleted: false
    //     });
    //     setTimerKey(prev => prev + 1);
    // }, []);

    // if (testState.isCompleted) {
    //     return (
    //         <div className="max-w-4xl mx-auto p-6">
    //             <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
    //                 <div className="mb-6">
    //                     <div className="w-20 h-20 bg-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-4">
    //                         <Flag className="text-white" size={32} />
    //                     </div>
    //                     <h1 className="text-3xl mb-2 text-gray-800">Test Completed!</h1>
    //                     <p className="text-gray-600">You have successfully completed the assessment.</p>
    //                 </div>

    //                 <div className="bg-gray-50 rounded-lg p-6 mb-6">
    //                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    //                         <div>
    //                             <div className="text-2xl text-[#2563EB]">{correct}</div>
    //                             <div className="text-gray-600">Correct Answers</div>
    //                         </div>
    //                         <div>
    //                             <div className="text-2xl text-gray-800">{total}</div>
    //                             <div className="text-gray-600">Questions Attempted</div>
    //                         </div>
    //                         <div>
    //                             <div className={`text-2xl ${percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
    //                                 {percentage}%
    //                             </div>
    //                             <div className="text-gray-600">Score</div>
    //                         </div>
    //                     </div>
    //                 </div>

    //                 <Button
    //                     onClick={handleRestartTest}
    //                     className="bg-[#2563EB] hover:bg-blue-700"
    //                 >
    //                     <RotateCcw size={16} className="mr-2" />
    //                     Restart Test
    //                 </Button>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flexjustify-center">
                    <div className="flex items-center gap-3">
                        {/* Logo */}
                        <div className="flex items-center bg-blue-500 rounded-md">
                            <Link href="/">
                                <Image src={logo} alt={"Ski-Fy Logo"} width="50" height="50" className="" />
                            </Link>
                        </div>
                        <h1 className="text-xl text-gray-900">Ski-Fy</h1>
                    </div>
                    <div className="text-xl text-center text-gray-900">Test on {decodeURIComponent(topic as string)}</div>
                </div>
            </header>
            <div className='max-w-7xl mx-auto p-6'>
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
                                    isActive={!loading && currentQuestion !== null}
                                    onTimeUp={handleTimeUp}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Main Question Area */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                    <p className="text-gray-600">Loading question...</p>
                                </div>
                            </div>
                        ) : (
                            <QuestionCard
                                question={currentQuestion}
                                selectedAnswer={testState.answers[testState.currentQuestion] ?? null}
                                onAnswerSelect={handleAnswerSelect}
                                questionNumber={currentQuestion?.question_number || 1}
                                totalQuestions={totalQuestions}
                            />
                        )}

                        {/* Navigation Controls */}
                        <div className="flex justify-between items-center mt-6">
                            <div className="flex gap-3">
                                {testState.currentQuestion === totalQuestions ? (
                                    <Button
                                        onClick={handleSubmitTest}
                                        className="bg-green-500 hover:bg-green-600 cursor-pointer"
                                        disabled={loading}
                                    >
                                        <CircleCheckBig size={16} className="mr-2" />
                                        Submit Test
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => {
                                            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
                                            const chosen_option = selectedAnswer;
                                            handleNextQuestion(chosen_option, timeSpent);
                                        }}
                                        className="bg-[#2563EB] hover:bg-blue-700 cursor-pointer"
                                        disabled={loading}
                                    >
                                        {loading ? 'Loading...' : 'Next'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};