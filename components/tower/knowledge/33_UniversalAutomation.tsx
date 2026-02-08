
import React from 'react';

const UniversalAutomation: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-3 border-b border-white/20 pb-1 flex items-center gap-2">
                <span className="bg-white text-black px-2 rounded text-xs">MODUL 33</span>
                Strategi: Antigravity & Cross-Platform
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-white/10 text-slate-300 text-sm space-y-8">
                
                {/* 1. THE DEVELOPMENT ENVIRONMENT */}
                <div className="space-y-3">
                    <h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest border-l-4 border-amber-500 pl-3">Utvecklingsmiljön: Google Antigravity</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Med <strong>Google Antigravity</strong> (Agent-first IDE) kan vi automatisera mycket av "boilerplate"-koden. Eftersom plattformen har terminal- och webbläsarkontroll är den idealisk för att bygga <strong>Tauri</strong>-appar.
                    </p>
                    <div className="bg-amber-900/20 p-3 rounded border border-amber-500/30">
                        <strong className="text-amber-300 text-xs block mb-1">Ditt Workflow (Chromebook)</strong>
                        <ul className="list-disc list-inside text-[10px] text-slate-400">
                            <li>Kör Linux (Crostini) på Chromebooken.</li>
                            <li>Använd Antigravity för att skriva Rust/React-koden.</li>
                            <li>Kör <code>npm run tauri dev</code> lokalt för att testa UI och logik.</li>
                        </ul>
                    </div>
                </div>

                {/* 2. THE HARDWARE GAP */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-red-500 pl-3">Utmaningen: Linux vs Kyrkan</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                            <strong className="text-white text-xs block mb-1">Hemma (Linux)</strong>
                            <p className="text-[10px] text-slate-500">
                                • Ingen Tesira.<br/>
                                • Inget ASIO.<br/>
                                • Standard Mikrofon.
                            </p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                            <strong className="text-white text-xs block mb-1">Kyrkan (Windows)</strong>
                            <p className="text-[10px] text-slate-500">
                                • Tesira via USB.<br/>
                                • ASIO Drivrutiner.<br/>
                                • Windows Audio Session (WASAPI).
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. THE MOCKING STRATEGY */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-green-500 pl-3">Lösningen: "Mocking"</h4>
                    
                    <div className="bg-green-900/10 p-4 rounded border border-green-500/20 space-y-3">
                        <p className="text-xs text-slate-300">
                            Du behöver inte sitta i kyrkan för att koda. Vi bygger appen så att den är "Hårdvaru-agnostisk".
                        </p>
                        
                        <div className="space-y-2">
                            <div className="bg-slate-900 p-2 rounded border border-slate-700">
                                <strong className="text-green-400 text-[10px] block">1. Abstraktionslagret (Rust)</strong>
                                <p className="text-[10px] text-slate-400">
                                    Vi skriver en Rust-modul som heter <code>AudioSource</code>.
                                    <br/>
                                    - På <strong>Linux</strong>: Den kopplar upp sig mot PulseAudio (din mic).
                                    <br/>
                                    - På <strong>Windows</strong>: Den försöker först ladda ASIO/WASAPI Loopback.
                                </p>
                            </div>
                            
                            <div className="bg-slate-900 p-2 rounded border border-slate-700">
                                <strong className="text-blue-400 text-xs block">2. Bygg & Deploy</strong>
                                <p className="text-[10px] text-slate-400">
                                    När du är nöjd med koden på Chromebooken, kör du ett "Cross-Compile" build script (eller GitHub Action) som spottar ut en <code>.exe</code>-fil. Denna fil flyttar du till kyrkdatorn.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. REKOMMENDATION */}
                <div className="mt-4 p-3 bg-indigo-900/20 rounded border border-indigo-500/30 flex items-start gap-3">
                    <div className="text-xl mt-1">🚀</div>
                    <div>
                        <strong className="text-indigo-300 text-xs block mb-1">Nästa steg</strong>
                        <p className="text-[10px] text-slate-300 leading-relaxed">
                            1. Använd din Chromebook och Linux.
                            <br/>
                            2. Starta ett nytt projekt i Antigravity/AI Studio för <strong>"Tauri Native Host"</strong>.
                            <br/>
                            3. Instruera AI:n: <em>"Jag utvecklar på Linux men målet är Windows med ASIO. Skapa en Rust-backend som använder 'CPAL' (Cross-Platform Audio Library) så att jag kan testa med min mic hemma."</em>
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default UniversalAutomation;
