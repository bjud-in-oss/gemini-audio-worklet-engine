
import React from 'react';

const EvaluationRealityCheck: React.FC = () => {
    return (
        <section className="mb-8 animate-in fade-in slide-in-from-bottom-7 duration-500 delay-500">
            <h3 className="text-pink-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-pink-500/30 pb-1">
                6. Utvärdering & Verklighetskoll
            </h3>

            <div className="bg-slate-900/50 p-5 rounded-xl border border-pink-500/20 text-slate-300 text-sm space-y-5">
                
                <p className="leading-relaxed">
                    Teori möter verklighet. Här är de största riskerna med vår arkitektur.
                </p>

                {/* THE C_SIL PARADOX */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800">
                    <strong className="text-white block mb-2 text-sm">⚠️ Serverns VAD vs Lokal C_SIL</strong>
                    <div className="text-xs space-y-2 text-slate-400 leading-relaxed">
                        <p>
                            <strong>Problem:</strong> Vi ökar <code>C_SIL</code> (Paus-tolerans) i "Trull-läget" (upp till 2000ms) för att tillåta pauser. 
                            Men Googles server har en egen VAD-modul som vi inte styr.
                        </p>
                        <p>
                            <strong>Risk:</strong> Om vår <code>C_SIL</code> är längre än Serverns timeout, kommer Servern tro att turen är slut och börja prata (skicka svar) <em>medan vi fortfarande buffrar</em>.
                        </p>
                        <p className="text-pink-300 italic border-l-2 border-pink-500 pl-3 py-1">
                            <strong>Lösning:</strong> "Dammen". Om Servern börjar prata (RX aktiveras) innan vi är klara, stänger vi Skölden. 
                            Vårt buffrade ljud hamnar i Dammen istället för att krocka. Det skickas först när Servern är klar.
                        </p>
                    </div>
                </div>

                {/* VAD SENSITIVITY */}
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <strong className="text-indigo-400 block mb-1 text-xs uppercase">Latens-gapet</strong>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Om Gemini svarar extremt snabbt (Cache Hit) innan vår prediktionstimer (Steg A) löpt ut, förlitar vi oss helt på att RX-detektionen klipper skölden.
                    </p>
                </div>

            </div>
        </section>
    );
};

export default EvaluationRealityCheck;
