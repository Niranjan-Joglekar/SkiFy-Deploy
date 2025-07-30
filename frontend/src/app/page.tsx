import Navbar from "@/components/Navbar";
import Head from "next/head";

export default function Home() {
    return (
        <div>
            <Head>
                <link rel="icon" type="image/png" href="/logo.png" />
            </Head>
            <Navbar />
        </div>
    );
}