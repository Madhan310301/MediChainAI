import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  MessageSquare,
  LayoutDashboard,
  User,
  Menu,
  X,
  BarChart3
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useState, useEffect } from "react";
import { useLanguage } from "../hooks/use-language";
import { auth } from "../firebase";
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

export function Navigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const { language, t } = useLanguage();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Save profile to MongoDB (with TTL auto-delete)
      await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          fullName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        })
      });

      alert("Profile saved to Temporary Database. Note: Data auto-purges after 24h of inactivity to save RAM.");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      alert("Google Sign-In Failed");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const safeT = t || {
    dashboard: "Dashboard",
    profile: "Profile",
    aiAssistant: "AI Assistant",
    healthRecords: "Health Records",
    decentralizedHealth: "Decentralized Health"
  };

  const links = [
    { to: "/", label: safeT.dashboard, icon: LayoutDashboard },
    { to: "/chat", label: safeT.aiAssistant, icon: MessageSquare },
    { to: "/records", label: safeT.healthRecords, icon: Activity },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/profile", label: safeT.profile, icon: User }
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">

            {/* LOGO */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold">
                  MediChain<span className="text-primary">AI</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {safeT.decentralizedHealth}
                </span>
              </div>
            </div>

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center gap-2">
              {links.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}>
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer
                      ${
                        currentPath === to
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </div>
                </Link>
              ))}
            </div>

            {/* RIGHT SIDE */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-xs font-semibold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
                {language || "ENG"}
              </span>
              
              {user ? (
                <button 
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-full bg-secondary border border-border shadow-sm flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
                  title="Sign Out"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </button>
              ) : (
                <button 
                  onClick={handleGoogleLogin}
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                  title="Sign in with Google"
                >
                  <FcGoogle className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* MOBILE BUTTON */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg"
              >
                {isMobileMenuOpen
                  ? <X className="w-6 h-6" />
                  : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-background pt-24 px-4 md:hidden">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <div
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium transition cursor-pointer
                  ${
                    currentPath === to
                      ? "bg-primary text-white"
                      : "bg-card border"
                  }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}