import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { Process } from '@/components/landing/Process';
import { Features } from '@/components/landing/Features';
import { Specimens } from '@/components/landing/Specimens';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        <Hero />
        <Features />
        <Process />
        <Specimens />
      </main>
      <Footer />
    </div>
  );
}
