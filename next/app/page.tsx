import Hero from "@/components/home/Hero";
import Intro from "@/components/home/Intro";
import Navbar from "@/components/home/Navbar";

export default function HomePage() {
  return (
    <main className="bg-background h-full w-full">
      <div>
        <Navbar />
      </div>
      <div>
        <Hero />
        <Intro />
      </div>
    </main>
  );
}
