import { motion } from "framer-motion";
import { Gamepad2, Users, Trophy, Target } from "lucide-react";

const features = [
  { icon: Gamepad2, title: "BGMI & Mobile Legends", desc: "Two flagship tournament titles with intense competitive matches" },
  { icon: Trophy, title: "₹2,00,000 Prize Pool", desc: "Compete for the biggest esports prize pool in Nagaland" },
  { icon: Users, title: "Inter-College Showcase", desc: "Colleges across Nagaland battle for ultimate bragging rights" },
  { icon: Target, title: "Professional Production", desc: "Live streaming, shoutcasters, and broadcast-quality production" },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left - text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-2 block">About the Event</span>
            <h2 className="font-['Rajdhani'] text-4xl md:text-5xl font-bold text-foreground mb-6">
              The Future of<br />
              <span className="text-gradient">E-Sports in Nagaland</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The Nagaland Gaming Expo 2026 is the flagship initiative of the <strong>Nagaland E-Sports Society (NESS)</strong> — a platform dedicated to nurturing competitive gaming culture among the youth of Nagaland. This Inter-College E-Sports Showcase brings together the best gaming talent from colleges across the state.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              With professional tournament infrastructure, live streaming, expert shoutcasters, and an electrifying atmosphere, NGE 2026 aims to put Nagaland on the national esports map.
            </p>
          </motion.div>

          {/* Right - feature cards */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {features.map((f, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all hover:shadow-lg group"
              >
                <f.icon className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-['Rajdhani'] font-bold text-lg text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
