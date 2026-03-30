import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Code2, CheckCircle2, Send, Github, Mail, Phone, User, FileText, Zap, ArrowRight, Briefcase } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useToast } from "@/hooks/use-toast";

type Tab = "reseller" | "developer";

const BENEFITS_RESELLER = [
  "Earn commissions on every bot subscription you refer",
  "Dedicated partner dashboard to track earnings",
  "Priority support and early feature access",
  "Co-marketing opportunities with ANONYMIKETECH",
  "Custom referral links and promo codes",
];

const BENEFITS_DEVELOPER = [
  "Get your bot listed in our marketplace",
  "Reach thousands of WhatsApp users instantly",
  "Earn revenue share on every subscription",
  "Full API & webhook support for your bot",
  "Dedicated developer documentation & support",
];

interface FormState {
  name: string;
  email: string;
  whatsappNumber: string;
  experience: string;
  message: string;
  githubRepo: string;
  botName: string;
  botDescription: string;
}

const EMPTY: FormState = {
  name: "", email: "", whatsappNumber: "", experience: "",
  message: "", githubRepo: "", botName: "", botDescription: "",
};

export default function PartnersPage() {
  const [tab, setTab] = useState<Tab>("reseller");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("tab") === "developer") setTab("developer");
    // also support hash-style navigation
  }, []);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/partner-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: tab, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmitted(true);
      setForm(EMPTY);
    } catch (err: unknown) {
      toast({ title: "Submission failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-primary/4 blur-[100px] rounded-full" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
              <Zap className="w-3.5 h-3.5" />
              Partnership Program
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black mb-3">
              Work <span className="tech-gradient-text">With Us</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
              Whether you sell bots or build them — there's a place for you on the ANONYMIKETECH platform.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">

        {/* Tab switcher */}
        <div className="flex gap-2 p-1 rounded-xl bg-white/4 border border-white/8 w-fit mx-auto mb-10">
          {([["reseller", Users, "Become a Reseller"], ["developer", Code2, "Submit Your Bot"]] as [Tab, typeof Users, string][]).map(
            ([id, Icon, label]) => (
              <button
                key={id}
                onClick={() => { setTab(id); setSubmitted(false); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={tab === id ? {
                  background: "rgba(0,229,153,0.12)",
                  color: "#00e599",
                  border: "1px solid rgba(0,229,153,0.3)",
                } : { color: "#a1a1aa" }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            )
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
          >
            {/* Left: Benefits */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-black mb-2">
                  {tab === "reseller" ? "Reseller Partner Program" : "Developer Bot Marketplace"}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {tab === "reseller"
                    ? "Join our network of resellers and earn recurring commissions by introducing businesses and individuals to WhatsApp automation. No technical skills needed."
                    : "Built a WhatsApp bot? List it in our marketplace and let thousands of users subscribe to it. We handle hosting, payments, and support — you earn the revenue."}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {tab === "reseller" ? "Partner Benefits" : "Why List With Us"}
                </h3>
                {(tab === "reseller" ? BENEFITS_RESELLER : BENEFITS_DEVELOPER).map((b, i) => (
                  <motion.div
                    key={b}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/6"
                  >
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#00e599" }} />
                    <span className="text-sm text-foreground/85">{b}</span>
                  </motion.div>
                ))}
              </div>

              {/* Quote card */}
              <div className="p-5 rounded-2xl border border-primary/15" style={{ background: "rgba(0,229,153,0.04)" }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-lg">
                    {tab === "reseller" ? "🤝" : "🚀"}
                  </div>
                  <div>
                    <p className="text-sm text-foreground/80 leading-relaxed italic">
                      {tab === "reseller"
                        ? `"We're looking for driven individuals and agencies who believe in the power of WhatsApp automation. Help businesses grow — and grow with them."`
                        : `"We accept quality WhatsApp bots built with any framework. Our team reviews submissions within 3-5 business days."`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 font-semibold">— ANONYMIKETECH Team</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6 sm:p-8">
              {submitted ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center text-center py-10 gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" style={{ color: "#00e599" }} />
                  </div>
                  <h3 className="text-xl font-display font-bold">Application Submitted!</h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Thank you for applying. Our team will review your application and get back to you within 3–5 business days.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-2 flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
                    style={{ color: "#00e599" }}
                  >
                    Submit another <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ) : (
                <>
                  <h3 className="text-lg font-display font-bold mb-1">
                    {tab === "reseller" ? "Reseller Application" : "Bot Submission Form"}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-6">
                    {tab === "reseller"
                      ? "Fill in your details and we'll reach out with partnership terms."
                      : "Share your bot's details and GitHub repo for review."}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <input
                          required
                          value={form.name}
                          onChange={set("name")}
                          placeholder="John Doe"
                          className="w-full pl-9 pr-4 py-2.5 bg-white/4 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={set("email")}
                          placeholder="you@example.com"
                          className="w-full pl-9 pr-4 py-2.5 bg-white/4 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
                        />
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">WhatsApp Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <input
                          value={form.whatsappNumber}
                          onChange={set("whatsappNumber")}
                          placeholder="0712345678"
                          className="w-full pl-9 pr-4 py-2.5 bg-white/4 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
                        />
                      </div>
                    </div>

                    {/* Developer-only fields */}
                    {tab === "developer" && (
                      <>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Bot Name *</label>
                          <div className="relative">
                            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                            <input
                              required
                              value={form.botName}
                              onChange={set("botName")}
                              placeholder="My Awesome Bot"
                              className="w-full pl-9 pr-4 py-2.5 bg-white/4 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">GitHub Repository URL *</label>
                          <div className="relative">
                            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                            <input
                              required
                              value={form.githubRepo}
                              onChange={set("githubRepo")}
                              placeholder="https://github.com/you/your-bot"
                              className="w-full pl-9 pr-4 py-2.5 bg-white/4 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Bot Description *</label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground/50" />
                            <textarea
                              required
                              rows={3}
                              value={form.botDescription}
                              onChange={set("botDescription")}
                              placeholder="Describe what your bot does, its key features, and target users…"
                              className="w-full pl-9 pr-4 py-2.5 bg-white/4 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40 resize-none"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Reseller experience */}
                    {tab === "reseller" && (
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                          <Briefcase className="inline w-3.5 h-3.5 mr-1 opacity-60" />
                          Your Experience / Background
                        </label>
                        <textarea
                          rows={3}
                          value={form.experience}
                          onChange={set("experience")}
                          placeholder="Tell us about your sales experience, network size, or any relevant background…"
                          className="w-full px-4 py-2.5 bg-white/4 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40 resize-none"
                        />
                      </div>
                    )}

                    {/* Message */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                        {tab === "reseller" ? "Why do you want to partner with us?" : "Additional Notes (optional)"}
                      </label>
                      <textarea
                        rows={3}
                        value={form.message}
                        onChange={set("message")}
                        placeholder={tab === "reseller"
                          ? "Share your motivation, goals, and how you plan to promote ANONYMIKETECH bots…"
                          : "Any other info you'd like to share — monetization expectations, special requirements, etc."}
                        className="w-full px-4 py-2.5 bg-white/4 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
                      style={{ background: "#00e599", color: "#0a0a0f" }}
                    >
                      {loading ? (
                        <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {loading ? "Submitting…" : tab === "reseller" ? "Submit Application" : "Submit Bot for Review"}
                    </button>

                    <p className="text-[11px] text-center" style={{ color: "#71717a" }}>
                      We review all applications within 3–5 business days.
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
