import { TestInterface } from "@/components/test/TestInterface";
import Image from "next/image";
import Link from "next/link";
import logo from "../../../../public/logo.png"

export default function Test() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-3">
                        {/* Logo */}
                        <div className="flex items-center bg-blue-500 rounded-md">
                            <Link href="/">
                                <Image src={logo} alt={"Ski-Fy Logo"} width="50" height="50" className="" />
                            </Link>
                        </div>
                        <div>
                            <h1 className="text-xl text-gray-900">SQL</h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="py-8">
                <TestInterface />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-6 py-6 text-center text-gray-600">
                    <p>&copy; 2025 SkiFy.</p>
                </div>
            </footer>
        </div>
    )
}