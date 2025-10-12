import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full px-5">
        <Hero />
      </div>
    </div>
  );
}
