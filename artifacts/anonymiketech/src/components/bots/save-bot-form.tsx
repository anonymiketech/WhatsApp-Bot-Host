import { useState } from "react";
import { useSaveSession } from "@/hooks/use-bots";
import { Server, Key, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function SaveBotForm() {
  const [name, setName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const { mutate: saveSession, isPending } = useSaveSession();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name.trim() || !sessionId.trim()) {
      setError("Please fill in both fields");
      return;
    }

    saveSession({ name, sessionId }, {
      onSuccess: () => {
        setName("");
        setSessionId("");
      },
      onError: (err) => {
        setError(err.message);
      }
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-accent/10 rounded-xl text-accent border border-accent/20">
          <Server className="w-5 h-5" />
        </div>
        <h3 className="font-display text-xl">Deploy New Bot</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground ml-1">Bot Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Server className="w-4 h-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alpha AutoResponder"
              className={cn(
                "w-full pl-10 pr-4 py-3 bg-secondary/50 border border-white/10 rounded-xl text-sm transition-all",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                "placeholder:text-muted-foreground"
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground ml-1">Session ID</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="w-4 h-4 text-muted-foreground" />
            </div>
            <input
              type="password"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Paste your paired Session ID here"
              className={cn(
                "w-full pl-10 pr-4 py-3 bg-secondary/50 border border-white/10 rounded-xl text-sm transition-all font-mono",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                "placeholder:text-muted-foreground placeholder:font-sans"
              )}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "w-full mt-4 py-3.5 rounded-xl font-bold tracking-wide transition-all duration-300 relative overflow-hidden group",
            isPending 
              ? "bg-primary/50 text-background cursor-not-allowed"
              : "bg-primary text-background hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,229,153,0.4)]"
          )}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
          
          <div className="flex items-center justify-center gap-2 relative z-10">
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving Session...
              </>
            ) : (
              <>
                Deploy Instance
              </>
            )}
          </div>
        </button>
      </form>
    </div>
  );
}
