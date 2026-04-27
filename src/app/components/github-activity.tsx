import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { GitBranch, Star, GitPullRequest, BookOpen, Users } from 'lucide-react';

const USERNAME = 'sgakula';

// ── colour helpers ────────────────────────────────────────────────────────────

const CONTRIB_COLORS = [
  'rgba(255,255,255,0.05)', // 0 – empty
  '#0e4429',               // 1
  '#006d32',               // 2
  '#26a641',               // 3
  '#39d353',               // 4
];

const LANG_COLORS: Record<string, string> = {
  Python:           '#3776AB',
  TypeScript:       '#3178C6',
  JavaScript:       '#F7DF1E',
  HTML:             '#E34F26',
  'Jupyter Notebook':'#F37626',
  CSS:              '#563D7C',
  Shell:            '#89E051',
  Dockerfile:       '#384D54',
  Other:            '#6B7280',
};

// ── types ─────────────────────────────────────────────────────────────────────

interface ContribDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface LangEntry { name: string; value: number; color: string }

interface Stats {
  repos: number;
  stars: number;
  commits: number;
  prs: number;
  followers: number;
}

// ── heatmap helpers ───────────────────────────────────────────────────────────

function buildWeeks(contributions: ContribDay[]): ContribDay[][] {
  if (!contributions.length) return [];
  const sorted = [...contributions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  // Pad to start on Sunday
  const startDow = new Date(sorted[0].date + 'T12:00:00').getDay();
  const padded: ContribDay[] = [
    ...Array.from({ length: startDow }, () => ({ date: '', count: 0, level: 0 as const })),
    ...sorted,
  ];
  const weeks: ContribDay[][] = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));
  return weeks;
}

function getMonthLabels(weeks: ContribDay[][]): { label: string; col: number }[] {
  const labels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const first = week.find(d => d.date);
    if (!first) return;
    const m = new Date(first.date + 'T12:00:00').getMonth();
    if (m !== lastMonth) {
      labels.push({
        label: new Date(first.date + 'T12:00:00').toLocaleString('default', { month: 'short' }),
        col,
      });
      lastMonth = m;
    }
  });
  return labels;
}

// ── main component ────────────────────────────────────────────────────────────

export function GitHubActivity() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [weeks, setWeeks] = useState<ContribDay[][]>([]);
  const [languages, setLanguages] = useState<LangEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<ContribDay | null>(null);

  useEffect(() => {
    const currentYear = new Date().getFullYear();

    Promise.all([
      // 1. User profile
      fetch(`https://api.github.com/users/${USERNAME}`).then(r => r.json()),

      // 2. All repos (for stars + primary language)
      fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`).then(r => r.json()),

      // 3. Contribution heatmap
      fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`).then(r => r.json()),

      // 4. Total PR count
      fetch(`https://api.github.com/search/issues?q=is:pr+author:${USERNAME}&per_page=1`).then(r => r.json()),
    ])
      .then(([user, repos, contribs, prs]) => {
        // Stars
        const stars: number = Array.isArray(repos)
          ? repos.reduce((sum: number, r: { stargazers_count: number }) => sum + r.stargazers_count, 0)
          : 0;

        // Stats
        setStats({
          repos: user.public_repos ?? 0,
          followers: user.followers ?? 0,
          stars,
          commits: contribs?.total?.[currentYear] ?? contribs?.total?.lastYear ?? 0,
          prs: prs?.total_count ?? 0,
        });

        // Heatmap
        if (contribs?.contributions) setWeeks(buildWeeks(contribs.contributions));

        // Language distribution from primary language per repo
        if (Array.isArray(repos)) {
          const map: Record<string, number> = {};
          repos.forEach((r: { language: string | null }) => {
            if (r.language) map[r.language] = (map[r.language] ?? 0) + 1;
          });
          const sorted = Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);
          const total = sorted.reduce((s, [, v]) => s + v, 0);
          setLanguages(
            sorted.map(([name, count]) => ({
              name,
              value: Math.round((count / total) * 100),
              color: LANG_COLORS[name] ?? LANG_COLORS.Other,
            })),
          );
        }

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const monthLabels = getMonthLabels(weeks);
  const CELL = 11; // px per cell
  const GAP  = 2;  // px gap

  const statCards = stats
    ? [
        { icon: BookOpen,       label: 'Public Repos',  value: stats.repos,     color: '#2E5BFF' },
        { icon: Star,           label: 'Total Stars',   value: stats.stars,     color: '#F59E0B' },
        { icon: GitBranch,      label: `${new Date().getFullYear()} Commits`, value: stats.commits, color: '#39d353' },
        { icon: GitPullRequest, label: 'Pull Requests', value: stats.prs,       color: '#A78BFA' },
        { icon: Users,          label: 'Followers',     value: stats.followers, color: '#F472B6' },
      ]
    : [];

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
        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
          GitHub Activity
        </h2>
        <p className="text-foreground/70" style={{ fontFamily: 'var(--font-sans)' }}>
          Open-source contributions and coding
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto space-y-4">

        {/* ── stat cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        >
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.04)' }} />
              ))
            : statCards.map(({ icon: Icon, label, value, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  whileHover={{ y: -3 }}
                  className="relative rounded-2xl p-4 overflow-hidden"
                  style={{
                    background: 'rgba(30,30,30,0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(ellipse at top left, ${color}15, transparent 70%)` }} />
                  <Icon className="w-4 h-4 mb-2" style={{ color }} />
                  <p className="text-xl font-bold font-mono" style={{ color }}>{value.toLocaleString()}</p>
                  <p className="text-xs text-foreground/50 font-mono mt-0.5">{label}</p>
                </motion.div>
              ))}
        </motion.div>

        {/* ── heatmap + languages ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 rounded-2xl p-5"
            style={{
              background: 'rgba(30,30,30,0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold font-mono text-white/80">Contribution History</p>
              {hoveredDay?.date && (
                <span className="text-xs font-mono text-foreground/50">
                  {hoveredDay.count} contributions · {hoveredDay.date}
                </span>
              )}
            </div>

            {loading ? (
              <div className="h-28 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ) : weeks.length > 0 ? (
              <div className="overflow-x-auto">
                <div style={{ minWidth: weeks.length * (CELL + GAP) + 24 }}>
                  {/* Month labels */}
                  <div className="flex mb-1 ml-6">
                    {monthLabels.map(({ label, col }) => (
                      <div
                        key={`${label}-${col}`}
                        className="text-[9px] text-foreground/40 font-mono absolute"
                        style={{ left: 24 + col * (CELL + GAP) }}
                      >
                        {label}
                      </div>
                    ))}
                    <div style={{ height: 12 }} />
                  </div>

                  <div className="flex gap-0.5">
                    {/* Day labels */}
                    <div className="flex flex-col gap-0.5 mr-1.5">
                      {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
                        <div key={i} className="text-[9px] text-foreground/30 font-mono flex items-center"
                          style={{ height: CELL, lineHeight: 1 }}>
                          {d}
                        </div>
                      ))}
                    </div>

                    {/* Grid */}
                    {weeks.map((week, wi) => (
                      <div key={wi} className="flex flex-col gap-0.5">
                        {Array.from({ length: 7 }).map((_, di) => {
                          const day = week[di];
                          if (!day) return (
                            <div key={di} style={{ width: CELL, height: CELL }} />
                          );
                          return (
                            <motion.div
                              key={di}
                              initial={{ scale: 0, opacity: 0 }}
                              whileInView={{ scale: 1, opacity: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.2, delay: (wi * 7 + di) * 0.001 }}
                              onMouseEnter={() => setHoveredDay(day)}
                              onMouseLeave={() => setHoveredDay(null)}
                              className="rounded-[2px] cursor-pointer transition-transform hover:scale-125"
                              title={day.date ? `${day.count} contributions on ${day.date}` : ''}
                              style={{
                                width: CELL,
                                height: CELL,
                                backgroundColor: day.date
                                  ? CONTRIB_COLORS[day.level]
                                  : 'rgba(255,255,255,0.03)',
                              }}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-1.5 mt-3 justify-end">
                  <span className="text-[10px] text-foreground/30 font-mono">Less</span>
                  {CONTRIB_COLORS.map((c, i) => (
                    <div key={i} className="rounded-[2px]"
                      style={{ width: CELL, height: CELL, backgroundColor: c, border: '1px solid rgba(255,255,255,0.05)' }} />
                  ))}
                  <span className="text-[10px] text-foreground/30 font-mono">More</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground/30 font-mono">Could not load contribution data.</p>
            )}
          </motion.div>

          {/* Languages donut */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl p-5 flex flex-col"
            style={{
              background: 'rgba(30,30,30,0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p className="text-sm font-bold font-mono text-white/80 mb-4">Top Languages</p>

            {loading ? (
              <div className="flex-1 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ) : (
              <div className="flex flex-col items-center gap-4 flex-1">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={languages}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={72}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {languages.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, 'Usage']}
                      contentStyle={{
                        background: 'rgba(20,20,20,0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="w-full space-y-2">
                  {languages.map(lang => (
                    <div key={lang.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: lang.color }} />
                        <span className="text-xs font-mono text-foreground/70">{lang.name}</span>
                      </div>
                      <span className="text-xs font-mono" style={{ color: lang.color }}>
                        {lang.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
