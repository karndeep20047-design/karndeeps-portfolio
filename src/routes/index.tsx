import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Work } from "@/components/Work";
import { About } from "@/components/About";
import { Stack } from "@/components/Stack";
import { Contact } from "@/components/Contact";
import { MobileTopBar } from "@/components/MobileTopBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen bg-background text-foreground pb-28 md:pb-0">
      <Nav />
      <MobileTopBar />
      <MobileBottomNav />
      <Hero />
      <Work />
      <About />
      <Stack />
      <Contact />
    </main>
  );
}
