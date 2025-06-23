import { Navbar } from "@/components/Navbar";
import { Be_Vietnam_Pro } from "next/font/google";

const beVietnamProFont = Be_Vietnam_Pro({
  weight: "300",
  subsets: ["latin"]
})

export default function Home() {
  return (
    <div className={`${beVietnamProFont.className}`}>
      <Navbar />
    </div>
  );
}