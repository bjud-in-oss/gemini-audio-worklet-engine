
import React from 'react';

const BargeInDeepDive: React.FC = () => {
    return (
        <section className="mb-8 animate-in fade-in slide-in-from-bottom-5 duration-500 delay-300">
            <h3 className="text-yellow-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-yellow-500/30 pb-1">
                4. Barge-In Skydd: "The Shield"
            </h3>

            <div className="space-y-6 text-slate-300 font-sans text-sm leading-relaxed bg-slate-900/50 p-5 rounded-xl border border-slate-800">
                
                {/* DEFINITIONER */}
                <div>
                    <h4 className="text-white font-bold mb-2">Huvudproblemet: Halv-Duplex Beteende</h4>
                    <p className="mb-3 text-slate-400">
                        Gemini Live beter sig som en walkie-talkie. Om vi sänder ljud (TX) medan den pratar (RX), tystnar den omedelbart för att lyssna ("Barge-in"). 
                        Vi måste skydda AI:n från att höra oss medan den pratar eller tänker.
                    </p>
                </div>

                {/* LOGIC PHASES */}
                <div className="space-y-6 relative pl-4 border-l-2 border-slate-700 ml-2 mt-4">
                    
                    {/* FAS 1 */}
                    <div className="relative">
                        <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        <h5 className="font-bold text-white mb-1 text-sm">Fas 1: Prediktiv Sköld (Olinjär Gissning)</h5>
                        <p className="text-slate-400 text-xs">
                            När VAD upptäcker tystnad aktiveras skölden. Tiden beräknas olinjärt baserat på längden på ditt tal + en fast säkerhetsmarginal. 
                            <br/><em>Logik:</em> Vi vet inte OM den svarar, så vi tar höjd. AI:n genererar långa texter snabbare per ord än korta (uppstartskostnad minskar relativt).
                        </p>
                    </div>

                    {/* FAS 2 */}
                    <div className="relative">
                        <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        <h5 className="font-bold text-white mb-1 text-sm">Fas 2: Rullande Fönster (Medelrisk)</h5>
                        <p className="text-slate-400 text-xs">
                            SÅ FORT vi tar emot det <strong>första</strong> datapaketet (RX) från AI:n, vet vi att förbindelsen lever. 
                            Vi kastar då bort gissningen från Fas 1 och använder en kortare, rullande timer som förlängs för varje nytt paket som kommer.
                        </p>
                    </div>

                    {/* FAS 3 */}
                    <div className="relative">
                        <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                        <h5 className="font-bold text-white mb-1 text-sm">Fas 3: TurnComplete (Absolut)</h5>
                        <p className="text-slate-400 text-xs">
                            Om signalen <code>TurnComplete</code> anländer, öppnas skölden <strong>omedelbart</strong>, oavsett vad timers säger. 
                            Detta är den ultimata sanningen som nollställer systemet.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default BargeInDeepDive;
