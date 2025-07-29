"use client"
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { PerformanceChart } from "../../../components/report/PerformanceChart";
import { MasteryScore } from "../../../components/report/MasteryScore";
import { CheckCircle, XCircle, Target } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import axios from "axios";

export default function QuizDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [quizData, setQuizData] = useState<any>(null);
    const [accuracy, setAccuracy] = useState<number>(0);
    const [incorrectAnswers, setIncorrectAnswers] = useState<number>(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report`);
                const data = response.data;

                setQuizData(data);
                setAccuracy((data.correctAnswers / data.totalQuestions) * 100);
                setIncorrectAnswers(data.incorrectAnswers);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <p className="text-center p-6">Loading...</p>;
    if (error) return <p className="text-center p-6 text-red-500">Error: {error.message}</p>;
    if (!quizData) return null;

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl">Quiz Performance Dashboard</h1>
                <p className="text-gray-600">{quizData.title}</p>
                <p className="text-sm text-gray-500">Completed on {quizData.completionDate}</p>
            </div>

            {/* Mastery Score Card */}
            <MasteryScore score={quizData.masteryScore} />

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm">Total Questions</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl">{quizData.totalQuestions}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm">Correct Answers</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl text-green-600">{quizData.correctAnswers}</div>
                        <p className="text-xs text-muted-foreground">
                            {accuracy.toFixed(1)}% accuracy
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm">Incorrect Answers</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl text-red-600">{incorrectAnswers}</div>
                        <p className="text-xs text-muted-foreground">
                            {(100 - accuracy).toFixed(1)}% missed
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Chart */}
            <PerformanceChart
                correctAnswers={quizData.correctAnswers}
                incorrectAnswers={incorrectAnswers}
            />

            <div className="prose max-w-none">
                <ReactMarkdown>{quizData.analysisText}</ReactMarkdown>
            </div>
        </div>
    );
}