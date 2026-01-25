
import React from 'react';

const TheSqueezeDeepDive: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-1400">
            <h3 className="text-rose-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-rose-500/30 pb-1 flex items-center gap-2">
                15. The Squeeze: Hantering av Monologer
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-rose-500/20 text-slate-300 text-sm space-y-6">
                
                <p className="text-sm text-slate-400 leading-relaxed italic">
                    Även i "Trull-läge" (hög tolerans) kan vi inte vänta för evigt. Google har en hård gräns på ca 30 sekunder.
                </p>

                {/* LOGIC EXPLANATION */}
                <div className="space-y-3">
                    <div className="flex gap-3">
                        <div className="w-1 bg-green-500 rounded"></div>
                        <div>
                            <strong className="text-white text-xs block">0-20 sek: Tripp Trapp Trull</strong>
                            <p className="text-xs text-slate-400">
                                Systemet anpassar sig efter talaren. Om bufferten fylls, ökar vi toleransen för att tillåta konstpauser.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        <div className="w-1 bg-orange-500 rounded"></div>
                        <div>
                            <strong className="text-white text-xs block">20-25 sek: The Squeeze (Pressen)</strong>
                            <p className="text-xs text-slate-400">
                                Vid 20 sekunder börjar systemet bli nervöst. Toleransen sänks linjärt från nuvarande nivå ner till <strong>100ms</strong>. 
                                Vid 25 sekunder är vi nere på botten.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="w-1 bg-red-500 rounded"></div>
                        <div>
                            <strong className="text-white text-xs block">25-30 sek: Andrum (The Gap)</strong>
                            <p className="text-xs text-slate-400">
                                Vi ligger kvar på 100ms tolerans. Detta är "Kill Zone". Minsta lilla millisekund av tystnad kommer att bryta turen omedelbart för att rädda sessionen innan Googles 30s-gräns slår till.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default TheSqueezeDeepDive;
