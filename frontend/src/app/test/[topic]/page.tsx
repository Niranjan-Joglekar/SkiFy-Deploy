import { TestInterface } from "@/components/test/TestInterface";

export default function Test() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <main className="">
                <TestInterface />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="mx-auto px-6 py-6 text-center text-gray-600">
                    <p>&copy; 2025 Ski-Fy.</p>
                </div>
            </footer>
        </div>
    )
}