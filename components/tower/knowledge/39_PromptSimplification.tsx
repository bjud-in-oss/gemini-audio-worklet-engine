
import React from 'react';

const PromptSimplification: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-3 border-b border-white/20 pb-1 flex items-center gap-2">
                <span className="bg-white text-black px-2 rounded text-xs">MODUL 39</span>
                Strategi: Prompt-Sanering (Kill Your Darlings)
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-white/10 text-slate-300 text-sm space-y-8">
                
                {/* 1. WHAT WE REMOVED */}
                <div className="space-y-4">
                    <h4 className="text-red-400 font-bold text-xs uppercase tracking-widest border-l-4 border-red-500 pl-3">Vad vi tog bort (Deprecated)</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        I jakten på kontroll hade vi byggt ett komplext system där vi skickade dolda textkommandon till AI:n. Detta visade sig vara kontraproduktivt med Gemini 2.5.
                    </p>
                    
                    <div className="space-y-2 mt-2">
                        <div className="bg-red-900/10 p-2 rounded border border-red-500/20 flex justify-between items-center">
                            <span className="text-xs text-red-300 line-through">[CMD: REPEAT_LAST]</span>
                            <span className="text-[10px] text-slate-500">Orsakade "stammning".</span>
                        </div>
                        <div className="bg-red-900/10 p-2 rounded border border-red-500/20 flex justify-between items-center">
                            <span className="text-xs text-red-300 line-through">[CMD: FILLER "Hmm..."]</span>
                            <span className="text-[10px] text-slate-500">Kändes onaturligt/robotaktigt.</span>
                        </div>
                        <div className="bg-red-900/10 p-2 rounded border border-red-500/20 flex justify-between items-center">
                            <span className="text-xs text-red-300 line-through">"WAITING STATE"</span>
                            <span className="text-[10px] text-slate-500">Ökade latensen vid omstart.</span>
                        </div>
                    </div>
                </div>

                {/* 2. WHAT REMAINED */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest border-l-4 border-emerald-500 pl-3">Det som blev kvar (The Core)</h4>
                    
                    <div className="bg-emerald-900/10 p-4 rounded border border-emerald-500/20 space-y-3">
                        <strong className="text-emerald-300 text-xs block">1. Simultantolk-identiteten</strong>
                        <p className="text-xs text-slate-400">
                            "You are a simultaneous interpreter."
                            <br/>Detta sätter rätt "mindset". Ingen småprat, bara jobb.
                        </p>

                        <strong className="text-emerald-300 text-xs block mt-2">2. Säkerhetsspärren</strong>
                        <p className="text-xs text-slate-400">
                            "NO CONVERSATION: Never answer questions posed by the user. Only translate them."
                            <br/>Detta är den enda "negativa" regeln vi behöll. Den är absolut nödvändig för att AI:n inte ska börja svara på prästens retoriska frågor.
                        </p>
                    </div>
                </div>

                {/* 3. CONCLUSION */}
                <div className="mt-4 p-3 bg-indigo-900/20 rounded border border-indigo-500/30 flex items-start gap-3">
                    <div className="text-xl mt-1">💡</div>
                    <div>
                        <strong className="text-indigo-300 text-xs block mb-1">Lärdom</strong>
                        <p className="text-[10px] text-slate-300 leading-relaxed">
                            Moderna modeller (Gemini 2.5/3.0) presterar bättre med <strong>färre</strong> instruktioner. 
                            Ju mer vi försökte "hacka" beteendet med logik i prompten, desto långsammare och mer förvirrad blev modellen. 
                            Renodlad rollbeskrivning ("Du är en bandspelare") vinner över komplexa regler.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default PromptSimplification;
