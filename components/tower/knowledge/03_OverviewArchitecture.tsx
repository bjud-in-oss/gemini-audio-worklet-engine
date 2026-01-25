
import React from 'react';

const OverviewArchitecture: React.FC = () => {
    return (
        <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-emerald-500/30 pb-1">
                3. Lösningar & Hybridmotor
            </h3>
            
            <div className="space-y-5 bg-slate-900/30 p-5 rounded-xl border border-slate-800">
                <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-500 text-sm">A</div>
                    <div>
                        <h4 className="text-sm font-bold text-white">Hydraulisk VAD (Tripp Trapp Trull)</h4>
                        <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                            Vi har övergett statiska tider för tystnad. Systemet känner av "trycket" i buffertarna. 
                            <br/>• <strong>Utgående tryck (DAM):</strong> Ökar toleransen (Trull) för att tillåta konstpauser i monologer.
                            <br/>• <strong>Inkommande tryck (JITTER):</strong> Sänker toleransen mjukt (Soft Landing) när AI:n pratar.
                            <br/>• <strong>Noll tryck:</strong> Återgår till 200ms (Tripp) för blixtsnabb dialog.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-500 text-sm">B</div>
                    <div>
                        <h4 className="text-sm font-bold text-white">Hybrid-Prediktion & Sköld</h4>
                        <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                            När du slutar prata gissar vi hur länge AI:n behöver "tänka" (Olinjärt samband: långa input ger snabbare ord-per-minut). 
                            Så fort första ljudpaketet kommer, byter vi strategi till en rullande "Medelrisk"-timer. 
                            Detta ger snabba svar vid korta fraser men skyddar vid tunga översättningar.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-500 text-sm">C</div>
                    <div>
                        <h4 className="text-sm font-bold text-white">WebSocket Full-Duplex</h4>
                        <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                            Vi håller en öppen "tunnel" (WebSocket) mot Gemini. Vi strömmar 16kHz PCM-ljud upp och tar emot PCM-ljud ner i realtid.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OverviewArchitecture;
