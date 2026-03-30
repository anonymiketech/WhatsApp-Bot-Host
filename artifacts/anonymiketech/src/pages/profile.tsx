import { useState, useRef, useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { motion } from "framer-motion";
import { Camera, User, Mail, Save, Loader2, CheckCircle2, Coins, Shield, LogOut } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SectionLoader } from "@/components/ui/section-loader";
import { useGetMe, useUpdateProfile } from "@/hooks/use-users";
import { useToast } from "@/hooks/use-toast";

function Avatar({ src, name, size = 96 }: { src?: string | null; name?: string | null; size?: number }) {
  const initials = name ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "U";
  if (src) {
    return (
      <img
        src={src}
        alt="Profile"
        className="rounded-full object-cover border-4 border-primary/20"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold border-4 border-primary/20"
      style={{
        width: size, height: size,
        background: "linear-gradient(135deg, rgba(0,229,153,0.2), rgba(34,211,238,0.2))",
        fontSize: size * 0.35,
        color: "#00e599",
      }}
    >
      {initials}
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useGetMe();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarChanged, setAvatarChanged] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? "");
      setLastName(profile.lastName ?? "");
    }
  }, [profile]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated, isAuthLoading]);

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SectionLoader label="Loading profile…" size="lg" />
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Please choose an image under 2MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
      setAvatarChanged(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const payload: Parameters<typeof updateProfile.mutate>[0] = {};
    if (firstName.trim() !== (profile?.firstName ?? "")) payload.firstName = firstName.trim();
    if (lastName.trim() !== (profile?.lastName ?? "")) payload.lastName = lastName.trim();
    if (avatarChanged) payload.profileImageUrl = avatarPreview ?? "";

    if (Object.keys(payload).length === 0) {
      toast({ title: "No changes detected", description: "Make a change first before saving." });
      return;
    }

    updateProfile.mutate(payload, {
      onSuccess: () => {
        toast({ title: "Profile saved ✅", description: "Your account information has been updated." });
        setAvatarChanged(false);
      },
      onError: (err) => {
        toast({ title: "Save failed", description: err.message, variant: "destructive" });
      },
    });
  };

  const currentAvatar = avatarPreview ?? profile?.profileImageUrl ?? user?.profileImageUrl;
  const displayName = firstName || profile?.firstName || user?.firstName || "User";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Page heading */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-display font-black mb-1">My Profile</h1>
            <p className="text-muted-foreground text-sm">Manage your account information and preferences.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Left: Avatar card */}
            <div className="md:col-span-1">
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6 flex flex-col items-center gap-4">
                <div className="relative">
                  {isProfileLoading ? (
                    <div className="w-24 h-24 rounded-full bg-white/8 animate-pulse" />
                  ) : (
                    <Avatar src={currentAvatar} name={displayName} size={96} />
                  )}
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-background transition-colors hover:opacity-80"
                    style={{ background: "#00e599" }}
                    title="Change photo"
                  >
                    <Camera className="w-3.5 h-3.5" style={{ color: "#0a0a0f" }} />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>

                <div className="text-center">
                  <p className="font-bold text-sm">{displayName} {lastName || profile?.lastName || ""}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#a1a1aa" }}>{profile?.email ?? user?.email ?? ""}</p>
                </div>

                {/* Stats */}
                <div className="w-full space-y-2 pt-2 border-t border-white/8">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2" style={{ color: "#a1a1aa" }}>
                      <Coins className="w-3.5 h-3.5" style={{ color: "#00e599" }} />
                      <span>Coins</span>
                    </div>
                    <span className="font-bold">{profile?.coins ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2" style={{ color: "#a1a1aa" }}>
                      <Shield className="w-3.5 h-3.5" style={{ color: "#22d3ee" }} />
                      <span>Member since</span>
                    </div>
                    <span className="font-medium text-xs">2026</span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm border border-red-500/20 hover:bg-red-500/10 transition-colors"
                  style={{ color: "#f87171" }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Right: Edit form */}
            <div className="md:col-span-2 space-y-5">
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
                <h2 className="text-base font-bold mb-4">Account Information</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#a1a1aa" }}>First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#52525b" }} />
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-white/10 bg-white/4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#a1a1aa" }}>Last Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#52525b" }} />
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-white/10 bg-white/4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#a1a1aa" }}>
                      Email Address <span className="text-zinc-600">(from your login)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#52525b" }} />
                      <input
                        value={profile?.email ?? user?.email ?? ""}
                        disabled
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-white/6 bg-white/[0.02] cursor-not-allowed"
                        style={{ color: "#71717a" }}
                      />
                    </div>
                  </div>
                </div>

                {avatarChanged && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-2 text-xs p-2.5 rounded-lg border border-primary/20"
                    style={{ background: "rgba(0,229,153,0.05)", color: "#00e599" }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    New profile photo selected — click Save to apply.
                  </motion.div>
                )}

                <button
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                  className="mt-5 flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
                  style={{ background: "#00e599", color: "#0a0a0f" }}
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {updateProfile.isPending ? "Saving…" : "Save Changes"}
                </button>
              </div>

              {/* Tip card */}
              <div
                className="rounded-2xl border border-primary/10 p-4 text-sm flex items-start gap-3"
                style={{ background: "rgba(0,229,153,0.04)" }}
              >
                <span className="text-xl flex-shrink-0">📱</span>
                <div>
                  <p className="font-semibold text-sm mb-0.5">Install as a mobile app</p>
                  <p className="text-xs" style={{ color: "#a1a1aa" }}>
                    You can add ANONYMIKETECH to your phone's home screen for a native app experience. On your browser tap <strong>Share → Add to Home Screen</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
