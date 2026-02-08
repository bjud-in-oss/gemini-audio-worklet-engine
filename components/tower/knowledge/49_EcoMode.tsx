
import React from 'react';

const EcoMode: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-500">
            <h3 className="text-green-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-green-500/30 pb-1 flex items-center gap-2">
                <span className="bg-green-900/30 text-green-300 px-2 rounded text-xs border border-green-500/30">MODUL 49</span>
                Energi: Eco Mode (Silence Detection)
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-green-500/20 text-slate-300 text-sm space-y-8">
                
                <p className="text-sm text-slate-400 leading-relaxed italic">
                    Ljudkortet är en av de största strömtjuvarna på en laptop. Att hålla igång en DAC (Digital-to-Analog Converter) kostar batteri även om man spelar tystnad.
                </p>

                {/* 1. THE LOGIC */}
                <div className="space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-green-500 pl-3">Väckarklockan</h4>
                    
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3">
                        <strong className="text-green-300 text-xs block">Princip: Suspend-on-Idle</strong>
                        <p className="text-xs text-slate-400">
                            Vi har implementerat en energimätare (RMS) direkt i <code>AudioWorklet</code>-tråden.
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-500 ml-2 space-y-1">
                            <li>Om utgående volym är &lt; 0.001 i <strong>3 sekunder</strong>, skickas signalen <code>VOICE_STOP</code>. Huvudtråden kör då <code>ctx.suspend()</code>. Hårdvaran stängs av.</li>
                            <li>Om volymen stiger över gränsen, ELLER om ny data kommer via nätverket, skickas <code>VOICE_START</code>. Vi kör <code>ctx.resume()</code> blixtsnabbt.</li>
                        </ul>
                    </div>
                </div>

                {/* 2. THE SAVINGS */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-yellow-500 pl-3">Varför detta är viktigt</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        På en Chromebook (batteridrift) kan en aktiv AudioContext dra 5-10% CPU konstant. Med Eco Mode faller detta till nära 0% under tystnad. 
                        Dessutom eliminerar det "vitt brus" (hiss) som billiga ljudkort ofta genererar när de är aktiva men tysta.
                    </p>
                </div>

            </div>
        </section>
    );
};

export default EcoMode;
