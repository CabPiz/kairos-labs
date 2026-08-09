import { HeroSection } from "@/components/sections/HeroSection";
import { Products } from "@/components/sections/Products";
import { SobreSection } from "@/components/sections/SobreSection";
import { TecnologiaSection } from "@/components/sections/TecnologiaSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Products />
      <SobreSection />
      <TecnologiaSection />
    </main>
  );
}
