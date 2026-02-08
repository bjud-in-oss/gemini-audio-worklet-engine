
import React from 'react';

const TotalSystemCritique: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-3 border-b border-white/20 pb-1 flex items-center gap-2">
                <span className="bg-white text-black px-2 rounded text-xs">MODUL 35</span>
                Totalanalys & Rekursiv Kritik
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-white/10 text-slate-300 text-sm space-y-8">
                
                {/* 1. TOTAL FUNCTIONALITY & THE SHIELD CORRECTION */}
                <div className="space-y-4">
                    <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest border-l-4 border-emerald-500 pl-3">1. Total Funktionalitet & "The Dam"</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Systemet är en <strong>Realtids-Orkestrator</strong> som hanterar flödet mellan en fysisk talare och en AI-tolk.
                    </p>
                    
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3">
                        <strong className="text-white text-xs block">Korrigerad Definition: "The Shield"</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Skölden kopplar <strong>inte</strong> bort mikrofonen. Den fungerar som en fördämning (Dam).
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="bg-red-900/20 p-2 rounded border border-red-500/20">
                                <strong className="text-red-300 text-[10px] block">Felaktig bild</strong>
                                <span className="text-[10px] text-slate-500">"Klipp kabeln." (Data förloras).</span>
                            </div>
                            <div className="bg-green-900/20 p-2 rounded border border-green-500/20">
                                <strong className="text-green-300 text-[10px] block">Korrekt bild</strong>
                                <span className="text-[10px] text-slate-500">"Stäng slussen." (Data buffras).</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            När AI:n pratar, samlas användarens tal i <code>shieldBuffer</code>. När AI:n tystnar, öppnas slussen och allt buffrat ljud skickas som en snabb sekvens ("Burst"). Detta förhindrar att vi tappar ord, men garanterar att AI:n aldrig hörs "i munnen" på sig själv (Semantisk Eko).
                        </p>
                    </div>
                </div>

                {/* 2. AEC MASTER PLAN */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest border-l-4 border-amber-500 pl-3">2. AEC Topologi (Den totala ljudbilden)</h4>
                    <p className="text-xs text-slate-400">
                        Ekoupphävning sker i tre isolerade lager som inte får krocka.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                            <strong className="text-amber-400 text-xs block mb-1">1. Tesira (Rummet)</strong>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                Tar bort ekot från <strong>Kyrksalen</strong>.
                                <br/>Krav: <code>AEC Reference</code> måste matas med BÅDE Zoom-ljud och AI-ljud.
                            </p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                            <strong className="text-blue-400 text-xs block mb-1">2. Zoom (Remote)</strong>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                Tar bort ekot från <strong>Deltagarnas hem</strong>.
                                <br/>Krav: Deltagare kör standard Zoom-inställningar (AEC På).
                            </p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                            <strong className="text-green-400 text-xs block mb-1">3. Appen (Passiv)</strong>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                Gör <strong>ingenting</strong> (Pro Mode).
                                <br/>Krav: Vi litar på Tesiran. Dubbel processning skadar ljudkvaliteten.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. ACTION PLAN */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-purple-400 font-bold text-xs uppercase tracking-widest border-l-4 border-purple-500 pl-3">3. Aktionsplan (Fas 1-3)</h4>
                    
                    <div className="relative border-l border-slate-700 ml-2 pl-4 space-y-4">
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500"></div>
                            <strong className="text-white text-xs block">FAS 1: Mjukvaran (Nu)</strong>
                            <p className="text-[10px] text-slate-400">
                                Optimering av Webbappen. Implementering av "Pro Mode" för att stänga av webbläsarens filter. Ljudmotorn flyttad till AudioWorklet för stabilitet.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                            <strong className="text-white text-xs block">FAS 2: Hårdvaran (Nästa vecka)</strong>
                            <p className="text-[10px] text-slate-400">
                                Fysisk konfiguration av Tesira. 
                                <br/>1. Stereo Split (Vänster=AI, Höger=Zoom).
                                <br/>2. Dragning av AEC Reference-kabel i Biamp Canvas.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] border border-indigo-400"></div>
                            <strong className="text-white text-xs block">FAS 3: Native Hub & BYOD</strong>
                            <p className="text-[10px] text-slate-400 mb-1">
                                Migrering till Tauri (Rust). Detta löser två problem samtidigt:
                            </p>
                            <ul className="list-disc list-inside text-[9px] text-slate-500">
                                <li><strong>Input:</strong> Komma åt <code>WASAPI Loopback</code> för att "tjuvlyssna" på Zoom utan virtuella kablar.</li>
                                <li><strong>Output (BYOD):</strong> Appen agerar lokal <strong>Webserver</strong>. Besökare i kyrkan ansluter till Wi-Fi och lyssnar via sina mobiler (låg latens via lokalt nätverk).</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 4. RECURSIVE CRITIQUE */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-red-400 font-bold text-xs uppercase tracking-widest border-l-4 border-red-500 pl-3">4. Rekursiv Kritisk Analys (Iterationen)</h4>
                    
                    <div className="space-y-3">
                        
                        {/* LOOP 1 */}
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                            <div className="flex gap-2 mb-2">
                                <span className="bg-red-900/30 text-red-300 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Kritik 1 (Skeptikern)</span>
                            </div>
                            <p className="text-xs text-slate-300 italic mb-2">
                                "Buffring (The Shield) låter bra i teorin, men om användaren pratar i 20 sekunder medan AI:n pratar, kommer AI:n att få 20 sekunder gammalt ljud när den är klar. Då svarar den på en fråga som ställdes för en evighet sedan."
                            </p>
                            
                            <div className="pl-3 border-l-2 border-green-500/30 mt-3">
                                <div className="flex gap-2 mb-1">
                                    <span className="bg-green-900/30 text-green-300 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Svar (Arkitekten)</span>
                                </div>
                                <p className="text-xs text-slate-400">
                                    Valid poäng. Men alternativet (Barge-in) är värre.
                                    <br/><strong>Lösning:</strong> FIFO-taket (Modul 10). Vi har satt en gräns på 600 paket. Om bufferten blir för gammal, börjar vi kasta den <em>äldsta</em> datan.
                                </p>
                            </div>
                        </div>

                        {/* LOOP 2 */}
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                            <div className="flex gap-2 mb-2">
                                <span className="bg-red-900/30 text-red-300 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Kritik 2 (Ljudteknikern)</span>
                            </div>
                            <p className="text-xs text-slate-300 italic mb-2">
                                "Ni förlitar er på Tesira AEC. Men om Zoom-deltagarna hemma INTE har headset, utan högtalare, kommer de att skapa ett eko som Tesiran i kyrkan omöjligt kan ta bort."
                            </p>
                            
                            <div className="pl-3 border-l-2 border-green-500/30 mt-3">
                                <div className="flex gap-2 mb-1">
                                    <span className="bg-green-900/30 text-green-300 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Svar (Systemet)</span>
                                </div>
                                <p className="text-xs text-slate-400">
                                    Korrekt. Tesira hanterar enbart <em>Rummet</em>.
                                    <br/><strong>Lösning:</strong> Hemma-deltagare kör standard Zoom (med mjukvaru-AEC på). De två systemen hanterar olika akustiska loopar.
                                </p>
                            </div>
                        </div>

                        {/* LOOP 3 */}
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                            <div className="flex gap-2 mb-2">
                                <span className="bg-red-900/30 text-red-300 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Kritik 3 (BYOD-säkerhet)</span>
                            </div>
                            <p className="text-xs text-slate-300 italic mb-2">
                                "Om ni kör en lokal webbserver i kyrkan för BYOD, hur hanterar ni HTTPS? Moderna mobiler vägrar spela upp ljud från osäkra (http) källor."
                            </p>
                            
                            <div className="pl-3 border-l-2 border-green-500/30 mt-3">
                                <div className="flex gap-2 mb-1">
                                    <span className="bg-green-900/30 text-green-300 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Svar (Fas 3)</span>
                                </div>
                                <p className="text-xs text-slate-400">
                                    Detta är en huvudutmaning i Fas 3.
                                    <br/><strong>Alternativ A:</strong> Self-signed certifikat (kräver att användaren klickar "Lita på").
                                    <br/><strong>Alternativ B:</strong> Tunnel via internet (Ngrok/Cloudflare), men det introducerar latens.
                                    <br/><strong>Alternativ C (Vinnare):</strong> En lokal Captive Portal-liknande lösning, eller en PWA som cacheas.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
};

export default TotalSystemCritique;
