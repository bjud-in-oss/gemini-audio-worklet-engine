
import React from 'react';

const AbstractionLayers: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
            <h3 className="text-cyan-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-cyan-500/30 pb-1 flex items-center gap-2">
                20. Lösningen: Arkitekt & Elektriker (Hybridmotor)
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-cyan-500/20 text-slate-300 text-sm space-y-6">
                
                <p className="text-sm text-slate-400 leading-relaxed italic">
                    För att få 60 bilder i sekunden (silkeslen animation) var vi tvungna att dela upp ansvaret i koden. Vi kallar det "Hybrid-rendering".
                </p>

                {/* THE ROLES */}
                <div className="space-y-4">
                    <div className="bg-slate-950 p-4 rounded border-l-4 border-blue-500">
                        <strong className="text-blue-400 text-xs uppercase block mb-1">1. React (Arkitekten)</strong>
                        <p className="text-xs text-slate-400">
                            Reacts jobb är att <strong>bygga huset</strong>. Den placerar orden på skärmen i rätt ordning. 
                            Den är långsam men noggrann. Den körs bara när ny text kommer från servern.
                        </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded border-l-4 border-yellow-500">
                        <strong className="text-yellow-400 text-xs uppercase block mb-1">2. rAF Engine (Elektrikern)</strong>
                        <p className="text-xs text-slate-400">
                            Detta är en supersnabb loop (requestAnimationFrame) som körs 60 gånger i sekunden. 
                            Elektrikerns enda jobb är att <strong>tända lamporna</strong> (göra orden vita) vid exakt rätt millisekund. 
                            Den flyttar inga väggar (DOM-element), den slår bara på strömbrytarna (CSS-klasser).
                        </p>
                    </div>
                </div>

                <div className="bg-slate-950/50 p-3 rounded border border-cyan-500/30 text-xs text-slate-400">
                    <strong className="text-cyan-400 block mb-1">Varför detta löste problemet:</strong>
                    Tidigare försökte Arkitekten tända lamporna samtidigt som han byggde väggarna. Det blev rörigt. 
                    Nu låter vi Arkitekten bygga i fred, medan Elektrikern springer runt och tänder lampor i realtid.
                </div>

                {/* DEV SPECS */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <strong className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">Technical Implementation Specs</strong>
                    <div className="bg-black/30 p-2 rounded text-[10px] font-mono text-slate-400 space-y-1">
                        <p>• <strong>Bypass:</strong> Vi använder <code>containerRef.current.children[i].classList.add('active')</code>.</p>
                        <p>• <strong>Zero State:</strong> Vi uppdaterar <strong>aldrig</strong> React state (useState) inuti rAF-loopen. Det skulle trigga re-render och döda prestandan.</p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default AbstractionLayers;
