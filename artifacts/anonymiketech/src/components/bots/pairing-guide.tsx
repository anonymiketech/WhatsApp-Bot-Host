import { ExternalLink, QrCode, Terminal, CheckCircle2 } from "lucide-react";

export function PairingGuide() {
  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
          <QrCode className="w-5 h-5" />
        </div>
        <h3 className="font-display text-xl">Pair WhatsApp</h3>
      </div>
      
      <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
        Connect your WhatsApp account to the engine by retrieving a secure Session ID. 
        Follow these three simple steps to start hosting your bot.
      </p>

      <div className="space-y-4">
        
        {/* Step 1 */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs border border-white/5 z-10 text-foreground">1</div>
            <div className="w-px h-full bg-gradient-to-b from-white/10 to-transparent mt-2" />
          </div>
          <div className="pb-4 pt-1">
            <h4 className="text-sm font-semibold text-foreground mb-1">Visit Pairing Portal</h4>
            <p className="text-xs text-muted-foreground mb-3">Open the secure device pairing site.</p>
            <a 
              href="https://truth-md.courtneytech.xyz/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-primary transition-colors font-medium"
            >
              Open Portal <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs border border-white/5 z-10 text-foreground">2</div>
            <div className="w-px h-full bg-gradient-to-b from-white/10 to-transparent mt-2" />
          </div>
          <div className="pb-4 pt-1">
            <h4 className="text-sm font-semibold text-foreground mb-1">Scan or Enter Code</h4>
            <p className="text-xs text-muted-foreground">
              Link your device using the QR Code or Pair Code provided on the portal.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs border border-primary/30 z-10 shadow-[0_0_10px_rgba(0,229,153,0.3)]">3</div>
          </div>
          <div className="pt-1">
            <h4 className="text-sm font-semibold text-primary mb-1">Copy Session ID</h4>
            <p className="text-xs text-muted-foreground">
              You will receive a long string of characters. Copy it securely—this is your Session ID.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
