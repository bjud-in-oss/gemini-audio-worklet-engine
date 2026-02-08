
import React from 'react';

const MasterWiringGuide: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-3 border-b border-white/20 pb-1 flex items-center gap-2">
                <span className="bg-white text-black px-2 rounded text-xs">MODUL 30</span>
                Master Guide: Tesira AEC & Matrix Mix
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-white/10 text-slate-300 text-sm space-y-8">
                
                {/* 1. SINGLE REF LOGIC */}
                <div className="space-y-4">
                    <h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest border-l-4 border-amber-500 pl-3">Konceptet: "Single AEC Reference"</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Många moderna Tesira-konfigurationer använder en enda gemensam <strong>AEC Reference</strong>-signal för hela rummet. 
                        Detta sparar DSP-kraft men kräver disciplin i Matrix-mixern.
                    </p>
                    
                    <div className="bg-amber-900/20 p-3 rounded border border-amber-500/30 text-center">
                        <strong className="text-amber-300 text-xs block mb-1">Gyllene Regeln</strong>
                        <span className="text-[10px] text-slate-400">
                            "Allt ljud som går ut i högtalarna (utom mikrofonerna själva) MÅSTE också skickas till AEC Reference-pinnen."
                        </span>
                    </div>
                </div>

                {/* 2. THE MATRIX TABLE */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-blue-500 pl-3">Matrix Mixer: Mix-Minus Schema</h4>
                    <p className="text-xs text-slate-400 mb-2">
                        Här ser du exakt vilka kryss (crosspoints) som ska vara aktiva i Tesirans Matrix Block.
                    </p>
                    
                    <div className="overflow-x-auto border border-slate-700 rounded-lg bg-slate-950">
                        <table className="w-full text-[10px] md:text-xs text-left border-collapse font-mono">
                            <thead>
                                <tr className="bg-slate-900 text-slate-500 border-b border-slate-700">
                                    <th className="p-3 border-r border-slate-700 w-1/4">INPUT (KÄLLA)</th>
                                    <th className="p-3 border-r border-slate-700 w-1/4 text-center bg-blue-900/10 text-blue-300">
                                        OUT: HÖGTALARE<br/>(Salen)
                                    </th>
                                    <th className="p-3 border-r border-slate-700 w-1/4 text-center bg-yellow-900/10 text-yellow-300">
                                        OUT: AEC REF<br/>(Referens)
                                    </th>
                                    <th className="p-3 text-center bg-purple-900/10 text-purple-300">
                                        OUT: USB REC<br/>(Till Zoom)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-300">
                                {/* RAD 1: MIKROFON */}
                                <tr className="border-b border-slate-800/50">
                                    <td className="p-3 border-r border-slate-700 font-bold text-white">
                                        1. Mikrofoner
                                    </td>
                                    <td className="p-3 text-center border-r border-slate-700 bg-blue-900/5">
                                        <span className="text-green-400 font-bold">PÅ</span>
                                    </td>
                                    <td className="p-3 text-center border-r border-slate-700 bg-yellow-900/5">
                                        <span className="text-red-500 font-bold opacity-50">AV</span>
                                    </td>
                                    <td className="p-3 text-center bg-purple-900/5">
                                        <span className="text-green-400 font-bold">PÅ</span>
                                    </td>
                                </tr>

                                {/* RAD 2: ZOOM (HÖGER) */}
                                <tr className="border-b border-slate-800/50">
                                    <td className="p-3 border-r border-slate-700 font-bold text-emerald-300">
                                        2. Zoom Ljud
                                    </td>
                                    <td className="p-3 text-center border-r border-slate-700 bg-blue-900/5">
                                        <span className="text-green-400 font-bold">PÅ</span>
                                    </td>
                                    <td className="p-3 text-center border-r border-slate-700 bg-yellow-900/5 relative">
                                        <span className="text-green-400 font-bold">PÅ</span>
                                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                                    </td>
                                    <td className="p-3 text-center bg-red-900/10">
                                        <span className="text-red-500 font-black">AV (Mix-Minus)</span>
                                    </td>
                                </tr>

                                {/* RAD 3: AI (VÄNSTER) */}
                                <tr>
                                    <td className="p-3 border-r border-slate-700 font-bold text-indigo-300">
                                        3. AI Översättning
                                    </td>
                                    <td className="p-3 text-center border-r border-slate-700 bg-blue-900/5">
                                        <span className="text-green-400 font-bold">PÅ</span>
                                    </td>
                                    <td className="p-3 text-center border-r border-slate-700 bg-yellow-900/5 relative">
                                        <span className="text-green-400 font-bold">PÅ</span>
                                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                                    </td>
                                    <td className="p-3 text-center bg-green-900/10">
                                        <span className="text-green-400 font-bold">PÅ</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. DIAGNOSIS: PUMPING */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-red-500 pl-3">Symptom: "Pumping" & Dubbel AEC</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                            <strong className="text-red-400 text-xs block mb-1">Fenomenet</strong>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                Om ljudet låter metalliskt, hackigt eller "som under vatten" (Pumping), beror det oftast på att <strong>både</strong> Tesira och Zoom försöker ta bort ekot samtidigt.
                            </p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                            <strong className="text-green-400 text-xs block mb-1">Varför det lät bra ibland?</strong>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                AEC jobbar bara när det finns motljud (någon pratar i Zoom). Om du var ensam var Zooms filter inaktivt. Problemet uppstår först vid dialog.
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30 text-center">
                        <strong className="text-blue-300 text-xs block mb-1">Lösning: Original Sound</strong>
                        <span className="text-[10px] text-slate-400">
                            Stäng ALLTID av "Echo Cancellation" i Zoom när du använder Tesira. Låt hårdvaran göra jobbet.
                        </span>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default MasterWiringGuide;
