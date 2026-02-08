
import React from 'react';

const PipeliningDeepDive: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-3 border-b border-white/20 pb-1 flex items-center gap-2">
                <span className="bg-white text-black px-2 rounded text-xs">MODUL 45</span>
                Pro Mode: Smart Stitching & Konflikten
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-white/10 text-slate-300 text-sm space-y-8">
                
                {/* 1. THE CONCEPT */}
                <div className="space-y-4">
                    <h4 className="text-green-400 font-bold text-xs uppercase tracking-widest border-l-4 border-green-500 pl-3">Konceptet: "Sy ihop, inte klippa"</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        I standardläget väntar vi på att AI:n pratat klart. I <strong>Pro Mode</strong> släpper vi skölden så fort servern ger <code>TurnComplete</code>.
                        Men vi upptäckte en kritisk konflikt när vi gjorde detta för snabbt.
                    </p>
                    
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                        <strong className="text-white text-xs block">Logik: Sömlös Ström</strong>
                        <p className="text-xs text-slate-400">
                            1. När skölden faller, skickas allt buffrat ljud ("Dammen") omedelbart.
                            <br/>
                            2. Vi skickar <strong>INTE</strong> <code>EndTurn</code>-signal här.
                            <br/>
                            3. Vi låter mikrofonen fortsätta vara öppen. Servern får bufferten + det nya ljudet som en enda lång, sammanhängande ljudfil ("Stitching").
                        </p>
                    </div>
                </div>

                {/* 2. THE CONFLICT */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-red-400 font-bold text-xs uppercase tracking-widest border-l-4 border-red-500 pl-3">Analys: "Vers 1 Saknas"</h4>
                    
                    <div className="bg-red-900/10 p-4 rounded border border-red-500/20 space-y-3">
                        <strong className="text-red-300 text-xs block">Symptom vid testning</strong>
                        <p className="text-xs text-slate-300">
                            När vi aktiverade Smart Stitching tappade vi plötsligt den första meningen i bufferten ("Och nu hände det sig..."). 
                            Resten av texten kom igenom perfekt.
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                            <strong>Diagnos:</strong> Vi skickade datan <em>för snabbt</em>. Servern var i en "Refractory Period" (återhämtning) precis efter att ha skickat TurnComplete. Detta ledde till <strong>Modul 46: The Blind Spot</strong>.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default PipeliningDeepDive;
