import { motion } from 'motion/react';
import { Trophy, FileText, BadgeCheck, ExternalLink, Users } from 'lucide-react';

const publication = {
  title: 'Tabular Embeddings for Tables with Bi-Dimensional Hierarchical Metadata and Nesting',
  authors: ['Gyanendra Shrestha', 'Chutain Jiang', 'Sai Akula', 'Vivek Yannam', 'Anna Pyayt', 'Michael Gubanov'],
  venue: 'EDBT 2025',
  summary:
    'Developed specialized vector representations for 2D tables with hierarchical metadata and nested structures, introducing bi-dimensional tabular coordinates and a visibility matrix. Achieved MAP delta of up to 0.28 over existing solutions across five large datasets and three downstream tasks.',
  link: 'https://arxiv.org/abs/2502.15819',
};

const hackathons = [
  {
    event: 'Rift Rewind Hackathon',
    organizer: 'AWS × Riot Games',
    placement: '2nd Place',
    prize: '$7,000 cash + $7,000 AWS credits',
    date: 'Sep – Nov 2025',
    participants: '2,642',
    link: 'https://devpost.com/software/rift-analyser',
    color: '#FF9900',
  },
  {
    event: 'AI Accelerate: Unlocking New Frontiers',
    organizer: 'Google Cloud × Elastic × Fivetran',
    placement: '2nd Place',
    prize: 'Elastic Challenge Winner · $7.5K prize',
    date: 'Sep – Oct 2025',
    participants: '2,735',
    link: 'https://devpost.com/software/procheck',
    color: '#4285F4',
  },
  {
    event: 'Med-Gemma Impact Challenge',
    organizer: 'Google × Kaggle',
    placement: 'Agentic Workflow Prize',
    prize: 'Agentic Workflow Prize 1',
    date: '2025',
    participants: '',
    link: 'https://github.com/sgakula/case-twin',
    color: '#20BEFF',
  },
];

const certifications = [
  {
    issuer: 'AWS',
    name: 'AWS Certified Cloud Practitioner',
    link: 'https://drive.google.com/file/d/1JmHcJd8Aa_0G1RTGa9ajnztiK55wQGk9/view',
    color: '#FF9900',
    badge: 'AWS',
  },
  {
    issuer: 'DeepLearning.AI',
    name: 'Linear Algebra for Machine Learning and Data Science',
    link: 'https://drive.google.com/file/d/126Tb8MQEAAlFk5bmZxQu6NvsVFmi97y1/view',
    color: '#00A0DC',
    badge: 'DL.AI',
  },
  {
    issuer: 'DeepLearning.AI',
    name: 'Calculus for Machine Learning and Data Science',
    link: 'https://drive.google.com/file/d/1LqtcFNWeUxHJniVPjnDYYgmRT35vfVNg/view',
    color: '#00A0DC',
    badge: 'DL.AI',
  },
  {
    issuer: 'iNeuron.ai',
    name: 'Full Stack Data Science',
    link: 'https://drive.google.com/file/d/161qcsXRkcPUuuarFkTpe6ScxT10mcrGq/view',
    color: '#7C3AED',
    badge: 'iN',
  },
];

const GLASS = {
  background: 'rgba(30, 30, 30, 0.6)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
};

export function AchievementsSection() {
  return (
    <section className="py-20 px-4 md:px-8 relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto mb-12"
      >
        <h2
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Achievements
        </h2>
        <p className="text-foreground/70" style={{ fontFamily: 'var(--font-sans)' }}>
          Research, hackathons, and certifications
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Research Publication ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl p-6 relative overflow-hidden"
          style={GLASS}
        >
          {/* Accent glow */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at top left, rgba(168,230,207,0.15), transparent 60%)',
            }}
          />
          {/* Left accent bar */}
          <div className="absolute left-0 top-6 bottom-6 w-0.5 bg-[#A8E6CF] rounded-full" />

          <div className="relative pl-4 flex flex-col md:flex-row gap-6">
            <div className="flex-1 min-w-0">
              {/* Label */}
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-3.5 h-3.5 text-[#A8E6CF]" />
                <span
                  className="text-[10px] font-mono text-[#A8E6CF] uppercase tracking-widest"
                >
                  Research Publication
                </span>
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold"
                  style={{
                    background: 'rgba(168,230,207,0.12)',
                    color: '#A8E6CF',
                    border: '1px solid rgba(168,230,207,0.3)',
                  }}
                >
                  {publication.venue}
                </span>
              </div>

              <h3
                className="text-lg font-bold leading-snug mb-2"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {publication.title}
              </h3>

              <p
                className="text-xs text-foreground/45 mb-3"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {publication.authors.join(' · ')}
              </p>

              <p
                className="text-sm text-foreground/65 leading-relaxed"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {publication.summary}
              </p>
            </div>

            {/* CTA */}
            <div className="flex md:flex-col items-start md:items-end justify-start md:justify-center flex-shrink-0">
              <motion.a
                href={publication.link}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-mono font-bold transition-colors"
                style={{
                  background: 'rgba(168,230,207,0.12)',
                  border: '1px solid rgba(168,230,207,0.35)',
                  color: '#A8E6CF',
                }}
              >
                View on arXiv
                <ExternalLink className="w-3.5 h-3.5" />
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* ── Hackathon Wins ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hackathons.map((hack, i) => (
            <motion.div
              key={hack.event}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl p-6 relative overflow-hidden group"
              style={GLASS}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at top left, ${hack.color}18, transparent 65%)`,
                }}
              />
              {/* Top accent line */}
              <div
                className="absolute top-0 left-6 right-6 h-0.5 rounded-full"
                style={{ background: `linear-gradient(90deg, ${hack.color}80, transparent)` }}
              />

              <div className="relative">
                {/* Header row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${hack.color}18`,
                        border: `1.5px solid ${hack.color}50`,
                      }}
                    >
                      <Trophy className="w-5 h-5" style={{ color: hack.color }} />
                    </div>
                    <div>
                      <p
                        className="text-xl font-bold font-mono"
                        style={{ color: hack.color }}
                      >
                        {hack.placement}
                      </p>
                      <p className="text-xs text-foreground/50 font-mono">{hack.organizer}</p>
                    </div>
                  </div>
                  <a
                    href={hack.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/30 hover:text-foreground/80 transition-colors mt-0.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <h3
                  className="font-bold mb-1.5 leading-snug"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {hack.event}
                </h3>

                <p
                  className="text-sm font-mono font-semibold mb-3"
                  style={{ color: hack.color }}
                >
                  {hack.prize}
                </p>

                <div className="flex items-center gap-4 pt-3 border-t border-white/5">
                  <span className="text-xs text-foreground/45 font-mono">{hack.date}</span>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-foreground/35" />
                    <span className="text-xs text-foreground/45 font-mono">
                      {hack.participants} participants
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Certifications ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BadgeCheck className="w-3.5 h-3.5 text-[#2E5BFF]" />
            <span className="text-[10px] font-mono text-[#2E5BFF] uppercase tracking-widest">
              Certifications
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {certifications.map((cert, i) => (
              <motion.a
                key={cert.name}
                href={cert.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                whileHover={{ y: -3 }}
                className="rounded-2xl p-4 relative overflow-hidden group block"
                style={{
                  ...GLASS,
                  borderLeft: `2px solid ${cert.color}60`,
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at bottom right, ${cert.color}12, transparent 70%)`,
                  }}
                />

                <div className="relative">
                  {/* Top row: badge + link icon */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-bold font-mono"
                      style={{
                        background: `${cert.color}20`,
                        color: cert.color,
                        border: `1px solid ${cert.color}40`,
                      }}
                    >
                      {cert.badge}
                    </span>
                    <ExternalLink
                      className="w-3.5 h-3.5 text-foreground/25 group-hover:text-foreground/70 transition-colors"
                    />
                  </div>

                  <p
                    className="text-[11px] text-foreground/45 font-mono mb-1"
                  >
                    {cert.issuer}
                  </p>
                  <p
                    className="text-sm font-bold leading-snug"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {cert.name}
                  </p>

                  <p
                    className="text-[10px] font-mono mt-3 transition-colors"
                    style={{ color: cert.color }}
                  >
                    View Certificate →
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
