
import React from 'react';

const AdaptiveSlew: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-400">
            <h3 className="text-orange-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-orange-500/30 pb-1 flex items-center gap-2">
                <span className="bg-orange-900/30 text-orange-300 px-2 rounded text-xs border border-orange-500/30">MODUL 43</span>
                Ljudmotor: Adaptive Slew (Legacy & Integration)
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-orange-500/20 text-slate-300 text-sm space-y-8">
                
                <p className="text-sm text-slate-400 leading-relaxed italic">
                    Adaptive Slew är "gaspedalen" i vårt system. I v2 (Hybrid Velocity) fungerar denna modul som styrenhet för WSOLA-motorn.
                </p>

                {/* 1. THE LOGIC */}
                <div className="space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-orange-500 pl-3">Slew Rate Limiting</h4>
                    
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3">
                        <strong className="text-orange-300 text-xs block">Principen: Tröghet</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Vi tillåter aldrig att hastigheten (`currentSpeed`) ändras momentant. 
                            Även om Zon-logiken (se Modul 50) säger "Gå till 1.3x", tvingar Slew-funktionen motorn att glida dit mjukt.
                        </p>
                        <div className="bg-slate-900 p-2 rounded border border-slate-700 font-mono text-[10px] text-slate-400 mt-2">
                            currentSpeed += (target - current) * 0.0001;
                        </div>
                    </div>
                </div>

                {/* 2. INTEGRATION WITH WSOLA */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-blue-400 font-bold text-xs uppercase tracking-widest border-l-4 border-blue-500 pl-3">Integration med WSOLA</h4>
                    <p className="text-xs text-slate-400">
                        Slew-värdet matas in i WSOLA-algoritmen:
                    </p>
                    <ul className="list-disc list-inside text-xs text-slate-500 ml-1">
                        <li><strong>Vid 1.0x:</strong> Motorn kör "Bit-perfect" loop (ingen processing).</li>
                        <li><strong>Vid &gt;1.0x:</strong> Motorn aktiverar Overlap-Add. Slew-värdet bestämmer hur mycket "överlapp" som krävs.</li>
                    </ul>
                    <div className="mt-2 p-2 bg-blue-900/20 rounded border border-blue-500/30 text-[10px] text-blue-200">
                        Se <strong>Modul 50</strong> för detaljer om Zon-indelningen.
                    </div>
                </div>

            </div>
        </section>
    );
};

export default AdaptiveSlew;
