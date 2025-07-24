"use client"

import Options from "@/components/test/Options"
import RemainingTime from "@/components/test/RemainingTime";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// API
interface FirstQuestion {
    question: string,
    // questionNumber: number,
    // codeForQuestion: string,
    option_1: string,
    option_2: string,
    option_3: string,
    option_4: string,
    correct_option: string,
    expected_time_sec: number,
}

export default function Home() {
    const [data, setData] = useState<FirstQuestion | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { topic } = useParams()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/test_eg/start/${topic}` || '');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const fetchNextQuestion = async (chosen_option: string, time_taken: number, expected_time: number) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/test_eg/answer`, {
                question: data?.question,
                correct_option: 3,
                user_answer: chosen_option,
                time_taken: time_taken,
                expected_time: expected_time,
                level: 3
            }).then(response => {
                setData(response.data.next_question);
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error as Error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="">
            <div className="flex justify-between">
                <div className="ml-10 mt-10">
                    <div id="questionData">
                        <div id="question" className="font-sans">
                            {
                                data?.question ||
                                "Loading Question..."}
                        </div>
                        <div id="codeForQuestion" className="mt-5 font-code">
                            {
                                // data?.codeForQuestion || 
                                ""}
                        </div>
                    </div>
                    <div id="options" className="mt-5">
                        <Options options={[
                            data?.option_1 || "Loading Option 1...",
                            data?.option_2 || "Loading Option 2...",
                            data?.option_3 || "Loading Option 3...",
                            data?.option_4 || "Loading Option 4...",
                        ]} />
                    </div>
                    <Button onClick={()=> fetchNextQuestion("1", 15, data.expected_time_sec || 30)} className="bg-green-500 hover:bg-green-600 cursor-pointer my-5">Submit & Next</Button>
                </div>
                <div id="Navigation Pane" className="w-[30vw] text-center">
                    <div id="Remaining Time">
                        <RemainingTime initialTime={data?.expected_time_sec} />
                    </div>
                </div>
            </div>
            <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-[95vw] bg-blue-200 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{
                        width: `${(
                            // data?.questionNumber ??
                            5 / 20) * 100}%`
                    }}
                ></div>
            </div>
        </div>
    );
}