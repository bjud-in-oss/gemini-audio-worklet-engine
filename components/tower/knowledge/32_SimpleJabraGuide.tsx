
import React from 'react';

const SimpleJabraGuide: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-3 border-b border-white/20 pb-1 flex items-center gap-2">
                <span className="bg-white text-black px-2 rounded text-xs">MODUL 32</span>
                Guide: Mac + Jabra (Litet Rum)
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-white/10 text-slate-300 text-sm space-y-8">
                
                {/* 1. SCENARIO */}
                <div className="space-y-4">
                    <h4 className="text-teal-400 font-bold text-xs uppercase tracking-widest border-l-4 border-teal-500 pl-3">Scenario: "Mötesrummet"</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Du använder en Mac och en <strong>Jabra Speak</strong> (ljudpuck) för både mikrofon och högtalare. Du vill att appen ska översätta/transkribera Zoom-mötet, men deltagarna i rummet måste också höra mötet genom pucken.
                    </p>
                </div>

                {/* 2. THE AUDIO MIDI SETUP */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-purple-500 pl-3">Steg 1: Skapa Multi-Output</h4>
                    
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3">
                        <p className="text-xs text-slate-400">
                            Vi måste lura Macen att skicka ljudet till två ställen samtidigt (Jabra + Appen).
                        </p>
                        <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2">
                            <li>Koppla in din Jabra Puck via USB.</li>
                            <li>Öppna <strong>Audio MIDI Setup</strong> på Macen.</li>
                            <li>Tryck <code>+</code> → <strong>Create Multi-Output Device</strong>.</li>
                            <li>Kryssa i följande enheter i listan:
                                <ul className="list-disc list-inside ml-4 mt-1 text-teal-400">
                                    <li>[x] BlackHole 2ch (Drift Correction)</li>
                                    <li>[x] Jabra Speak (Master Device)</li>
                                </ul>
                            </li>
                            <li><em>Tips:</em> Högerklicka på "Multi-Output Device" och döp om den till "Zoom Splitter".</li>
                        </ol>
                    </div>
                </div>

                {/* 3. ZOOM SETTINGS COMPARISON - UPDATED */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-red-500 pl-3">Steg 2: Zoom Inställningar (Kritisk Skillnad)</h4>
                    <p className="text-xs text-slate-400">
                        Ska Macen ha samma inställningar som Tesira-datorn? <strong>NEJ.</strong>
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        {/* TESIRA */}
                        <div className="bg-slate-950 p-3 rounded border border-slate-800 opacity-50">
                            <strong className="text-slate-500 text-xs block mb-1">Stora Salen (Tesira)</strong>
                            <div className="text-[10px] space-y-1">
                                <div className="text-green-400 font-bold">Original Sound: PÅ</div>
                                <div className="text-red-400 font-bold">Echo Cancel: AV</div>
                            </div>
                            <p className="text-[9px] text-slate-600 mt-2">
                                Tesiran tar bort ekot åt oss. Zoom ska inte röra ljudet.
                            </p>
                        </div>

                        {/* JABRA */}
                        <div className="bg-slate-950 p-3 rounded border border-blue-500 shadow-lg">
                            <strong className="text-blue-300 text-xs block mb-1">Lilla Rummet (Jabra)</strong>
                            <div className="text-[10px] space-y-1">
                                <div className="text-slate-300 font-bold">Original Sound: AV</div>
                                <div className="text-green-400 font-bold">Echo Cancel: AUTO</div>
                            </div>
                            <p className="text-[9px] text-slate-400 mt-2 leading-relaxed">
                                Jabran är bra, men inte perfekt. <strong>Låt Zooms filter vara påslagna.</strong> Om du kör "Original Sound" här kommer motparten höra eko.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 4. SUMMARY */}
                <div className="mt-2 p-3 bg-teal-900/10 rounded border border-teal-500/20 text-[10px] text-teal-200">
                    <strong>Resultat för Macen:</strong>
                    <ul className="list-disc list-inside mt-1">
                        <li><strong>Zoom Output:</strong> Välj "Zoom Splitter" (så både Jabra och App hör).</li>
                        <li><strong>Zoom Input:</strong> Välj "Jabra Speak".</li>
                        <li><strong>Zoom Audio Profile:</strong> Standard (Zoom Optimized).</li>
                    </ul>
                </div>

            </div>
        </section>
    );
};

export default SimpleJabraGuide;
