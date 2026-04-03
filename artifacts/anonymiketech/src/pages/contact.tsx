import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { Mail, Phone, MessageSquare, Clock, Send, MapPin, ExternalLink } from "lucide-react";
import { useState } from "react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const contacts = [
  {
    icon: WhatsAppIcon,
    label: "WhatsApp",
    value: "+254 782 829 321",
    href: "https://wa.me/254782829321",
    description: "Chat with us directly — fastest response",
    color: "#25d366",
    bg: "rgba(37,211,102,0.08)",
    border: "rgba(37,211,102,0.2)",
    external: true,
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+254 782 829 321",
    href: "tel:+254782829321",
    description: "Call us during business hours",
    color: "#38bdf8",
    bg: "rgba(56,189,248,0.08)",
    border: "rgba(56,189,248,0.2)",
    external: false,
  },
  {
    icon: Mail,
    label: "General Enquiries",
    value: "admin@anonymiketech.online",
    href: "mailto:admin@anonymiketech.online",
    description: "Business, partnerships & general questions",
    color: "#00e599",
    bg: "rgba(0,229,153,0.08)",
    border: "rgba(0,229,153,0.2)",
    external: false,
  },
  {
    icon: Mail,
    label: "Technical Support",
    value: "support@anonymiketech.online",
    href: "mailto:support@anonymiketech.online",
    description: "Bot issues, billing & technical help",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.2)",
    external: false,
  },
];

const faqs = [
  {
    q: "How long does support take to respond?",
    a: "We typically respond within 1–4 hours during business hours. For urgent issues, WhatsApp is the fastest channel.",
  },
  {
    q: "My bot stopped running — what should I do?",
    a: "First check your coin balance on your dashboard. If your balance is sufficient, try restarting the bot from the bot card. If the issue persists, contact support.",
  },
  {
    q: "How do I get a refund?",
    a: "Reach out to support@anonymiketech.online with your transaction details. Refunds are reviewed case by case within 48 hours.",
  },
  {
    q: "Can I submit my own bot to the marketplace?",
    a: "Yes! Visit the Partners page and click 'Submit Your Bot'. Our team will review and list it within a few days.",
  },
];

function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-white/10 p-10 flex flex-col items-center justify-center text-center gap-4"
        style={{ background: "rgba(0,229,153,0.05)" }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,229,153,0.12)" }}>
          <MessageSquare className="w-7 h-7" style={{ color: "#00e599" }} />
        </div>
        <h3 className="text-xl font-display">Message Sent!</h3>
        <p className="text-sm" style={{ color: "#a1a1aa" }}>
          Thanks for reaching out. We'll get back to you at <span style={{ color: "#e4e4e7" }}>{formData.email}</span> soon.
        </p>
        <button
          onClick={() => { setStatus("idle"); setFormData({ name: "", email: "", subject: "", message: "" }); }}
          className="text-xs px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
          style={{ color: "#a1a1aa" }}
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#a1a1aa" }}>Your Name</label>
          <input
            required
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            placeholder="John Doe"
            className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-white/6 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#a1a1aa" }}>Email Address</label>
          <input
            required
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-white/6 transition-colors"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#a1a1aa" }}>Subject</label>
        <input
          required
          value={formData.subject}
          onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
          placeholder="e.g. Bot not starting / Billing issue"
          className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-white/6 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#a1a1aa" }}>Message</label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
          placeholder="Describe your issue or question in detail..."
          className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-white/6 transition-colors resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
        style={{ background: "#00e599", color: "#000" }}
      >
        {status === "sending" ? (
          <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Sending…</>
        ) : (
          <><Send className="w-4 h-4" /> Send Message</>
        )}
      </button>
    </form>
  );
}

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-xs font-medium mb-5"
            style={{ background: "rgba(0,229,153,0.06)", color: "#00e599" }}>
            <MessageSquare className="w-3.5 h-3.5" />
            We're here to help
          </div>
          <h1 className="text-4xl sm:text-5xl font-display mb-4">
            Get in <span style={{ color: "#00e599" }}>Touch</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "#a1a1aa" }}>
            Questions, issues, or ideas? Reach us through any channel below — we respond fast.
          </p>
        </motion.div>

        {/* Contact Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14"
        >
          {contacts.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.a
                key={c.label}
                href={c.href}
                target={c.external ? "_blank" : undefined}
                rel={c.external ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                className="group flex items-start gap-4 p-5 rounded-2xl border transition-all hover:scale-[1.01]"
                style={{ background: c.bg, borderColor: c.border }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <Icon className="w-5 h-5" style={{ color: c.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: c.color }}>{c.label}</span>
                    {c.external && <ExternalLink className="w-3 h-3 opacity-50" style={{ color: c.color }} />}
                  </div>
                  <p className="text-sm font-medium text-foreground truncate group-hover:opacity-90">{c.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#71717a" }}>{c.description}</p>
                </div>
              </motion.a>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-display mb-2">Send a Message</h2>
            <p className="text-sm mb-6" style={{ color: "#a1a1aa" }}>
              Fill in the form and we'll get back to you within a few hours.
            </p>
            <ContactForm />
          </motion.div>

          {/* FAQ + Hours */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="space-y-8"
          >
            {/* Hours */}
            <div className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4" style={{ color: "#00e599" }} />
                <h3 className="font-semibold text-sm">Support Hours</h3>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { day: "Monday – Friday", hours: "8:00 AM – 8:00 PM EAT" },
                  { day: "Saturday", hours: "9:00 AM – 5:00 PM EAT" },
                  { day: "Sunday", hours: "Emergency support only" },
                ].map(({ day, hours }) => (
                  <div key={day} className="flex items-center justify-between">
                    <span style={{ color: "#a1a1aa" }}>{day}</span>
                    <span style={{ color: "#e4e4e7" }}>{hours}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/8 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" style={{ color: "#71717a" }} />
                <span className="text-xs" style={{ color: "#71717a" }}>Nairobi, Kenya · East Africa Time (UTC+3)</span>
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h3 className="font-semibold text-sm mb-3" style={{ color: "#a1a1aa" }}>Frequently Asked Questions</h3>
              <div className="space-y-2">
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/8 overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full text-left flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium hover:bg-white/4 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <motion.span
                        animate={{ rotate: openFaq === i ? 45 : 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-lg leading-none flex-shrink-0"
                        style={{ color: "#00e599" }}
                      >
                        +
                      </motion.span>
                    </button>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 pb-3 text-sm border-t border-white/8"
                        style={{ color: "#a1a1aa" }}
                      >
                        <p className="pt-3">{faq.a}</p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
