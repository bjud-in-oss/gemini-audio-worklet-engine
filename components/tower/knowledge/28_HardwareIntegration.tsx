
import React from 'react';

const HardwareIntegration: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-600">
            <h3 className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-amber-500/30 pb-1 flex items-center gap-2">
                28. Hardware Integration: Tesira & Pro Mode
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-amber-500/20 text-slate-300 text-sm space-y-8">
                
                <p className="text-sm text-slate-400 leading-relaxed italic">
                    För att uppnå studiokvalitet i kyrkomiljö använder vi en "Ren Signalkedja". Detta kräver att både hårdvara (DSP) och mjukvara (App) konfigureras för att inte motarbeta varandra.
                </p>

                {/* THE PROBLEM: DOUBLE PROCESSING */}
                <div className="space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-red-500 pl-3">Problemet: "Double Processing"</h4>
                    
                    <div className="bg-red-950/20 p-4 rounded border border-red-500/20 space-y-2">
                        <strong className="text-red-400 text-xs block">Undervattens-effekten</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Tesira Forté har inbyggd AEC (Ekoupphävmning) och Brusreducering i världsklass. 
                            Webbläsare (Chrome) har <em>också</em> dessa filter inbyggda som standard.
                            <br/><br/>
                            Om <strong>båda</strong> är aktiva samtidigt, försöker webbläsaren "tvätta" ett ljud som redan är rent. Resultatet låter robotaktigt, klippt och som att man pratar under vatten.
                        </p>
                    </div>
                </div>

                {/* THE SOLUTION: BIT-PERFECT CHAIN */}
                <div className="space-y-4 pt-2 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-green-500 pl-3">Lösningen: Bit-Perfect Chain</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* STEP 1: TESIRA */}
                        <div className="bg-slate-950 p-4 rounded border border-slate-800">
                            <div className="flex justify-between items-center mb-2">
                                <strong className="text-amber-400 text-xs block">Steg 1: Hårdvara (Tesira)</strong>
                                <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-500">Biamp Config</span>
                            </div>
                            <p className="text-xs text-slate-400 mb-3">
                                Vi måste berätta för datorn att Tesiran hanterar sitt eget eko.
                            </p>
                            <div className="bg-black/40 p-2 rounded border border-white/10 font-mono text-[10px] text-green-300">
                                USB Block &gt; Initialization &gt;<br/>
                                "Speakerphone: Disables Computer AEC"
                            </div>
                        </div>

                        {/* STEP 2: APP */}
                        <div className="bg-slate-950 p-4 rounded border border-slate-800">
                            <div className="flex justify-between items-center mb-2">
                                <strong className="text-green-400 text-xs block">Steg 2: Mjukvara (App)</strong>
                                <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-500">Settings</span>
                            </div>
                            <p className="text-xs text-slate-400 mb-3">
                                Vi måste tvinga Chrome att stänga av sina filter via <code>MediaTrackConstraints</code>.
                            </p>
                            <div className="bg-black/40 p-2 rounded border border-white/10 font-mono text-[10px] text-green-300">
                                Inställningar &gt; "Pro Mode"<br/>
                                [x] PRO MODE (Raw Audio / DSP)
                            </div>
                        </div>
                    </div>
                </div>

                {/* SIGNAL FLOW */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-blue-500 pl-3">Det Optimala Flödet</h4>
                    
                    <div className="flex items-center gap-2 text-[10px] font-mono overflow-x-auto pb-2">
                        <div className="bg-slate-800 p-2 rounded text-slate-300 border border-slate-700">Talare</div>
                        <span className="text-slate-600">→</span>
                        <div className="bg-amber-900/30 p-2 rounded text-amber-400 border border-amber-500/30 font-bold">Tesira (AEC+NR)</div>
                        <span className="text-slate-600">→</span>
                        <div className="bg-slate-800 p-2 rounded text-slate-300 border border-slate-700">USB (Raw)</div>
                        <span className="text-slate-600">→</span>
                        <div className="bg-green-900/30 p-2 rounded text-green-400 border border-green-500/30 font-bold">App (Pro Mode)</div>
                        <span className="text-slate-600">→</span>
                        <div className="bg-purple-900/30 p-2 rounded text-purple-400 border border-purple-500/30">VAD (Neural)</div>
                    </div>
                    
                    <p className="text-xs text-slate-500 italic mt-2">
                        Med denna kedja får vår Neurala VAD en helt ren signal, vilket gör att den reagerar snabbare och mer exakt på tal vs tystnad.
                    </p>
                </div>

            </div>
        </section>
    );
};

export default HardwareIntegration;
