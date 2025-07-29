"use client"
import FileUpload from "@/components/resume/FileUpload";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useState } from "react";
import { FileText, ChartColumn, SearchIcon } from "lucide-react"
import ReactMarkdown from 'react-markdown';
import Link from "next/link";

interface AnalysisResultProps {
    result: string;
}

export default function Resume() {
    const [jobDescription, setJobDescription] = useState("");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isPercentageMatching, setIsPercentageMatching] = useState(false);
    const [isFindingTopSkills, setIsFindingTopSkills] = useState(false);
    const [topSkillsResult, setTopSkillsResult] = useState<AnalysisResultProps | null>();
    const [analysisResult, setAnalysisResult] = useState<AnalysisResultProps | null>();

    const handleAnalyze = async () => {
        if (!uploadedFile || !jobDescription.trim()) {
            alert("Please upload a resume and enter a job description");
            return;
        }

        setIsAnalyzing(true);
        setTopSkillsResult(null);
        const formData = new FormData();
        formData.append('resume_file', uploadedFile);
        formData.append('job_description', jobDescription);
        formData.append('analysis_type', "summary");

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/resume/analyze`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Analysis result:', response.data);
            setAnalysisResult(response.data);
        } catch (error) {
            console.error('Error analyzing resume:', error);
            alert('Error analyzing resume. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handlePercentageMatchCalculation = async () => {
        if (!uploadedFile || !jobDescription.trim()) {
            alert("Please upload a resume and enter a job description");
            return;
        }

        setIsPercentageMatching(true);
        setTopSkillsResult(null);
        const formData = new FormData();
        formData.append('resume_file', uploadedFile);
        formData.append('job_description', jobDescription);
        formData.append('analysis_type', "percentage_match");

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/resume/analyze`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Analysis result:', response.data);
            setAnalysisResult(response.data);
        } catch (error) {
            console.error('Error analyzing resume:', error);
            alert('Error analyzing resume. Please try again.');
        } finally {
            setIsPercentageMatching(false);
        }
    };

    const handleFindTopSkills = async () => {
        if (!uploadedFile || !jobDescription.trim()) {
            alert("Please upload a resume and enter a job description");
            return;
        }

        setIsFindingTopSkills(true);
        setAnalysisResult(null);
        const formData = new FormData();
        formData.append('resume_file', uploadedFile);
        formData.append('job_description', jobDescription);
        formData.append('analysis_type', "top_skills");

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/resume/analyze`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Top Skills result:', response.data);
            setTopSkillsResult(response.data);
        } catch (error) {
            console.error('Error analyzing resume:', error);
            alert('Error analyzing resume. Please try again.');
        } finally {
            setIsFindingTopSkills(false);
        }
    };
    const colorClasses = [
        'bg-blue-200 text-blue-800 hover:bg-blue-200',
        'bg-green-200 text-green-800 hover:bg-green-200',
        'bg-yellow-200 text-yellow-800 hover:bg-yellow-200',
        'bg-purple-200 text-purple-800 hover:bg-purple-200',
        'bg-pink-200 text-pink-800 hover:bg-pink-200',
        'bg-red-200 text-red-800 hover:bg-red-200',
        'bg-indigo-200 text-indigo-800 hover:bg-indigo-200',
    ];


    const renderTopSkillsButtons = () => {
        if (!topSkillsResult?.result) return null;

        try {
            const skillsData = JSON.parse(topSkillsResult.result);
            const skills = Object.values(skillsData);

            return (
                <div className="flex justify-center gap-4 mt-4">
                    {skills.map((skill, index) => {
                        const colorClass = colorClasses[index % colorClasses.length];
                        return (
                            <Link href={`/test/${skill}`} key={index}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`text-sm p-4 cursor-pointer ${colorClass}`}
                                >
                                    {skill as string}
                                </Button>
                            </Link>
                        );
                    })}

                </div>
            );
        } catch (error) {
            console.error('Error parsing skills data:', error);
            return null;
        }
    };


    return (
        <div className="">
            <main className="pt-8">
                <div className="text-2xl text-center font-[500] pb-2">
                    Ski-Fy Resume Analysis Platform
                </div>
                <div className="text-gray-500 text-center pt-2">
                    Upload your resume and analyze it against job descriptions to improve your chances.
                </div>
                <div className="flex flex-row min-h-[50vh] max-h-[50vh]">
                    <div className="w-1/2">
                        <FileUpload onFileUpload={setUploadedFile} />
                    </div>
                    <div className="w-1/2 p-6">
                        <div className="flex flex-col w-full border border-gray-200 rounded-lg bg-white hover:border-blue-400 p-6 min-h-full">
                            <div className="text-left font-[500]">
                                Job Description
                            </div>
                            <Textarea
                                className="mt-4 border-2 rounded-xl w-full h-48 pt-3 px-3 resize-none bg-gray-100"
                                placeholder="Paste your job description here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            <div className="text-gray-500 pt-2 text-sm">
                                Provide the complete job description for a better analysis.
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center gap-x-6">
                    <Button
                        onClick={() => handlePercentageMatchCalculation()}
                        disabled={isAnalyzing || !uploadedFile || !jobDescription.trim() || isFindingTopSkills || isPercentageMatching}
                        className="mt-4 cursor-pointer bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                        <ChartColumn />
                        {isPercentageMatching ? 'Finding % match...' : 'Find Match %'}
                    </Button>

                    <Button
                        onClick={() => handleAnalyze()}
                        disabled={isAnalyzing || !uploadedFile || !jobDescription.trim() || isFindingTopSkills || isPercentageMatching}
                        className="mt-4 cursor-pointer bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                        <FileText />
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
                    </Button>

                    <Button
                        onClick={() => handleFindTopSkills()}
                        disabled={isAnalyzing || !uploadedFile || !jobDescription.trim() || isFindingTopSkills || isPercentageMatching}
                        className="mt-4 cursor-pointer bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                        <SearchIcon />
                        {isFindingTopSkills ? 'Finding top skills...' : 'Find Top Skills'}
                    </Button>
                </div>
                <div className="mt-6 border-2 rounded-lg m-6 p-4">
                    {(isAnalyzing || isPercentageMatching || isFindingTopSkills) ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-gray-600">
                                {isAnalyzing && "Analyzing your resume..."}
                                {isPercentageMatching && "Calculating match percentage..."}
                                {isFindingTopSkills && "Finding top skills..."}
                            </p>
                        </div>
                    ) : analysisResult ? (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Analysis Results:</h3>
                            <div className="prose max-w-none">
                                <ReactMarkdown>{analysisResult.result}</ReactMarkdown>
                            </div>
                        </div>
                    ) : topSkillsResult ? (
                        <div>
                            <div className="text-sm font-semibold mb-2 text-center">Choose the test you want to appear for:</div>
                            {renderTopSkillsButtons()}
                        </div>
                    ) : (
                        <p className="text-gray-500">Analysis results will appear here...</p>
                    )}
                </div>
            </main>

            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="mx-auto px-6 py-6 text-center text-gray-600">
                    <p>&copy; 2025 Ski-Fy.</p>
                </div>
            </footer>
        </div>
    )
}