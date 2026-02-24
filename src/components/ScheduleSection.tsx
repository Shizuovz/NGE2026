import { motion } from "framer-motion";
import { Swords, Music, Handshake, Calendar } from "lucide-react";

const day1Events = [
  {
    time: "10:00 AM - 12:00 PM",
    title: "Opening Ceremony",
    description: "Inauguration, welcome address, and sponsor introductions"
  },
  {
    time: "12:00 PM - 2:00 PM",
    title: "College Tournament Semi-Finals",
    description: "BGMI & Mobile Legends semi-final matches"
  },
  {
    time: "2:00 PM - 4:00 PM",
    title: "Game Development Showcase",
    description: "Local developer projects and tech demos"
  },
  {
    time: "4:00 PM - 6:00 PM",
    title: "Career Panel Discussions",
    description: "Industry experts discuss gaming career opportunities"
  },
  {
    time: "6:00 PM - 8:00 PM",
    title: "Open Tournament Qualifiers",
    description: "Professional and semi-pro team qualifications"
  },
  {
    time: "8:00 PM - 10:00 PM",
    title: "Cosplay Competition & Entertainment",
    description: "Cosplay contest, live performances, networking"
  }
];

const day2Events = [
  {
    time: "10:00 AM - 12:00 PM",
    title: "Expo Zone Activities",
    description: "Interactive gaming zones, VR experiences, product demos"
  },
  {
    time: "12:00 PM - 2:00 PM",
    title: "College Tournament Finals",
    description: "BGMI & Mobile Legends grand finals - Day 1"
  },
  {
    time: "2:00 PM - 4:00 PM",
    title: "Open Tournament Finals",
    description: "Professional category championship matches"
  },
  {
    time: "4:00 PM - 5:00 PM",
    title: "Awards & Recognition",
    description: "Prize distribution and winner celebrations"
  },
  {
    time: "5:00 PM - 6:00 PM",
    title: "Closing Ceremony",
    description: "Thank you address, sponsor recognition, future announcements"
  }
];

const ScheduleSection = () => {
  return (
    <section id="schedule" className="py-20 md:py-28 section-dark">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-secondary mb-2 block">Event Schedule</span>
          <h2 className="font-['Rajdhani'] text-4xl md:text-5xl font-bold text-white">
            Two-Day <span className="text-accent">Gaming Festival</span>
          </h2>
          <p className="text-white/60 mt-4 max-w-2xl mx-auto">
            Experience the complete gaming ecosystem across two action-packed days at Kohima Old Secretariat
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Day 1 */}
          <motion.div
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-6 w-6 text-secondary" />
              <h3 className="font-['Rajdhani'] text-2xl font-bold text-white">Day 1</h3>
              <span className="text-sm text-white/60">June 2026</span>
            </div>
            
            <div className="space-y-4">
              {day1Events.map((event, i) => (
                <motion.div
                  key={i}
                  className="border-l-2 border-accent/30 pl-4 py-2"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-accent">{event.time}</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">{event.title}</h4>
                  <p className="text-sm text-white/60">{event.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Day 2 */}
          <motion.div
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-6 w-6 text-secondary" />
              <h3 className="font-['Rajdhani'] text-2xl font-bold text-white">Day 2</h3>
              <span className="text-sm text-white/60">June 2026</span>
            </div>
            
            <div className="space-y-4">
              {day2Events.map((event, i) => (
                <motion.div
                  key={i}
                  className="border-l-2 border-secondary/30 pl-4 py-2"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-secondary">{event.time}</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">{event.title}</h4>
                  <p className="text-sm text-white/60">{event.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tournament Structure Overview */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-white/10 border border-white/20">
            <Swords className="h-5 w-5 text-accent" />
            <span className="text-white font-medium">
              College Qualifiers → Semi-Finals (Day 1) → Grand Finals (Day 2)
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ScheduleSection;
