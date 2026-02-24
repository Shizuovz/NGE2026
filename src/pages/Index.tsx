import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ScheduleSection from "@/components/ScheduleSection";
import StatsSection from "@/components/StatsSection";
import GamesSection from "@/components/GamesSection";
import ExpoSection from "@/components/ExpoSection";
import MediaSection from "@/components/MediaSection";
import SponsorsSection from "@/components/SponsorsSection";
import RegistrationSection from "@/components/RegistrationSection";
import GallerySection from "@/components/GallerySection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ScheduleSection />
      <StatsSection />
      <GamesSection />
      <ExpoSection />
      <MediaSection />
      <SponsorsSection />
      <RegistrationSection />
      <GallerySection />
      <Footer />
    </main>
  );
};

export default Index;
