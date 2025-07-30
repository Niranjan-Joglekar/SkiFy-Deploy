"use client"
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logo from "../../../public/logo.png"
import Image from "next/image"

export default function Test() {
    const [skill, setSkill] = useState("");

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow flex items-center justify-center -mt-20">
                <div className="w-full max-w-xl space-y-4 text-center">
                    <div className="flex items-center justify-center space-x-4">
                        <span>
                            <Image src={logo} alt="Logo" className="w-18 bg-blue-500 rounded-2xl" />
                        </span>
                        <span className="text-3xl font-semibold">Ski-Fy</span>
                    </div>
                    <label className="block text-lg font-medium">
                        Enter the skill you'd like to test:
                    </label>
                    <div className="gap-4 flex flex-col px-8">
                        <input
                            type="text"
                            placeholder="What skill would you like to test today?"
                            value={skill}
                            onChange={(e) => setSkill(e.target.value)}
                            className="border rounded-xl p-2 w-full text-center"
                        />
                        <Link href={`/test/${encodeURIComponent(skill)}`} target="_blank">
                            <Button className="bg-green-500 rounded-xl h-10 cursor-pointer w-full hover:bg-green-600">Start Test</Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}