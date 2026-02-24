import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Trophy } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen py-20 flex items-center justify-center overflow-hidden" style={{ background: "var(--hero-gradient)" }}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: 200 + i * 100,
              height: 200 + i * 100,
              background: i % 2 === 0 ? "hsl(var(--gaming-glow))" : "hsl(var(--gaming-cyan))",
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -20, 30, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium border border-white/20 mb-6">
            Organized by Nagaland E-Sports Society (NESS)
          </span>
        </motion.div>

        <motion.h1
          className="font-['Rajdhani'] text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight mb-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex flex-col items-center gap-4 mb-6">
            <img 
              src="/NGE.png" 
              alt="NGE 2026 Logo" 
              className="h-20 md:h-32 lg:h-40 w-auto"
            />
          </div>
          NAGALAND
          <br />
          <span className="text-gradient">GAMING EXPO</span>
          <br />
          <span className="text-accent">2026</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          The biggest Inter-College E-Sports Showcase in Nagaland. Compete in BGMI & Mobile Legends for a prize pool of ₹2,00,000!
        </motion.p>

        <motion.div
          className="flex flex-wrap justify-center gap-4 md:gap-6 text-white/70 text-sm mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-accent" /> June 2026
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" /> Kohima Old Secretariat, Nagaland
          </span>
          <span className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-accent" /> ₹2,00,000 Prize Pool
          </span>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button asChild size="lg" className="text-base px-8 glow-primary">
            <a href="#register">Register Your Team</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-10 text-lg border-white/20 hover:bg-white hover:text-black transition-colors w-full sm:w-auto rounded-xl">
            <a href="#sponsors">Become a Sponsor</a>
          </Button>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
