
import React from 'react';

const ShieldPunctureDeepDive: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            <h3 className="text-red-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-red-500/30 pb-1 flex items-center gap-2">
                <span className="bg-red-900/30 text-red-300 px-2 rounded text-xs border border-red-500/30">MODUL 40</span>
                Diagnos: Skölden & "Fysikens Lag"
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-red-500/20 text-slate-300 text-sm space-y-8">
                
                {/* 1. THE CRITICAL FLAW */}
                <div className="space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-red-500 pl-3">Felet: Att lita på Klockan</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Tidigare styrdes Skölden enbart av en Timer (BSY). När timern nådde noll, föll skölden.
                        <br/>
                        <strong>Problemet:</strong> Om nätverket var långsamt eller bufferten stor, kunde timern löpa ut <em>innan</em> vi hunnit spela upp allt ljud.
                        Resultatet blev "Barge-in" – vi skickade <code>EndTurn</code> medan vi fortfarande hade 15 sekunder ljud kvar att spela.
                    </p>
                </div>

                {/* 2. THE DEFINITIVE FIX */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest border-l-4 border-emerald-500 pl-3">Lösningen: Fysik &gt; Tid (Buffer Lock)</h4>
                    
                    <div className="bg-emerald-900/10 p-4 rounded border border-emerald-500/20 space-y-3">
                        <p className="text-xs text-slate-300">
                            Vi införde en ny lag i <code>useGeminiLive.ts</code>. Skölden får inte öppnas baserat på en gissning (tid). Den måste titta på den fysiska verkligheten.
                        </p>
                        
                        <div className="bg-slate-900 p-3 rounded border border-green-500/50 font-mono text-[10px]">
                            <span className="text-purple-400">const</span> isShieldActive = <br/>
                            &nbsp;&nbsp;(<span className="text-blue-300">timerActive</span>) <span className="text-red-400">||</span> (<span className="text-yellow-300">bufferGap &gt; 0.3s</span>);
                        </div>

                        <p className="text-xs text-slate-400 mt-2">
                            <strong>Effekt:</strong> Även om servern säger "Jag är klar" (Timer=0), vägrar Skölden att falla så länge det finns mer än 300ms ljud kvar i kön. 
                            Detta tvingar systemet att vänta in uppspelningen innan mikrofonen öppnas mot nätverket.
                        </p>
                    </div>
                </div>

                {/* 3. CONCLUSION */}
                <div className="mt-4 p-3 bg-indigo-900/20 rounded border border-indigo-500/30 flex items-start gap-3">
                    <div className="text-xl mt-1">🔒</div>
                    <div>
                        <strong className="text-indigo-300 text-xs block mb-1">Princip</strong>
                        <p className="text-[10px] text-slate-300 leading-relaxed">
                            Logik ska inte styra Fysik. Fysik ska styra Logik.
                            Vi litar inte längre på signaler ("TurnComplete"). Vi litar på buffertstorleken (verkligheten).
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default ShieldPunctureDeepDive;
