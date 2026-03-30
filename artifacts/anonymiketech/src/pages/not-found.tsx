import { Link } from "wouter";
import { Terminal } from "lucide-react";
import { Footer } from "@/components/layout/footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="glass-panel max-w-md w-full p-8 rounded-2xl text-center">
          <div className="w-16 h-16 mx-auto bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mb-6 border border-destructive/20">
            <Terminal className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-display font-bold mb-2">404</h1>
          <p className="text-xl font-semibold mb-4">Node Not Found</p>
          <p className="text-muted-foreground mb-8">
            The requested path does not exist in our infrastructure.
          </p>
          <Link
            href="/"
            className="inline-block w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-colors"
          >
            Return to Base
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
