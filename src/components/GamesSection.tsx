import { motion } from "framer-motion";
import { Gamepad2, Users, Trophy, Target } from "lucide-react";

const games = [
  {
    title: "BGMI",
    subtitle: "Battlegrounds Mobile India",
    desc: "Battle Royale — Squad-based tactical combat. 4-player teams compete across multiple rounds for survival supremacy.",
    color: "from-orange-500/20 to-red-500/20",
    border: "hover:border-orange-500/50",
  },
  {
    title: "Mobile Legends",
    subtitle: "Bang Bang",
    desc: "5v5 MOBA — Strategic team battles with heroes, lanes, and objectives. Fast-paced action requiring coordination and skill.",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "hover:border-cyan-500/50",
  },
];

const GamesSection = () => {
  return (
    <section id="games" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-2 block">Featured Titles</span>
          <h2 className="font-['Rajdhani'] text-4xl md:text-5xl font-bold text-foreground">
            Tournament <span className="text-gradient">Games</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {games.map((game, i) => (
            <motion.div
              key={i}
              className={`relative rounded-2xl border border-border bg-gradient-to-br ${game.color} p-8 ${game.border} transition-all group overflow-hidden`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Gamepad2 className="absolute top-6 right-6 h-20 w-20 text-foreground/5 group-hover:text-foreground/10 transition-colors" />
              <h3 className="font-['Rajdhani'] text-3xl font-bold text-foreground mb-1">{game.title}</h3>
              <p className="text-sm text-primary font-medium mb-4">{game.subtitle}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{game.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GamesSection;
