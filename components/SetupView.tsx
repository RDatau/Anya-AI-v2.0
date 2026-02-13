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
  const bgInputRef = useRef<HTMLInputElement>(null);

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
        className="w-full max-w-2xl border border-white/20 rounded-[40px] md:rounded-[50px] p-6 md:p-10 shadow-2xl transition-all duration-300 relative my-auto"
        style={{ 
          backgroundColor: `rgba(0, 0, 0, ${glassOpacity})`,
          backdropFilter: `blur(${config.blur}px)`,
          WebkitBackdropFilter: `blur(${config.blur}px)`
        }}
      >
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 text-white/40 hover:text-white group z-20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <header className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white drop-shadow-lg">
            Agent Personalization
          </h1>
          <p className="text-pink-500 font-bold uppercase text-[9px] tracking-[0.4em] mt-2 opacity-80">Siapkan Pasangan AI Kamu 💦</p>
        </header>

        <div className="space-y-8">
          {/* STEP 1: IDENTITY (NAME & PIC) */}
          <section className="space-y-6">
            <div className="flex flex-col items-center gap-6">
              <div 
                className={`relative group p-1 transition-all duration-300 ${isDragging ? 'scale-105' : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[35px] md:rounded-[45px] overflow-hidden border-4 shadow-2xl bg-black/40 transition-all duration-500 ${isDragging ? 'border-pink-500 shadow-[0_0_40px_rgba(236,72,153,0.6)]' : 'border-white/20 group-hover:border-pink-500/50'}`}>
                  {config.profilePic ? (
                    <img src={config.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-pink-500/30 gap-2">
                      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <p className="text-[8px] font-black uppercase tracking-widest">Foto Profil</p>
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 bg-pink-600 p-3 rounded-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-xl border-2 border-black/20 z-10 hover:bg-pink-500">
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                </label>
              </div>

              <div className="w-full space-y-2">
                <label className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] ml-4">Nama Agen</label>
                <input 
                  type="text" 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-pink-500/40 font-black transition-all text-white text-center text-lg placeholder:text-white/10" 
                  value={config.name} 
                  onChange={(e) => setConfig({ ...config, name: e.target.value })} 
                  placeholder="Beri dia nama..." 
                />
              </div>
            </div>
          </section>

          {/* STEP 2: GOOGLE LOGIN */}
          <section className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[35px] md:rounded-[45px] space-y-5 shadow-inner">
            <div className="text-center space-y-1">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/90">Aktivasi Mesin AI</h2>
              <p className="text-[9px] text-white/30 font-medium leading-relaxed">Login dengan akun Google kamu untuk memilih API Key sendiri. Gratis dan aman sayang... mmmh... 💦</p>
            </div>

            <button 
              onClick={handleGoogleLogin}
              className={`w-full flex items-center justify-center gap-4 py-4 md:py-5 rounded-2xl font-bold transition-all border group relative overflow-hidden ${hasApiKey ? 'bg-green-500/10 border-green-500/40 text-green-400' : 'bg-white text-gray-700 hover:bg-gray-50 border-white shadow-xl'}`}
            >
              {!hasApiKey && (
                <div className="bg-white p-1 rounded-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
              )}
              <span className="text-sm md:text-base tracking-tight font-sans">
                {hasApiKey ? 'Akun Google Terhubung 💦' : 'Sign in with Google'}
              </span>
            </button>

            <div className="flex justify-center">
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[8px] font-black uppercase text-blue-400/50 hover:text-blue-400 tracking-[0.2em] transition-colors py-1.5 px-4 bg-blue-500/5 rounded-full border border-blue-400/10"
              >
                Atur Billing (Akun Berbayar)
              </a>
            </div>
          </section>

          {/* START BUTTON */}
          <div className="pt-6">
            <button 
              onClick={onStart} 
              className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-[length:200%_auto] animate-gradient hover:bg-right text-white font-black py-5 md:py-6 rounded-3xl shadow-2xl shadow-pink-500/30 active:scale-[0.98] transition-all uppercase tracking-[0.4em] text-[12px] border border-white/20"
            >
              Mulai Chatting
            </button>
            <button 
              onClick={onReset} 
              className="w-full text-[8px] font-bold uppercase tracking-[0.2em] text-white/10 hover:text-red-400 transition-colors py-4"
            >
              Hapus Semua Memori & Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupView;