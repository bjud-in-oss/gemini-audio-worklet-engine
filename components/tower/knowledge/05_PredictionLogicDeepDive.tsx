
import React from 'react';

const PredictionLogicDeepDive: React.FC = () => {
    return (
        <section className="mb-8 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-400">
            <h3 className="text-purple-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-purple-500/30 pb-1">
                5. Prediktionslogik (The Brain)
            </h3>

            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 text-slate-300 text-sm">
                <p className="mb-4 leading-relaxed">
                    Att vänta för länge skapar latens. Att vänta för kort skapar avbrott. Lösningen är en adaptiv modell som byter strategi.
                </p>

                <div className="space-y-4 mb-4">
                    <div className="bg-slate-950 p-4 rounded border border-slate-800">
                        <strong className="text-purple-300 block mb-2 text-xs uppercase">Steg A: Innan första ljudet (The Guess)</strong>
                        <p className="text-xs text-slate-400 leading-relaxed mb-2">
                            Från att skölden aktiveras tills första RX-paketet kommer, använder vi följande formel:
                        </p>
                        <div className="bg-black/30 p-2 rounded font-mono text-[10px] text-green-400 border border-white/5">
                            Väntetid = (InputLängd * OlinjärFaktor) + FastMarginal
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">
                            <em>Teori:</em> Vi antar att AI:n översätter långa stycken proportionellt snabbare än korta (effektivisering). Vi lägger till en fast marginal för säkerhets skull.
                        </p>
                    </div>
                    
                    <div className="bg-slate-950 p-4 rounded border border-slate-800">
                        <strong className="text-blue-400 block mb-2 text-xs uppercase">Steg B: Efter första ljudet (Confirmed)</strong>
                        <p className="text-xs text-slate-400 leading-relaxed mb-2">
                            När första paketet anländer vet vi att en <code>TurnComplete</code> högst sannolikt är på väg.
                        </p>
                        <ul className="space-y-1 text-xs font-mono text-slate-500">
                            <li>• Strategi: <strong className="text-blue-400">Medelrisk</strong></li>
                            <li>• Handling: Byt till rullande timer. Om TurnComplete uteblir, behöver vi inte vänta lika länge som i Steg A.</li>
                        </ul>
                    </div>

                    <div className="bg-slate-950 p-4 rounded border border-slate-800">
                        <strong className="text-green-400 block mb-2 text-xs uppercase">Steg C: TurnComplete (The Truth)</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Denna signal trumfar allt. Kommer den, faller skölden på millisekunden.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PredictionLogicDeepDive;
