"use client";
import { useState, useRef } from "react";
import { Upload } from "lucide-react";

interface FileUploadProps {
    onFileUpload: (file: File) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === "application/pdf") {
            setSelectedFile(file);
            setFileName(file.name);
            onFileUpload(file);
        } else {
            alert("Please select a valid PDF file.");
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file && file.type === "application/pdf") {
            setSelectedFile(file);
            setFileName(file.name);
            onFileUpload(file);
        } else {
            alert("Please drop a valid PDF file.");
        }
    };

    return (
        <div className="flex flex-col items-center p-6 h-full">
            <div
                className="min-h-full w-full mb-4 text-center border border-gray-200 rounded-lg bg-white hover:border-blue-400"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                <div className="text-left pt-6 pl-6 font-[500]">
                    Upload Resume
                </div>
                <div
                    className="p-6 m-6 rounded-xl border-dashed border-4 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {fileName ? (
                        <p className="text-gray-800 font-medium">Selected PDF: {fileName}</p>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Upload size={48} />
                            <div className="font-[500] mt-4">Drag & drop your resume here, or click to upload</div>
                            <div className="mt-4 text-gray-500">PDF files only</div>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        accept="application/pdf"
                        className="w-full mt-4 hidden"
                    />
                </div>
            </div>
        </div>
    );
}
