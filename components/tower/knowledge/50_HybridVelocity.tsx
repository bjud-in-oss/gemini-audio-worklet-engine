
import React from 'react';

const HybridVelocity: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-500">
            <h3 className="text-cyan-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-cyan-500/30 pb-1 flex items-center gap-2">
                <span className="bg-cyan-900/30 text-cyan-300 px-2 rounded text-xs border border-cyan-500/30">MODUL 50</span>
                Audio Engine v2: WSOLA (Macro Speed)
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-cyan-500/20 text-slate-300 text-sm space-y-8">
                
                <p className="text-sm text-slate-400 leading-relaxed italic">
                    WSOLA-mätaren visar hur hårt "Tidsmaskinen" arbetar.
                    Vi tillåter nu upp till 5 sekunders "naturlig latens" (simultantolk-standard) innan vi börjar jobba ikapp.
                    <br/>
                    <strong>Nyhet v8.1:</strong> Zonerna baseras nu på TOTAL LATENS (Dam + Jitter).
                </p>

                {/* 1. THE ZONES */}
                <div className="space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-cyan-500 pl-3">WSOLA Hastighetszoner</h4>
                    
                    <div className="overflow-hidden border border-slate-700 rounded-lg bg-slate-950 font-mono text-xs">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-900 text-slate-500 border-b border-slate-700">
                                    <th className="p-3 w-20">Zon</th>
                                    <th className="p-3">Total Latens (s)</th>
                                    <th className="p-3 text-right">WSOLA Speed</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {/* ZONE 1 */}
                                <tr className="bg-emerald-900/5">
                                    <td className="p-3 font-bold text-emerald-400">1. Realtid</td>
                                    <td className="p-3 text-slate-400">0.0s - 5.0s</td>
                                    <td className="p-3 text-right text-emerald-300">1.00x</td>
                                    <td className="p-3 text-slate-500">Naturlig tolk-latens</td>
                                </tr>
                                {/* ZONE 2 */}
                                <tr className="bg-blue-900/5">
                                    <td className="p-3 font-bold text-blue-400">2. Mjuk</td>
                                    <td className="p-3 text-slate-400">5.0s - 15.0s</td>
                                    <td className="p-3 text-right text-blue-300">1.05x - 1.10x</td>
                                    <td className="p-3 text-slate-500">Smygande catch-up</td>
                                </tr>
                                {/* ZONE 3 */}
                                <tr className="bg-amber-900/5">
                                    <td className="p-3 font-bold text-amber-400">3. Aggressiv</td>
                                    <td className="p-3 text-slate-400">15.0s - 25.0s</td>
                                    <td className="p-3 text-right text-amber-300">1.20x</td>
                                    <td className="p-3 text-slate-500">Hård catch-up (Persona: FAST)</td>
                                </tr>
                                {/* ZONE 4 */}
                                <tr className="bg-red-900/5">
                                    <td className="p-3 font-bold text-red-400">4. Panik</td>
                                    <td className="p-3 text-slate-400">&gt; 25.0s</td>
                                    <td className="p-3 text-right text-red-300">1.30x</td>
                                    <td className="p-3 text-slate-400 font-bold">MAX (Persona: ROCKET)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. VISUALIZATION */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-purple-500 pl-3">Hitta mätarna</h4>
                    <p className="text-xs text-slate-400">
                        Tri-Velocity mätarna hittar du nu under sektionen <strong>TRANSPORT & FLOW</strong> i Tower-panelen.
                    </p>
                </div>

            </div>
        </section>
    );
};

export default HybridVelocity;
