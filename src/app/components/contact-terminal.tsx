import { motion } from 'motion/react';
import { Send, Terminal } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import emailjs from '@emailjs/browser';

export function ContactTerminal() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [output, setOutput] = useState<string[]>([
    '> System ready. Awaiting input...',
    '> Available commands: --name, --email, --message, --send',
  ]);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !email || !message) {
      setOutput(prev => [...prev, '> ERROR: All fields required. Please complete --name, --email, and --message']);
      return;
    }

    setSending(true);
    setOutput(prev => [...prev, '> Transmitting message...']);

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: name,
          from_email: email,
          name: name,
          email: email,
          message: message,
        },
        { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY },
      );

      setOutput(prev => [
        ...prev,
        '> [200 OK] Message delivered.',
        `> From: ${email}`,
        "> Thank you! I'll respond within 24 hours.",
        '> Connection closed.',
      ]);

      setTimeout(() => {
        setName('');
        setEmail('');
        setMessage('');
        setOutput([
          '> System ready. Awaiting input...',
          '> Available commands: --name, --email, --message, --send',
        ]);
      }, 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error('[EmailJS error]', err);
      setOutput(prev => [
        ...prev,
        `> [ERROR] ${msg}`,
        '> saiganeshakagana@gmail.com',
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="min-h-screen py-20 px-4 md:px-8 relative flex items-center">
      <div className="max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Get In Touch
          </h2>
          <p className="text-foreground/70" style={{ fontFamily: 'var(--font-sans)' }}>
            Open for collaborations, research opportunities, and consulting
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(30, 30, 30, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 min-w-0">
            <div className="flex gap-2 flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
            </div>
            <div className="flex items-center gap-2 ml-4 min-w-0 overflow-hidden">
              <Terminal className="w-4 h-4 text-[#A8E6CF] flex-shrink-0" />
              <span
                className="text-xs md:text-sm text-foreground/70 truncate"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                saiganeshakagana@gmail.com
              </span>
            </div>
          </div>

          {/* Terminal output */}
          <div
            className="px-4 py-3 min-h-[120px] max-h-[200px] overflow-y-auto"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {output.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-sm text-[#A8E6CF] mb-1"
              >
                {line}
              </motion.div>
            ))}
          </div>

          {/* Terminal form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Name input */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span
                className="text-[#2E5BFF] shrink-0 text-sm"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                $ --name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-foreground placeholder:text-foreground/30 text-base"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>

            {/* Email input */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span
                className="text-[#2E5BFF] shrink-0 text-sm"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                $ --email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-foreground placeholder:text-foreground/30 text-base"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>

            {/* Message textarea */}
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
              <span
                className="text-[#2E5BFF] shrink-0 text-sm"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                $ --message
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message..."
                rows={4}
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-foreground placeholder:text-foreground/30 resize-none text-base"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>

            {/* Submit button */}
            <div className="flex items-center gap-2 pt-2">
              <span
                className="text-[#A8E6CF]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                $
              </span>
              <motion.button
                type="submit"
                disabled={sending}
                whileHover={!sending ? { scale: 1.02 } : {}}
                whileTap={!sending ? { scale: 0.98 } : {}}
                className="flex items-center gap-2 px-4 py-2 bg-[#2E5BFF] text-white rounded-lg hover:bg-[#2E5BFF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <span>{sending ? '--sending...' : '--send'}</span>
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </form>

          {/* Scanning line effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent, rgba(46, 91, 255, 0.05), transparent)',
              height: '100px',
            }}
            animate={{
              y: [-100, 600],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex justify-center gap-6"
        >
          <motion.a
            href="https://github.com/sgakula"
            whileHover={{ scale: 1.1, y: -2 }}
            className="px-4 py-2 bg-foreground/5 hover:bg-[#2E5BFF]/10 border border-white/10 hover:border-[#2E5BFF]/30 rounded-lg transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            GitHub
          </motion.a>
          <motion.a
            href="https://linkedin.com/in/saiganeshakula/"
            whileHover={{ scale: 1.1, y: -2 }}
            className="px-4 py-2 bg-foreground/5 hover:bg-[#2E5BFF]/10 border border-white/10 hover:border-[#2E5BFF]/30 rounded-lg transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            LinkedIn
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
