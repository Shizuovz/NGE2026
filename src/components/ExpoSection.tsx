import { motion } from "framer-motion";
import { Code, Briefcase, Users, Gamepad2 } from "lucide-react";

const expoComponents = [
  {
    icon: Code,
    title: "Game Development Showcase",
    description: "Explore local game development projects, interact with developers, and discover the future of gaming technology in Nagaland.",
    features: ["Project demos", "Developer talks", "Workshops", "Networking"],
    color: "from-purple-500/20 to-blue-500/20",
    borderColor: "hover:border-purple-500/50"
  },
  {
    icon: Briefcase,
    title: "Career Discussions",
    description: "Learn about career opportunities in gaming, esports management, streaming, and digital content creation from industry experts.",
    features: ["Industry panels", "Career guidance", "Skill workshops", "Job opportunities"],
    color: "from-green-500/20 to-emerald-500/20",
    borderColor: "hover:border-green-500/50"
  },
  {
    icon: Users,
    title: "Cosplay Competition",
    description: "Celebrate gaming culture through creative cosplay. Show off your favorite characters and compete for exciting prizes.",
    features: ["Character cosplay", "Prize categories", "Photo zones", "Community voting"],
    color: "from-pink-500/20 to-rose-500/20",
    borderColor: "hover:border-pink-500/50"
  },
  {
    icon: Gamepad2,
    title: "Interactive Zones",
    description: "Experience the latest gaming technology, try new games, and participate in casual gaming activities throughout the expo.",
    features: ["Free play areas", "New game demos", "VR experiences", "Community gaming"],
    color: "from-orange-500/20 to-red-500/20",
    borderColor: "hover:border-orange-500/50"
  }
];

const ExpoSection = () => {
  return (
    <section id="expo" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-2 block">More Than Gaming</span>
          <h2 className="font-['Rajdhani'] text-4xl md:text-5xl font-bold text-foreground">
            Expo <span className="text-gradient">Components</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Discover the complete gaming ecosystem with development showcases, career opportunities, creative competitions, and interactive experiences.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {expoComponents.map((component, i) => (
            <motion.div
              key={i}
              className={`rounded-2xl border border-border bg-gradient-to-br ${component.color} p-8 ${component.borderColor} transition-all group overflow-hidden`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                  <component.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-['Rajdhani'] text-2xl font-bold text-foreground mb-3">{component.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">{component.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">What's Included</h4>
                <div className="grid grid-cols-2 gap-2">
                  {component.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
            <Gamepad2 className="h-4 w-4" />
            <span className="text-sm font-medium">First gaming-only expo in Nagaland</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExpoSection;
