import Faq from "@/components/home/Faq";
import Features from "@/components/home/Features";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import Intro from "@/components/home/Intro";
import Navbar from "@/components/home/Navbar";

export default function HomePage() {
  return (
    <main className="bg-background h-full w-full">
      <Navbar />
      <Hero />
      <Intro />
      <Features />
      <HowItWorks />
      <Faq />
    </main>
  );
}
