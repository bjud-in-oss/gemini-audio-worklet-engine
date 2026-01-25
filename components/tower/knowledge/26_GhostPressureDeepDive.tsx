
import React from 'react';

const GhostPressureDeepDive: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-500">
            <h3 className="text-fuchsia-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-fuchsia-500/30 pb-1 flex items-center gap-2">
                26. Diagnos: "Loopen" & Ghost Pressure
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-fuchsia-500/20 text-slate-300 text-sm space-y-6">
                
                <p className="text-sm text-slate-400 leading-relaxed italic">
                    Det mest kritiska felet vi löste var "Loopen" – där AI:n upprepade första meningen gång på gång, eller klippte av användaren mitt i uppläsning (t.ex. 1 Nephi).
                </p>

                {/* THE PROBLEM: THE LOOP */}
                <div className="space-y-4">
                    <div className="bg-slate-950 p-4 rounded border-l-4 border-red-500">
                        <strong className="text-red-400 text-xs uppercase block mb-1">Problemet: Context Fragmentation</strong>
                        <p className="text-xs text-slate-400 leading-relaxed mb-2">
                            När vi använde en strikt VAD-gräns (275ms) klipptes ljudet vid varje andningspaus.
                        </p>
                        <div className="bg-black/40 p-2 rounded font-mono text-[10px] text-slate-500 border border-white/5 space-y-1">
                            <p>Användare: "Och jag, Nephi..." <span className="text-red-500">[CUT 275ms]</span></p>
                            <p>AI (Hör bara fragment): "Och jag Nephi."</p>
                            <p>Användare: "...föddes av goda föräldrar..." <span className="text-red-500">[CUT 275ms]</span></p>
                            <p>AI (Förvirrad context): "Och jag Nephi." (Upprepar)</p>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            Eftersom AI:n aldrig fick hela meningen ("Och jag, Nephi, föddes av goda föräldrar"), fastnade den i en loop av att försöka tolka fragmenten isolerat.
                        </p>
                    </div>

                    {/* THE SOLUTION: GHOST PRESSURE */}
                    <div className="bg-slate-950 p-4 rounded border-l-4 border-green-500">
                        <strong className="text-green-400 text-xs uppercase block mb-1">Lösningen: Momentum (Ghost Pressure)</strong>
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">
                            Vi insåg att <strong>Tid är Tryck</strong>. Om en användare har pratat konstant i mer än 3 sekunder (C_MOM), bygger de upp "Momentum".
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <strong className="text-white text-xs block">Utan Momentum</strong>
                                <span className="text-xs text-slate-500">Dialog-läge</span>
                                <div className="text-red-400 font-bold text-lg font-mono">275ms</div>
                                <p className="text-[10px] text-slate-600">Klipper snabbt för "snappiness".</p>
                            </div>
                            <div className="bg-fuchsia-900/20 p-2 rounded border border-fuchsia-500/30">
                                <strong className="text-white text-xs block">Med Momentum (GHOST)</strong>
                                <span className="text-xs text-fuchsia-300">Monolog-läge</span>
                                <div className="text-green-400 font-bold text-lg font-mono">1200ms</div>
                                <p className="text-[10px] text-slate-400">Tillåter andningspauser.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* THE GOLDEN MEAN */}
                <div className="bg-slate-950/50 p-3 rounded border border-fuchsia-500/30 text-xs text-slate-400">
                    <strong className="text-fuchsia-400 block mb-1">Varför 1200ms?</strong>
                    Vi testade 800ms (för kort för 1 Nephi) och 2000ms (för segt för kommandon). 
                    <strong>1200ms</strong> visade sig vara den "Gyllene Medelvägen". Det är precis tillräckligt långt för att ta ett djupt andetag och vända blad, men kort nog för att kännas naturligt när man slutat prata.
                </div>

                {/* DEV SPECS */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <strong className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">Technical Implementation Specs</strong>
                    <div className="bg-black/30 p-2 rounded text-[10px] font-mono text-slate-400 space-y-1">
                        <p>• <strong>Trigger:</strong> <code>speechDuration &gt; MOMENTUM_START (3.0s)</code></p>
                        <p>• <strong>Effect:</strong> <code>hydraulicTarget = GHOST_TOLERANCE (1200ms)</code></p>
                        <p>• <strong>Visual:</strong> Visas som "GHOST: ON" (Lila) i Tower-panelen.</p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default GhostPressureDeepDive;
