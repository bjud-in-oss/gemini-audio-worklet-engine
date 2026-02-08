
import React from 'react';

const AudioDistribution: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-3 border-b border-white/20 pb-1 flex items-center gap-2">
                <span className="bg-white text-black px-2 rounded text-xs">MODUL 36</span>
                Distribution: Wi-Fi & Lyssnar-klienter
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-white/10 text-slate-300 text-sm space-y-8">
                
                {/* 1. CURRENT STATE VS VISION */}
                <div className="space-y-4">
                    <h4 className="text-orange-400 font-bold text-xs uppercase tracking-widest border-l-4 border-orange-500 pl-3">Nulägesanalys: Producent vs Konsument</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Just nu är denna app en ren **Generator**. Den skapar ljudet men har inget eget system för att skicka det till 50 personer i kyrkbänkarna.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                            <strong className="text-white text-xs block mb-1">Nuvarande Flöde</strong>
                            <p className="text-[10px] text-slate-500">
                                App -> Ljudkort -> Tesira -> <span className="text-orange-400">Zoom / Hörslinga / FM-sändare</span>.
                                <br/><em>Lyssnaren behöver extern hårdvara eller Zoom-appen.</em>
                            </p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                            <strong className="text-white text-xs block mb-1">Vision (BYOD)</strong>
                            <p className="text-[10px] text-slate-500">
                                App -> Wi-Fi -> <span className="text-green-400">Lyssnarens Mobil</span>.
                                <br/><em>Besökaren scannar en QR-kod och lyssnar i webbläsaren.</em>
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. THE AUTO-TAB PROBLEM */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-red-400 font-bold text-xs uppercase tracking-widest border-l-4 border-red-500 pl-3">Browser Security: Den Automatiska Fliken</h4>
                    
                    <div className="bg-red-900/10 p-4 rounded border border-red-500/20 space-y-2">
                        <strong className="text-red-300 text-xs block">Hindret: Pop-up Blocker</strong>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            <em>"Kan systemet öppna flikar automatiskt när någon ber om ett språk?"</em>
                            <br/><br/>
                            <strong>Nej.</strong> Webbläsare tillåter endast <code>window.open()</code> om det sker som direkt respons på ett användarklick (Trusted Event). Ett WebSocket-meddelande från en server räknas inte som ett användarklick.
                        </p>
                        <div className="bg-slate-900 p-2 rounded text-[10px] text-slate-400 border border-slate-700 mt-2">
                            <strong>Lösning: Admin Dashboard</strong><br/>
                            Vi bygger en vy där Admin ser: <em>"Förfrågan: Spanska (3 pers)"</em>.<br/>
                            Admin klickar på en knapp "Starta Spanska". Då öppnas fliken, eftersom det är en mänsklig handling.
                        </div>
                    </div>
                </div>

                {/* 3. WI-FI TRANSPORT ARCHITECTURE */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-blue-400 font-bold text-xs uppercase tracking-widest border-l-4 border-blue-500 pl-3">Arkitektur för Wi-Fi Lyssning (Framtid)</h4>
                    <p className="text-xs text-slate-400">
                        För att lyssnare ska kunna höra översättningen direkt i sina mobiler utan Zoom, krävs en **Local Relay Server**.
                    </p>

                    <div className="relative bg-black/40 p-4 rounded-lg border border-white/10 font-mono text-xs space-y-4">
                        
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-900/30 text-indigo-300 p-2 rounded border border-indigo-500/30 w-24 text-center">
                                Översättar-App
                            </div>
                            <div className="h-0.5 flex-1 bg-indigo-500/50 relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-indigo-400">WebRTC / WS</div>
                            </div>
                            <div className="bg-slate-800 text-white p-2 rounded border border-slate-600 w-24 text-center">
                                Relay Server
                                <div className="text-[8px] text-slate-400">(Node.js / Go)</div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <div className="w-0.5 h-8 bg-slate-600"></div>
                        </div>

                        <div className="flex justify-center gap-2">
                            <div className="bg-green-900/20 text-green-400 p-1.5 rounded border border-green-500/30 text-[9px]">Mobil 1</div>
                            <div className="bg-green-900/20 text-green-400 p-1.5 rounded border border-green-500/30 text-[9px]">Mobil 2</div>
                            <div className="bg-green-900/20 text-green-400 p-1.5 rounded border border-green-500/30 text-[9px]">Mobil 3...</div>
                        </div>

                        <p className="text-[10px] text-slate-400 italic mt-2 border-t border-slate-700 pt-2">
                            <strong>Varför en server?</strong> En webbläsare (Översättar-appen) orkar inte skicka ljudströmmar till 50 klienter samtidigt (Peer-to-Peer kraschar vid ~5-10 anslutningar). Vi måste ha en server som "multiplicerar" ljudet.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default AudioDistribution;
