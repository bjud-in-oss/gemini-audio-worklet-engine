
import React from 'react';

const TheBlindSpotDeepDive: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-400">
            <h3 className="text-orange-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-orange-500/30 pb-1 flex items-center gap-2">
                <span className="bg-orange-900/30 text-orange-300 px-2 rounded text-xs border border-orange-500/30">MODUL 46</span>
                Diagnos: The Blind Spot & Deep Breath
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-orange-500/20 text-slate-300 text-sm space-y-8">
                
                <p className="text-sm text-slate-400 leading-relaxed italic">
                    Vi upptäckte att Google-servern blir "döv" i en bråkdels sekund efter att den avslutat sin tur. Detta svalde våra buffrade paket.
                </p>

                {/* 1. THE PHENOMENON */}
                <div className="space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-red-500 pl-3">Fenomenet: Server Refractory Period</h4>
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                        <p className="text-xs text-slate-400">
                            <strong>Tidigare logik:</strong> <code>TurnComplete</code> → Vänta 0ms → Spola Buffert.
                            <br/>
                            <strong>Resultat:</strong> Servern klippte de första 1-2 sekunderna av ljudet. Den trodde det var "eko" eller brus från föregående tur.
                        </p>
                        <div className="bg-black/40 p-2 rounded text-[10px] font-mono text-red-400 border border-white/10">
                            &lt;noise&gt; ...Benjamin has spoken. (Första halvan borta)
                        </div>
                    </div>
                </div>

                {/* 2. THE SOLUTION */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest border-l-4 border-emerald-500 pl-3">Lösningen: "The Deep Breath" (450ms)</h4>
                    
                    <div className="bg-emerald-900/10 p-4 rounded border border-emerald-500/20 space-y-3">
                        <strong className="text-emerald-300 text-xs block">Tvingad Vilo-puls</strong>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Vi införde en tvingande fördröjning i <code>useGeminiLive.ts</code>.
                            När vi får <code>TurnComplete</code>, tvingar vi systemet att ta ett "djupt andetag" innan vi släpper dammluckorna.
                        </p>
                        
                        <div className="bg-slate-900 p-3 rounded border border-emerald-500/50 font-mono text-[10px]">
                            <span className="text-purple-400">if</span> (shouldDropShield) &#123;<br/>
                            &nbsp;&nbsp;<span className="text-slate-500">// Ge servern tid att återhämta sig</span><br/>
                            &nbsp;&nbsp;<span className="text-blue-300">busyUntilRef.current</span> = <span className="text-yellow-300">Date.now() + 450;</span><br/>
                            &#125;
                        </div>

                        <p className="text-xs text-slate-400 mt-2">
                            <strong>Resultat:</strong> 100% dataintegritet. Hela meningen ("Och nu hände det sig...") kom igenom. Latensen på 0.45s är försumbar i sammanhanget (predikan), men datakvaliteten är avgörande.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default TheBlindSpotDeepDive;
