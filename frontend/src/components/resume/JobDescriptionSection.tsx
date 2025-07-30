"use client";

import { useState } from "react";
import { Textarea } from "../ui/textarea";


interface JobDescriptionProps {
    onJobDescriptionPaste: (description: string) => void;
}

export default function JobDescriptionSection({ onJobDescriptionPaste }: JobDescriptionProps) {
    const [jobDescription, setJobDescription] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setJobDescription(value);
        onJobDescriptionPaste(value);
    };

    return (
        <div className="w-full md:w-1/2 p-3 md:p-6">
            <div className="flex flex-col w-full border border-gray-200 rounded-lg bg-white hover:border-blue-400 p-4 md:p-6 min-h-full">
                <div className="text-left font-[500]">
                    Job Description
                </div>
                <Textarea
                    className="mt-4 border-2 rounded-xl w-full h-48 pt-3 px-3 resize-none bg-gray-100"
                    placeholder="Paste your job description here..."
                    value={jobDescription}
                    onChange={handleChange}
                />
                <div className="text-gray-500 pt-2 text-sm">
                    Provide the complete job description for a better analysis.
                </div>
            </div>
        </div>
    )
}