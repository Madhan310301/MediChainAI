import { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, MapPin, Shield, Key, Camera, Check, AlertTriangle } from "lucide-react";
import { useLanguage } from "../hooks/use-language";
import { auth } from "../firebase";
import { onAuthStateChanged, User as FirebaseUser, updateProfile } from "firebase/auth";

export default function Profile() {
  const { t } = useLanguage();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "+1 (555) 000-0000",
    address: "123 Health St, Med City"
  });
  const [twoFactor, setTwoFactor] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Fetch existing profile data from MongoDB
          const response = await fetch(`/api/user/profile/${currentUser.uid}`);
          if (response.ok) {
            const dbUser = await response.json();
            setFormData(prev => ({
              ...prev,
              fullName: dbUser.fullName || currentUser.displayName || "",
              email: dbUser.email || currentUser.email || "",
              phone: dbUser.phone || "+1 (555) 000-0000",
              address: dbUser.address || "123 Health St, Med City"
            }));
            setTwoFactor(dbUser.twoFactorEnabled || false);
          } else {
             // Fallback to Firebase defaults if not in DB yet
             setFormData(prev => ({
                ...prev,
                fullName: currentUser.displayName || "",
                email: currentUser.email || ""
             }));
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!user) {
      alert("You must be logged in to save profile changes.");
      return;
    }
    
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      // Update Firebase display name if changed
      if (formData.fullName !== user.displayName) {
        await updateProfile(user, { displayName: formData.fullName });
      }

      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          uid: user.uid,
          ...formData,
          twoFactorEnabled: twoFactor,
          photoURL: photoPreview || user.photoURL
        })
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error(error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-28 px-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold font-display">{t.profile || "Patient Profile"}</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border shadow-sm p-6 text-center">
            {(photoPreview || user?.photoURL) ? (
               <img src={photoPreview || user?.photoURL || ''} alt="Avatar" className="w-24 h-24 mx-auto rounded-full object-cover shadow-lg mb-4 border-2 border-primary/20" />
            ) : (
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                {(formData.fullName || "JD").split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
              </div>
            )}
            
            <h2 className="text-xl font-bold">{formData.fullName || "Patient Name"}</h2>
            <p className="text-sm text-muted-foreground mb-6">Patient ID: #{user?.uid ? user.uid.substring(0, 8) : "8293-2938"}</p>
            
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
              <div className="w-[80%] h-full bg-emerald-500 rounded-full" />
            </div>
            <p className="text-xs text-muted-foreground mb-6">Profile Completion: 80%</p>

            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <button onClick={() => fileInputRef.current?.click()} className="w-full py-2.5 bg-muted/50 text-foreground font-medium rounded-xl hover:bg-muted transition-colors border border-border flex items-center justify-center gap-2">
              <Camera size={16} />
              {t.settings ? "Change Photo" : "Change Photo"}
            </button>
          </div>
        </div>

        {/* Details Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border shadow-sm p-6">
            <h3 className="text-lg font-bold font-display mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              {saveStatus === 'success' && (
                <span className="flex items-center gap-1 text-sm text-green-600 font-medium animate-in fade-in">
                  <Check size={16} /> Profile saved successfully!
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="flex items-center gap-1 text-sm text-red-600 font-medium animate-in fade-in">
                  <AlertTriangle size={16} /> Failed to save. Try again.
                </span>
              )}
              <button disabled={isSaving} onClick={handleSave} className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50">
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border shadow-sm p-6">
            <h3 className="text-lg font-bold font-display mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security & Privacy
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Key className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
