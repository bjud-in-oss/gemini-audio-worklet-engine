
import React from 'react';

const FutureRisksAndPlans: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-900">
            <h3 className="text-fuchsia-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-fuchsia-500/30 pb-1 flex items-center gap-2">
                10. Risker & Framtid: En Kritisk Analys
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-fuchsia-500/20 text-slate-300 text-sm space-y-8">
                
                {/* 1. REMAINING RISKS */}
                <div>
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                        <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-xs">STATUS: LIVE</span>
                        Kvarstående Risker
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-red-950/30 border border-red-500/10 p-4 rounded">
                            <strong className="text-red-400 text-xs uppercase block mb-1">1. Main Thread Flaskhals (UI vs Audio)</strong>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Nuvarande ljudmotor (ScriptProcessor) delar CPU-tråd med React. 
                                Funktioner som <code>useKaraokeAnimation</code> (60fps) och <code>useScrollPhysics</code> (Fysikmotor) tävlar om samma CPU-cykler som ljudet.
                                <br/><br/>
                                <strong>Mitigering v6.5:</strong> Vi har ökat bufferten till 4096 samples. Det ger UI:t mer tid att rita, men ökar den inre latensen till ca 250ms.
                            </p>
                        </div>
                        <div className="bg-red-950/30 border border-red-500/10 p-4 rounded">
                            <strong className="text-red-400 text-xs uppercase block mb-1">2. Monolog-timeout (20 min)</strong>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Google har en hård gräns. Om ljud streamas i 20 minuter <em>utan en enda tystnad på 500ms</em>, klipper de anslutningen. VAD-systemet nollställer denna timer vid andningspauser ("The Squeeze"), men teoretiskt kan en extremt snabb talare trigga detta.
                            </p>
                        </div>
                        <div className="bg-red-950/30 border border-red-500/10 p-4 rounded">
                            <strong className="text-red-400 text-xs uppercase block mb-1">3. Minneskrasch vid nätavbrott</strong>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Om nätet dör, buffrar vi ljudet ("Ketchup-effekten"). Utan tak kan detta fylla minnet.
                                <br/><strong className="text-white">Lösning v9.0:</strong> Infört säkerhetsgräns på 600 paket (~60 sekunder). Om bufferten överstiger detta kastas det äldsta ljudet bort och användaren varnas.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. DIALECTICAL ANALYSIS */}
                <div>
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                        <span className="bg-fuchsia-500/20 text-fuchsia-300 px-2 py-0.5 rounded text-xs">ANALYS</span>
                        Frivillig Förbättring: AudioWorklet
                    </h4>
                    
                    <p className="text-sm text-slate-400 mb-4 italic">
                        Planen är att byta ut <code>ScriptProcessor</code> mot <code>AudioWorklet</code>. 
                        Detta är enda sättet att ha både avancerad grafik (Karaoke) och låg latens (Buffer 2048) samtidigt.
                    </p>

                    <div className="space-y-6 relative pl-6 border-l-2 border-slate-700 ml-2">
                        
                        {/* LEVEL 1: THESIS */}
                        <div className="relative group">
                            <div className="absolute -left-[29px] top-1.5 w-4 h-4 rounded-full bg-green-500 group-hover:scale-125 transition-transform border-2 border-slate-900"></div>
                            <strong className="text-green-400 text-xs uppercase tracking-widest">Nivå 1: Hypotes</strong>
                            <p className="text-slate-300 mt-1 text-sm">
                                "Vi bör byta till AudioWorklet. Det körs på en separat CPU-tråd (Audio Thread). UI-lagg från kartor och animationer kommer aldrig mer påverka ljudet."
                            </p>
                        </div>

                        {/* LEVEL 2: ANTITHESIS */}
                        <div className="relative group">
                            <div className="absolute -left-[29px] top-1.5 w-4 h-4 rounded-full bg-red-500 group-hover:scale-125 transition-transform border-2 border-slate-900"></div>
                            <strong className="text-red-400 text-xs uppercase tracking-widest">Nivå 2: Kritik</strong>
                            <p className="text-slate-300 mt-1 text-sm">
                                "Men AudioWorklet är komplext. Det kräver en separat filinläsning som ofta kraschar i produktion (sökvägsfel). Dessutom kommunicerar det via meddelanden (port posting) vilket lägger till latens jämfört med ScriptProcessors direkta minnesåtkomst."
                            </p>
                        </div>

                        {/* LEVEL 3: SYNTHESIS */}
                        <div className="relative group">
                            <div className="absolute -left-[29px] top-1.5 w-4 h-4 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform border-2 border-slate-900"></div>
                            <strong className="text-indigo-400 text-xs uppercase tracking-widest">Nivå 3: Värdering</strong>
                            <p className="text-slate-300 mt-1 text-sm">
                                "Sökvägsfelen löser vi med 'Blob Injection' (samma som vi gjorde för VAD-workern). Latensen i meddelanden är nanosekunder jämfört med de 16ms+ hack vi får av Reacts rendering. Vinsten i stabilitet överväger den mikroskopiska latensökningen."
                            </p>
                        </div>

                        {/* LEVEL 4: DEEPER CRITIQUE */}
                        <div className="relative group">
                            <div className="absolute -left-[29px] top-1.5 w-4 h-4 rounded-full bg-yellow-500 group-hover:scale-125 transition-transform border-2 border-slate-900"></div>
                            <strong className="text-yellow-400 text-xs uppercase tracking-widest">Nivå 4: Djupare Kritik (Arkitektur)</strong>
                            <p className="text-slate-300 mt-1 text-sm">
                                "Vänta. Vår VAD-modell (ONNX) ligger i en Web Worker. AudioWorklet ligger i en annan tråd. 
                                Om vi byter, måste ljudet gå: <code>AudioWorklet -> Main Thread -> Web Worker</code>. 
                                Det är två hopp (Double-Hop). Idag går det <code>Main -> Worker</code> (Ett hopp). 
                                Vi riskerar att införa mer jitter och CPU-overhead på Main Thread bara för att slussa data."
                            </p>
                        </div>

                        {/* LEVEL 5: FINAL CONCLUSION */}
                        <div className="relative group">
                            <div className="absolute -left-[29px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform border-2 border-slate-900"></div>
                            <strong className="text-emerald-400 text-xs uppercase tracking-widest">Slutsats & Dom</strong>
                            <div className="text-slate-300 mt-2 bg-emerald-950/40 p-4 rounded border border-emerald-500/20">
                                <p className="mb-2 font-bold text-white text-sm">AudioWorklet godkänns ENDAST med "MessagePort Transfer".</p>
                                <p className="leading-relaxed text-sm">
                                    En naiv implementering (via Main Thread) förkastas pga Nivå 4-kritiken. 
                                    Lösningen är att skapa en direkt kanal mellan AudioWorklet och VAD-Workern genom att skicka en <code>MessagePort</code>. 
                                    Detta tillåter ljudet att flöda <code>AudioWorklet -> VAD Worker</code> helt utan att nudda Main Thread/UI.
                                </p>
                                <div className="mt-3 pt-2 border-t border-emerald-500/20 text-xs text-emerald-300 font-mono">
                                    RESULTAT: "The Holy Grail" - 0% UI-påverkan på ljudet.
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
};

export default FutureRisksAndPlans;
