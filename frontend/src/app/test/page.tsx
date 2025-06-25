"use client"

import Options from "@/components/test/Options"
import RemainingTime from "@/components/test/RemainingTime";
import axios from "axios";
import { useEffect, useState } from "react";

// API
interface APIData {
    question: string,
    questionNumber: number,
    codeForQuestion: string,
    options: {
        1: string,
        2: string,
        3: string,
        4: string
    },
    timeForQuestion: number
}

export default function Home() {
    const [data, setData] = useState<APIData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(process.env.NEXT_PUBLIC_API_BASE_URL || '');
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
    return (
        <div className="">
            <div className="flex justify-between">
                <div className="ml-10 mt-10">
                    <div id="questionData">
                        <div id="question" className="font-sans">
                            {data?.question || "Loading Question..."}
                        </div>
                        <div id="codeForQuestion" className="mt-5 font-code">
                            {data?.codeForQuestion || "Loading code for Question"}
                        </div>
                    </div>
                    <div id="options" className="mt-5">
                        <Options options={[
                            'Loading Option 1...',
                            'Loading Option 2...',
                            'Loading Option 3...',
                            'Loading Option 4...',
                            // data?.options[1] || 
                        ]} />
                    </div>
                </div>
                <div id="Navigation Pane" className="w-[30vw] text-center">
                    <div id="Remaining Time">
                        <RemainingTime initialTime={data?.timeForQuestion} />
                    </div>
                </div>
            </div>
            <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-[95vw] bg-blue-200 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(data?.questionNumber ?? 5 / 20) * 100}%` }}
                ></div>
            </div>
        </div>
    );
}