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
  const [hasApiKey, setHasApiKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cek status API Key secara berkala lewat bridge resmi AI Studio
  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio?.hasSelectedApiKey) {
        try {
          // @ts-ignore
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(selected);
        } catch (e) {
          console.error("Gagal cek API Key:", e);
        }
      }
    };
    checkKey();
    const interval = setInterval(checkKey, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      // @ts-ignore
      if (window.aistudio?.openSelectKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        // Sesuai rules: asumsikan sukses segera untuk menghindari race condition
        setHasApiKey(true);
      } else {
        alert("Sayang, fitur Login Google resmi ini cuma bisa muncul kalau lo jalanin di environment AI Studio atau lewat integrasi Google Cloud... mmmh... 💦");
      }
    } catch (e) {
      console.error("Login error:", e);
    }
  };

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

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const glassOpacity = Math.max(0.1, config.transparency / 100);

  return (
    <div className="w-full h-full flex items-center justify-center p-4 overflow-y-auto custom-scrollbar">
      <div 
        className="w-full max-w-md border border-white/20 rounded-[50px] p-10 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.9)] transition-all duration-700 relative my-auto animate-in zoom-in duration-500 overflow-hidden"
        style={{ 
          backgroundColor: `rgba(0, 0, 0, ${glassOpacity})`,
          backdropFilter: `blur(${config.blur}px)`,
          WebkitBackdropFilter: `blur(${config.blur}px)`
        }}
      >
        {/* Glow Background Effect */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-pink-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 text-white/40 hover:text-white group z-20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <header className="text-center mb-12 relative z-10">
          <h1 className="text-3xl font-black tracking-tighter text-white drop-shadow-2xl mb-2">
            Setup Your Agent
          </h1>
          <p className="text-[10px] font-black uppercase text-pink-500 tracking-[0.4em] opacity-80 animate-pulse">
            Personalize Your Companion 💦
          </p>
        </header>

        <div className="space-y-10 relative z-10">
          {/* STEP 1: AVATAR & NAME */}
          <section className="flex flex-col items-center gap-8">
            <div 
              className={`relative group p-1 transition-all duration-300 ${isDragging ? 'scale-110' : ''}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-36 h-36 md:w-44 md:h-44 rounded-[45px] md:rounded-[55px] overflow-hidden border-4 shadow-2xl bg-black/60 transition-all duration-500 cursor-pointer relative group ${isDragging ? 'border-pink-500 shadow-[0_0_50px_rgba(236,72,153,0.5)]' : 'border-white/10 group-hover:border-pink-500/50'}`}
              >
                {config.profilePic ? (
                  <img src={config.profilePic} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/10 gap-3">
                    <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Add Photo</p>
                  </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                   <p className="text-[10px] font-black text-white uppercase tracking-widest">Change Image</p>
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              
              <div className="absolute -bottom-2 -right-2 bg-pink-600 p-4 rounded-2xl shadow-2xl border-2 border-black/40 pointer-events-none group-hover:scale-110 transition-transform">
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

          {/* STEP 2: OFFICIAL GOOGLE SIGN IN */}
          <section className="space-y-6 pt-6 border-t border-white/10">
            <div className="text-center">
               <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-4">Official Authentication</p>
            </div>

            <button 
              onClick={handleGoogleLogin}
              className={`w-full flex items-center justify-center gap-4 py-4 md:py-5 rounded-2xl font-bold transition-all border group relative overflow-hidden ${hasApiKey ? 'bg-green-500/10 border-green-500/40 text-green-400 cursor-default' : 'bg-white text-gray-800 hover:bg-gray-50 border-white shadow-[0_15px_45px_rgba(255,255,255,0.1)] active:scale-95'}`}
            >
              {!hasApiKey ? (
                <>
                  {/* Google Logo */}
                  <div className="bg-white p-1 rounded-sm shadow-sm flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <span className="text-sm md:text-base font-sans font-semibold tracking-tight">
                    Sign in with Google
                  </span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-sm md:text-base tracking-tight font-black uppercase tracking-[0.1em]">Account Linked 💦</span>
                </>
              )}
            </button>
            
            <div className="text-center">
               <a 
                 href="https://ai.google.dev/gemini-api/docs/billing" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-[9px] font-black uppercase text-blue-400/50 hover:text-blue-400 transition-colors tracking-widest"
               >
                 Set Up Google Cloud Billing
               </a>
            </div>
          </section>

          {/* FINAL START BUTTON */}
          <div className="pt-8">
            <button 
              onClick={onStart} 
              className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-[length:200%_auto] animate-gradient hover:bg-right text-white font-black py-6 rounded-3xl shadow-[0_20px_60px_rgba(236,72,153,0.3)] active:scale-[0.97] transition-all uppercase tracking-[0.5em] text-[12px] border border-white/20"
            >
              Start Agent 💋
            </button>
            <button 
              onClick={onReset} 
              className="w-full text-[9px] font-black uppercase tracking-[0.3em] text-white/5 hover:text-red-500/50 transition-colors py-5"
            >
              Clear All Memories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupView;