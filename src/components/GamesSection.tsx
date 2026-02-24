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
          <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-2 block">Tournament Structure</span>
          <h2 className="font-['Rajdhani'] text-4xl md:text-5xl font-bold text-foreground">
            Dual <span className="text-gradient">Tournament</span> Format
          </h2>
        </motion.div>

        {/* Tournament Categories */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            className="rounded-2xl border border-border bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-8 hover:border-purple-500/50 transition-all group"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Users className="h-12 w-12 text-purple-500 mb-4" />
            <h3 className="font-['Rajdhani'] text-2xl font-bold text-foreground mb-3">Inter-College Showcase</h3>
            <p className="text-muted-foreground mb-4">College students from across Nagaland compete for glory and prizes.</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span>College-level qualifiers</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span>Semi-Finals: Day 1 | Grand Finals: Day 2</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">₹1,00,000 per game</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-border bg-gradient-to-br from-orange-500/20 to-red-500/20 p-8 hover:border-orange-500/50 transition-all group"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Gamepad2 className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="font-['Rajdhani'] text-2xl font-bold text-foreground mb-3">Open Category Tournament</h3>
            <p className="text-muted-foreground mb-4">Working professionals, semi-pro gamers, and community teams.</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Premium audience with higher spending power</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span>Direct entry to competitive brackets</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">Professional-level competition</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Featured Games */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="font-['Rajdhani'] text-2xl font-bold text-foreground mb-2">Featured Games</h3>
          <p className="text-muted-foreground">Both tournaments feature these competitive titles</p>
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
