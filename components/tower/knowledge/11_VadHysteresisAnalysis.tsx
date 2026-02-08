
import React from 'react';

const VadHysteresisAnalysis: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-1000">
            <h3 className="text-orange-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-orange-500/30 pb-1 flex items-center gap-2">
                11. Hydraulisk VAD: Tripp Trapp Trull
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-orange-500/20 text-slate-300 text-sm space-y-8">
                
                {/* 1. STATUS UPDATE */}
                <div>
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                        <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded text-xs">IMPLEMENTERAD (v8.0)</span>
                        Aktiv Logik i <code>useAudioInput</code>
                    </h4>
                    <p className="text-sm text-slate-400 mb-2">
                        Denna logik är inte längre en hypotes. Den körs live i varje "Worker Result"-cykel. Systemet beräknar dynamiskt <code>ACTIVE_SIL</code> (Paus-tolerans) baserat på tre tillstånd:
                    </p>
                    <ul className="list-disc list-inside text-sm text-slate-400 space-y-2 ml-1">
                        <li>
                            <strong className="text-orange-300">Trull (Monolog):</strong> Aktiveras om <code>damPressure &gt; 0</code> (Full ut-buffert) ELLER <code>ghostPressure</code> (Tid &gt; 3s). Toleransen ökas kraftigt för att tillåta andningspauser.
                        </li>
                        <li>
                            <strong className="text-yellow-300">Trapp (Lyssna):</strong> Aktiveras om <code>jitterPressure &gt; 0.1s</code> (AI:n pratar). Toleransen halveras mjukt för att vi ska sluta prata snabbare om vi blir avbrutna.
                        </li>
                        <li>
                            <strong className="text-green-300">Tripp (Dialog):</strong> Aktiveras vid noll tryck. Återgår till <code>275ms</code> för blixtsnabb ping-pong.
                        </li>
                    </ul>
                </div>

                {/* 2. IMPLEMENTATION DETAILS */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800 text-xs font-mono text-slate-400 space-y-3">
                    <strong className="text-white border-b border-slate-700 pb-1 block">Kod-Implementering (Pseudokod)</strong>
                    <div className="space-y-1">
                        <p><span className="text-blue-400">let</span> target = 275;</p>
                        <p><span className="text-purple-400">if</span> (shieldBuffer.length &gt; 0) target = 2000; <span className="text-slate-600">// Trull (Dam)</span></p>
                        <p><span className="text-purple-400">else if</span> (ghostActive) target = 1200; <span className="text-slate-600">// Trull (Ghost)</span></p>
                        <p><span className="text-purple-400">else if</span> (bufferGap &gt; 0.1) target = C_SIL / 2; <span className="text-slate-600">// Trapp</span></p>
                        <p><span className="text-slate-500">// Tripp är fallback (275ms)</span></p>
                    </div>
                    <div className="bg-red-900/10 p-2 rounded border border-red-500/20 mt-2">
                        <strong className="text-red-300">SQUEEZE (Nödstopp):</strong>
                        <p>Om <code>speechDuration &gt; 20s</code>, tvingas target linjärt ner mot 100ms oavsett ovanstående logik.</p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default VadHysteresisAnalysis;
