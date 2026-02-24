import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const stats = [
  { value: 200000, prefix: "₹", suffix: "", label: "Prize Pool" },
  { value: 20, prefix: "", suffix: "+", label: "Colleges" },
  { value: 50, prefix: "", suffix: "+", label: "Teams Expected" },
  { value: 2, prefix: "", suffix: "", label: "Featured Games" },
];

function useCountUp(target: number, inView: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, inView]);
  return count;
}

const StatItem = ({ stat, inView }: { stat: typeof stats[0]; inView: boolean }) => {
  const count = useCountUp(stat.value, inView);
  const formatted = stat.value >= 1000 ? count.toLocaleString("en-IN") : count;
  return (
    <div className="text-center">
      <div className="font-['Rajdhani'] text-5xl md:text-6xl font-bold text-white mb-2">
        {stat.prefix}{formatted}{stat.suffix}
      </div>
      <div className="text-white/60 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
    </div>
  );
};

const StatsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 md:py-28" style={{ background: "linear-gradient(135deg, hsl(250 70% 20%), hsl(220 60% 12%))" }}>
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-['Rajdhani'] text-4xl md:text-5xl font-bold text-white">
            Big Numbers. <span className="text-accent">Bigger Impact.</span>
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <StatItem stat={s} inView={inView} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
