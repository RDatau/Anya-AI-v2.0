import React, { useState, useRef, useEffect } from 'react';
import { AgentConfig } from '../types';

interface SetupViewProps {
  config: AgentConfig;
  setConfig: (config: AgentConfig) => void;
  onStart: () => void;
  onReset: () => void;
  onClose?: () => void;
}

const SetupView: React.FC<SetupViewProps> = ({ config, setConfig, onStart, onReset, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Load Google Identity Services Script secara dinamis
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // @ts-ignore
      if (window.google) {
        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // User perlu ganti ini nanti di prod
          callback: (response: any) => {
            console.log("Encoded JWT ID token: " + response.credential);
            setIsLoggedIn(true);
            // Decode simple payload if needed
            setUserEmail("Authenticated User");
          }
        });
        // @ts-ignore
        window.google.accounts.id.renderButton(
          googleBtnRef.current,
          { theme: "outline", size: "large", width: "100%", shape: "pill" }
        );
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setConfig({ ...config, profilePic: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const glassOpacity = Math.max(0.2, config.transparency / 100);

  return (
    <div className="w-full h-full flex items-center justify-center p-4 overflow-y-auto custom-scrollbar bg-black/20">
      <div 
        className="w-full max-w-md border border-white/20 rounded-[50px] p-8 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.8)] transition-all duration-700 relative my-auto animate-in zoom-in duration-500 overflow-hidden"
        style={{ 
          backgroundColor: `rgba(0, 0, 0, ${glassOpacity})`,
          backdropFilter: `blur(${config.blur}px)`,
          WebkitBackdropFilter: `blur(${config.blur}px)`
        }}
      >
        {/* Glow Effects - Bikin suasana makin panas */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-pink-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 text-white/40 hover:text-white z-20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <header className="text-center mb-10 relative z-10">
          <h1 className="text-3xl font-black tracking-tighter text-white mb-2">Create Agent 💋</h1>
          <p className="text-[9px] font-black uppercase text-pink-500 tracking-[0.5em] opacity-80 animate-pulse">Design Your Companion</p>
        </header>

        <div className="space-y-10 relative z-10">
          {/* STEP 1: PHOTO & NAME */}
          <section className="flex flex-col items-center gap-8">
            <div 
              className={`relative group transition-all duration-500 ${isDragging ? 'scale-110' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files?.[0]; if(file) handleFile(file); }}
            >
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-36 h-36 md:w-44 md:h-44 rounded-[45px] md:rounded-[55px] overflow-hidden border-2 shadow-2xl bg-black/60 transition-all duration-500 cursor-pointer relative group ${isDragging ? 'border-pink-500 shadow-[0_0_50px_rgba(236,72,153,0.5)]' : 'border-white/10 group-hover:border-pink-500/50'}`}
              >
                {config.profilePic ? (
                  <img src={config.profilePic} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/10 gap-3">
                    <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Add Face</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                   <p className="text-[10px] font-black text-white uppercase tracking-widest">Ganti Foto</p>
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              <div className="absolute -bottom-2 -right-2 bg-pink-600 p-4 rounded-2xl shadow-2xl border border-white/20 pointer-events-none group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              </div>
            </div>

            <div className="w-full space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4">Agent Name</label>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-5 outline-none focus:ring-4 ring-pink-500/20 font-black transition-all text-white text-center text-xl placeholder:text-white/10 shadow-inner" 
                value={config.name} 
                onChange={(e) => setConfig({ ...config, name: e.target.value })} 
                placeholder="Name your agent..." 
              />
            </div>
          </section>

          {/* REAL GOOGLE LOGIN AREA */}
          <section className="pt-6 border-t border-white/10 space-y-6">
            <div className="text-center px-4">
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-4">Official Google Access</p>
            </div>

            {isLoggedIn ? (
              <div className="w-full bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center justify-center gap-3 animate-in fade-in zoom-in">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                <span className="text-xs font-black text-green-400 uppercase tracking-widest">Logged In Successfully 💦</span>
              </div>
            ) : (
              <div ref={googleBtnRef} className="w-full overflow-hidden flex justify-center scale-110 md:scale-125 transform" />
            )}
            
            <div className="text-center">
              <p className="text-[8px] font-black uppercase text-white/20 tracking-widest max-w-[200px] mx-auto leading-relaxed">
                Connect your Google Account to unlock premium AI brain 💋
              </p>
            </div>
          </section>

          {/* FINAL START */}
          <div className="pt-4">
            <button 
              onClick={onStart} 
              className="w-full bg-gradient-to-r from-pink-600 via-purple-700 to-pink-600 bg-[length:200%_auto] animate-gradient hover:bg-right text-white font-black py-6 rounded-[30px] shadow-2xl shadow-pink-500/30 active:scale-[0.97] transition-all uppercase tracking-[0.5em] text-[12px] border border-white/20"
            >
              Mulai Chatting 💋
            </button>
            <button 
              onClick={onReset} 
              className="w-full text-[9px] font-black uppercase tracking-[0.3em] text-white/5 hover:text-red-500/50 transition-colors py-5"
            >
              Hapus Semua Memori
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupView;