import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Github, ExternalLink, Youtube, X, Send } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const _apiKey = import.meta.env.VITE_GEMINI_API_KEY;

interface Project {
  title: string;
  description: string;
  tech: string[];
  span: string;
  github?: string;
  demo?: string;
  youtube?: string;
  imageURL?: string;
  readmeRepo: string;
  readmeOwner?: string;
}

const projects: Project[] = [
  {
    title: 'VidMod',
    description:
      'Autonomous video compliance agent using Gemini 3.0 to detect and remediate content violations with five AI-powered actions: blur, pixelate, replace, dub, and beep. Full-video temporal reasoning via 1M+ token context.',
    tech: ['Gemini 3.0', 'FastAPI', 'React', 'FFmpeg'],
    span: 'col-span-1 row-span-1',
    github: 'https://github.com/sgakula/VidMod',
    youtube: 'https://youtu.be/Yl4bevvtUls',
    readmeRepo: 'VidMod',
  },
  {
    title: 'Procheck',
    description:
      'Full-stack medical protocol search platform with hybrid AI search engine combining Elasticsearch BM25 with Google Gemini semantic vectors.',
    tech: ['React', 'FastAPI', 'Firebase', 'Gemini'],
    span: 'col-span-1 row-span-1',
    github: 'https://github.com/sgakula/procheck/',
    youtube: 'https://youtu.be/QS8evOeT4SM',
    demo: 'https://procheck-app.web.app/',
    readmeRepo: 'procheck',
  },
  {
    title: 'Flight Price Estimation',
    description:
      'Production-ready MLOps pipeline for Indian flight price prediction achieving R² of 0.98. Deployed on AWS ECS.',
    tech: ['Random Forest', 'FastAPI', 'Docker', 'AWS'],
    span: 'col-span-1 row-span-1',
    github: 'https://github.com/sgakula/flight-price-estimation',
    imageURL: 's3urlimageflightpriceestimation',
    readmeRepo: 'flight-price-estimation',
  },
  {
    title: 'Manus',
    description:
      'Production voice assistant processing natural language through Google Cloud and Gemini AI with 99.9% uptime.',
    tech: ['Gemini 2.0', 'FastAPI', 'React', 'Qdrant'],
    span: 'col-span-1 row-span-1',
    github: 'https://github.com/sgakula/Jarvis',
    youtube: 'https://youtu.be/c2WNQVV0zQ0',
    readmeRepo: 'Jarvis',
  },
  {
    title: 'YELP (Democratic Voting)',
    description:
      'Group decision-making app combining Gemini 2.0 multimodal API with Yelp Fusion to give intelligent restaurant recommendations.',
    tech: ['React 19', 'TypeScript', 'Firestore', 'AWS'],
    span: 'col-span-1 md:col-span-2 row-span-1',
    github: 'https://github.com/sgakula/YELPB',
    youtube: 'https://youtu.be/0NWjm0Mo3k0',
    readmeRepo: 'YELPB',
  },
  {
    title: 'Rift Rewind',
    description:
      'App delivering personalized year-end recaps and match analysis by integrating Amazon Bedrock Claude 3 Sonnet AI.',
    tech: ['React 18', 'Bedrock', 'DynamoDB'],
    span: 'col-span-1 row-span-1',
    github: 'https://github.com/sgakula/LeagueOfLegends_AICoach',
    youtube: 'https://youtu.be/WIV69NMOUNE',
    readmeRepo: 'LeagueOfLegends_AICoach',
  },
  {
    title: 'Taxi Weather Analytics',
    description:
      'End-to-end ETL pipeline orchestrating data validation, weather API integration and ML training using Airflow.',
    tech: ['Airflow', 'Docker', 'PostgreSQL'],
    span: 'col-span-1 row-span-1',
    github: 'https://github.com/sgakula/taxi-weather-analytics',
    imageURL: 's3urlimagetaxiweatheranalytics',
    readmeRepo: 'taxi-weather-analytics',
  },
  {
    title: 'CaseTwin',
    description:
      'Clinical intelligence platform collapsing a 4-hour medical referral workflow to ~5 minutes. Combines chest X-ray analysis via MedGemma, case matching with MedSiglip embeddings, agentic hospital routing, and auto-generated referral memos. Won Agentic Workflow Prize 1 at the Google × Kaggle Med-Gemma Impact Challenge.',
    tech: ['MedGemma', 'CrewAI', 'Gemini 2.5', 'FastAPI', 'Qdrant'],
    span: 'col-span-1 row-span-1',
    github: 'https://github.com/sgakula/case-twin',
    youtube: 'https://youtu.be/7vBo-Qunr3o',
    readmeRepo: 'case-twin',
  },
  {
    title: 'CryptoStreamML',
    description:
      'Real-time crypto price prediction pipeline streaming from CoinGecko via Apache Kafka, with ML-driven direction predictions, A/B testing between champion/challenger models, drift detection, and live Grafana dashboards.',
    tech: ['Kafka', 'MLflow', 'InfluxDB', 'Docker'],
    span: 'col-span-1 row-span-1',
    github: 'https://github.com/sgakula/CryptoStreamML',
    imageURL: "https://portfolioimagesforgana.s3.us-east-1.amazonaws.com/cryptostreamML.png",
    readmeRepo: 'CryptoStreamML',
  }
];

// ── helpers ─────────────────────────────────────────────────────────────────

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:v\/|embed\/|watch\?v=))([^&?/\s]+)/);
  return m ? m[1] : null;
}

function renderInline(text: string): React.ReactNode {
  // Priority order in the split regex:
  //  1. Linked image  [![alt](img_url)](link_url)  — must come before both image & link
  //  2. Standalone image  ![alt](url)
  //  3. Link  [text](url)
  //  4. Bold  **text**
  //  5. Inline code  `code`
  const parts = text.split(
    /(\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)|!\[[^\]]*\]\([^)]*\)|\[[^\]]*\]\([^)]*\)|\*\*[^*]+\*\*|`[^`]+`)/g,
  );

  return parts.map((part, i) => {
    // 1. Linked image: [![alt](img_url)](link_url)
    if (part.startsWith('[!')) {
      const m = part.match(/^\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)$/);
      if (m)
        return (
          <a key={i} href={m[3]} target="_blank" rel="noopener noreferrer">
            <img
              src={m[2]} alt={m[1]}
              className="inline h-5 align-middle"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </a>
        );
    }
    // 2. Standalone image: ![alt](url)
    if (part.startsWith('![')) {
      const m = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (m)
        return (
          <img
            key={i} src={m[2]} alt={m[1]}
            className="inline h-5 align-middle"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        );
    }
    // 3. Link: [text](url)
    if (part.startsWith('[')) {
      const m = part.match(/^\[([^\]]*)\]\(([^)]+)\)$/);
      if (m)
        return (
          <a key={i} href={m[2]} target="_blank" rel="noopener noreferrer"
            className="text-[#2E5BFF] underline hover:opacity-80">
            {m[1]}
          </a>
        );
    }
    // 4. Bold
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    // 5. Inline code
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2)
      return <code key={i} className="bg-black/40 px-1 rounded text-[#A8E6CF] text-[11px] font-mono">{part.slice(1, -1)}</code>;

    return <span key={i}>{part}</span>;
  });
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push(
        <pre key={`cb${i}`} className="bg-black/50 border border-white/10 rounded-lg p-3 my-2 overflow-x-auto text-xs text-[#A8E6CF] font-mono whitespace-pre">
          {codeLines.join('\n')}
        </pre>,
      );
      i++;
      continue;
    }

    // Badge-only line: all tokens are linked images or standalone images → render as flex row
    if (/^(\s*\[?!\[[^\]]*\]\([^)]*\)\]?\([^)]*\)\s*)+$/.test(line.trim()) && line.trim().startsWith('[!')) {
      nodes.push(
        <div key={i} className="flex flex-wrap gap-1.5 my-2">
          {renderInline(line)}
        </div>,
      );
    }
    else if (line.startsWith('# '))
      nodes.push(<h1 key={i} className="text-lg font-bold text-[#2E5BFF] mt-5 mb-2 font-mono">{line.slice(2)}</h1>);
    else if (line.startsWith('## '))
      nodes.push(<h2 key={i} className="text-base font-bold text-white mt-4 mb-1.5 font-mono">{line.slice(3)}</h2>);
    else if (line.startsWith('### '))
      nodes.push(<h3 key={i} className="text-sm font-bold text-white/90 mt-3 mb-1 font-mono">{line.slice(4)}</h3>);
    else if (/^[-*] /.test(line))
      nodes.push(
        <div key={i} className="flex gap-2 text-sm text-foreground/75 my-0.5 leading-relaxed">
          <span className="text-[#2E5BFF] flex-shrink-0">•</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>,
      );
    else if (/^\d+\. /.test(line)) {
      const nm = line.match(/^(\d+)\. (.*)/);
      if (nm)
        nodes.push(
          <div key={i} className="flex gap-2 text-sm text-foreground/75 my-0.5 leading-relaxed">
            <span className="text-[#2E5BFF] flex-shrink-0 font-mono text-xs">{nm[1]}.</span>
            <span>{renderInline(nm[2])}</span>
          </div>,
        );
    } else if (/^---+$/.test(line.trim()))
      nodes.push(<hr key={i} className="border-white/10 my-3" />);
    else if (line.startsWith('> '))
      nodes.push(
        <div key={i} className="border-l-2 border-[#2E5BFF]/50 pl-3 my-1 text-sm text-foreground/60 italic">
          {renderInline(line.slice(2))}
        </div>,
      );
    else if (line.trim() === '')
      nodes.push(<div key={i} className="h-2" />);
    // HTML <img> tag — render the image
    else if (/^\s*<img\s/i.test(line)) {
      const src = line.match(/src="([^"]+)"/)?.[1];
      const alt = line.match(/alt="([^"]*)"/)?.[1] ?? '';
      if (src)
        nodes.push(
          <img key={i} src={src} alt={alt}
            className="max-w-full rounded-lg my-2 border border-white/10"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />,
        );
    }
    // Other raw HTML tags — skip silently
    else if (/^\s*<[a-zA-Z/]/.test(line)) { /* skip */ }
    else
      nodes.push(
        <p key={i} className="text-sm text-foreground/75 leading-relaxed">
          {renderInline(line)}
        </p>,
      );

    i++;
  }

  return <div>{nodes}</div>;
}

// ── mini project chat ────────────────────────────────────────────────────────

interface ChatMsg { id: string; text: string; sender: 'user' | 'bot' }

function ProjectChat({ project }: { project: Project }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: '0', sender: 'bot', text: `Ask me anything about ${project.title}!` },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chatRef = useRef<any>(null);

  useEffect(() => {
    if (_apiKey) {
      const systemPrompt = `You are a concise assistant for the project "${project.title}".
Project details:
- Description: ${project.description}
- Tech stack: ${project.tech.join(', ')}
${project.github ? `- GitHub: ${project.github}` : ''}
${project.demo ? `- Live demo: ${project.demo}` : ''}
${project.youtube ? `- Demo video: ${project.youtube}` : ''}
Answer questions about this project only. Keep answers short (2-4 sentences).`;

      const model = new GoogleGenerativeAI(_apiKey).getGenerativeModel({
        model: 'gemini-3-flash-preview',
        systemInstruction: systemPrompt,
      });
      chatRef.current = model.startChat({ history: [] });
    }
  }, [project.title]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || typing) return;
    const q = input;
    const botId = `b${Date.now()}`;
    setMessages(p => [...p, { id: `u${Date.now()}`, sender: 'user', text: q }]);
    setInput('');
    setTyping(true);

    if (chatRef.current) {
      try {
        const result = await chatRef.current.sendMessageStream(q);
        let fullText = '';
        let firstChunk = true;
        for await (const chunk of result.stream) {
          fullText += chunk.text();
          if (firstChunk) {
            setTyping(false);
            setMessages(p => [...p, { id: botId, sender: 'bot', text: fullText }]);
            firstChunk = false;
          } else {
            setMessages(p => p.map(m => m.id === botId ? { ...m, text: fullText } : m));
          }
        }
      } catch {
        setTyping(false);
        setMessages(p => [...p, { id: botId, sender: 'bot', text: 'Something went wrong. Try again!' }]);
      }
    } else {
      // fallback when no API key
      setTimeout(() => {
        const l = q.toLowerCase();
        let reply = `${project.title}: ${project.description} Built with ${project.tech.join(', ')}.`;
        if (l.includes('tech') || l.includes('stack')) reply = `${project.title} uses: ${project.tech.join(', ')}.`;
        else if (l.includes('github') || l.includes('code')) reply = project.github ? `Code → ${project.github}` : 'Source not public.';
        else if (l.includes('demo') || l.includes('live')) reply = project.demo ? `Live → ${project.demo}` : 'No live demo.';
        else if (l.includes('video')) reply = project.youtube ? `Video → ${project.youtube}` : 'No video available.';
        setMessages(p => [...p, { id: botId, sender: 'bot', text: reply }]);
        setTyping(false);
      }, 400);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
              m.sender === 'user'
                ? 'bg-[#2E5BFF] text-white'
                : 'bg-white/5 border border-white/10 text-foreground/80'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 bg-[#A8E6CF] rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-white/10 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={`Ask about ${project.title}…`}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2E5BFF]/50 placeholder:text-foreground/30"
          style={{ fontSize: '16px' }}
        />
        <button onClick={send} className="p-2 bg-[#2E5BFF] rounded-lg hover:bg-[#2E5BFF]/90 transition-colors flex-shrink-0">
          <Send className="w-3 h-3 text-white" />
        </button>
      </div>
    </div>
  );
}

// ── detail panel ─────────────────────────────────────────────────────────────

function ProjectPanel({ project, onClose }: { project: Project; onClose: () => void }) {
  const [readme, setReadme] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'readme' | 'chat'>('readme');

  useEffect(() => {
    setLoading(true);
    setReadme('');
    (async () => {
      for (const branch of ['main', 'master']) {
        try {
          const r = await fetch(
            `https://raw.githubusercontent.com/${project.readmeOwner ?? 'sgakula'}/${project.readmeRepo}/${branch}/README.md`,
          );
          if (r.ok) {
            setReadme(await r.text());
            setLoading(false);
            return;
          }
        } catch { /* try next branch */ }
      }
      setReadme('No README found for this repository.');
      setLoading(false);
    })();
  }, [project.readmeRepo]);

  const ytId = project.youtube ? getYouTubeId(project.youtube) : null;

  return (
    <div className="flex flex-col h-full">

      {/* ── header ── */}
      <div className="flex items-start justify-between p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex-1 pr-3 min-w-0">
          <h2 className="text-base font-bold font-mono text-white mb-2 truncate">{project.title}</h2>
          <div className="flex flex-wrap gap-1.5">
            {project.tech.map((t, i) => (
              <span key={i} className="px-2 py-0.5 bg-[#2E5BFF]/10 border border-[#2E5BFF]/30 rounded-full text-[11px] text-[#2E5BFF] font-mono">{t}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Source code">
              <Github className="w-4 h-4 text-foreground/60" />
            </a>
          )}
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Live site">
              <ExternalLink className="w-4 h-4 text-[#2E5BFF]" />
            </a>
          )}
          {project.youtube && (
            <a href={project.youtube} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Demo video">
              <Youtube className="w-4 h-4 text-[#FF4444]" />
            </a>
          )}
          <button onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── preview ── */}
      <div className="flex-shrink-0 mx-4 mt-3 rounded-xl overflow-hidden border border-white/10 bg-black/30" style={{ height: 190 }}>
        {ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : project.demo ? (
          <div className="relative w-full h-full">
            <img
              src={`https://image.thum.io/get/width/800/crop/400/noanimate/${project.demo}`}
              alt={`${project.title} preview`}
              className="w-full h-full object-cover object-top"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <a href={project.demo} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/70 rounded text-[11px] text-[#2E5BFF] backdrop-blur-sm border border-[#2E5BFF]/30 hover:bg-[#2E5BFF]/20 transition-colors">
              <ExternalLink className="w-3 h-3" /> View Live
            </a>
          </div>
        ) : project.imageURL ? (
          <img
            src={project.imageURL}
            alt={`${project.title} preview`}
            className="w-full h-full object-cover object-top"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground/20 text-sm font-mono">
            No preview available
          </div>
        )}
      </div>

      {/* ── tabs ── */}
      <div className="flex mx-4 mt-3 border-b border-white/10 flex-shrink-0">
        {(['readme', 'chat'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-mono capitalize border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-[#2E5BFF] text-[#2E5BFF]'
                : 'border-transparent text-foreground/40 hover:text-foreground/70'
            }`}>
            {t === 'readme' ? 'README.md' : 'Chat'}
          </button>
        ))}
      </div>

      {/* ── tab content ── */}
      <div className="flex-1 overflow-hidden mx-4 mb-4 mt-2 min-h-0">
        {tab === 'readme' ? (
          <div className="h-full overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center gap-2 text-foreground/40 text-sm font-mono py-6">
                <motion.div className="w-4 h-4 border-2 border-[#2E5BFF]/30 border-t-[#2E5BFF] rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                Loading README…
              </div>
            ) : (
              <MarkdownRenderer content={readme} />
            )}
          </div>
        ) : (
          <div className="h-full border border-white/10 rounded-xl overflow-hidden">
            <ProjectChat project={project} />
          </div>
        )}
      </div>

    </div>
  );
}

// ── main grid ────────────────────────────────────────────────────────────────

export function ProjectsGrid() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const panelOpen = selected !== null;

  return (
    <section className="min-h-screen py-20 px-4 md:px-8 relative">

      {/* section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
          Featured Projects
        </h2>
        <p className="text-foreground/70" style={{ fontFamily: 'var(--font-sans)' }}>
          A selection of recent work spanning deep learning, MLOps, and production systems
        </p>
      </motion.div>

      {/* Mobile backdrop when panel open */}
      <AnimatePresence>
        {selected && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 md:hidden"
            onClick={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

      {/* flex layout: grid + panel (desktop only — mobile uses block) */}
      <div className="max-w-7xl mx-auto md:flex md:gap-4 md:items-start">

        {/* ── project grid ── */}
        <motion.div
          animate={{ flexBasis: panelOpen && !isMobile ? '50%' : '100%' }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ flexShrink: 0 }}
          className={`grid gap-4 min-w-0 w-full ${
            panelOpen && !isMobile
              ? 'grid-cols-2 auto-rows-[220px]'
              : 'grid-cols-1 md:grid-cols-4 md:auto-rows-[300px]'
          }`}
        >
          {projects.map((project, index) => {
            const isSelected = selected?.title === project.title;
            return (
              <motion.div
                key={project.title}
                layout
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={!isSelected ? { scale: 1.02, y: -3 } : {}}
                onClick={() => setSelected(isSelected ? null : project)}
                className={`${panelOpen ? 'col-span-1 row-span-1' : project.span} group relative overflow-hidden rounded-2xl p-5 cursor-pointer`}
                style={{
                  background: 'rgba(30, 30, 30, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: isSelected
                    ? '1px solid rgba(46, 91, 255, 0.6)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: isSelected ? '0 0 20px rgba(46,91,255,0.15)' : undefined,
                }}
              >
                {/* hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2E5BFF]/20 to-transparent" />
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(46,91,255,0.3)]" />
                </div>

                {/* selected indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#2E5BFF]" />
                )}

                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <h3
                      className={`font-bold mb-2 transition-colors ${panelOpen ? 'text-base' : 'text-xl'} ${isSelected ? 'text-[#2E5BFF]' : 'group-hover:text-[#2E5BFF]'}`}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {project.title}
                    </h3>
                    {!panelOpen && (
                      <p className="text-sm text-foreground/70 mb-4" style={{ fontFamily: 'var(--font-sans)' }}>
                        {project.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tech.slice(0, panelOpen ? 2 : project.tech.length).map((tech, i) => (
                        <span key={i}
                          className={`px-2 py-0.5 bg-[#2E5BFF]/10 border border-[#2E5BFF]/30 rounded-full text-[#2E5BFF] ${panelOpen ? 'text-[10px]' : 'text-xs'}`}
                          style={{ fontFamily: 'var(--font-mono)' }}>
                          {tech}
                        </span>
                      ))}
                      {panelOpen && project.tech.length > 2 && (
                        <span className="px-2 py-0.5 text-[10px] text-foreground/40 font-mono">
                          +{project.tech.length - 2}
                        </span>
                      )}
                    </div>

                    {!panelOpen && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {project.github && (
                          <motion.a href={project.github} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-foreground/80 hover:text-white transition-colors"
                            style={{ fontFamily: 'var(--font-mono)' }}>
                            <Github className="w-3.5 h-3.5" /><span>Code</span>
                          </motion.a>
                        )}
                        {project.youtube && (
                          <motion.a href={project.youtube} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF0000]/10 hover:bg-[#FF0000]/20 border border-[#FF0000]/30 rounded-lg text-sm text-[#FF4444] transition-colors"
                            style={{ fontFamily: 'var(--font-mono)' }}>
                            <Youtube className="w-3.5 h-3.5" /><span>Video</span>
                          </motion.a>
                        )}
                        {project.demo && (
                          <motion.a href={project.demo} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E5BFF]/10 hover:bg-[#2E5BFF]/20 border border-[#2E5BFF]/30 rounded-lg text-sm text-[#2E5BFF] transition-colors"
                            style={{ fontFamily: 'var(--font-mono)' }}>
                            <ExternalLink className="w-3.5 h-3.5" /><span>Live</span>
                          </motion.a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── detail panel ── */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key={selected.title}
              initial={{ opacity: 0, y: isMobile ? 60 : 0, x: isMobile ? 0 : 48 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: isMobile ? 60 : 0, x: isMobile ? 0 : 48 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="
                fixed inset-x-3 z-50 rounded-2xl overflow-hidden
                top-[72px] bottom-[84px]
                md:relative md:inset-auto md:top-auto md:bottom-auto
                md:flex-1 md:sticky md:top-20 md:self-start md:min-w-0
                md:h-[calc(100vh-120px)]
              "
              style={{
                background: 'rgba(16, 16, 16, 0.96)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <ProjectPanel key={selected.title} project={selected} onClose={() => setSelected(null)} />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
