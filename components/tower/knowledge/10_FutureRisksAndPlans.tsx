
import React from 'react';

const FutureRisksAndPlans: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-900">
            <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-emerald-500/30 pb-1 flex items-center gap-2">
                10. Arkitektur: MessagePort & Buffert-tak
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-emerald-500/20 text-slate-300 text-sm space-y-8">
                
                {/* 1. SUCCESS STORY */}
                <div>
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-xs">IMPLEMENTERAT (v7.0)</span>
                        MessagePort Audio Engine
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed mb-3">
                        Ljudmotorn är nu frikopplad från UI-tråden och använder <strong>AudioWorklet</strong> med <code>postMessage</code> (Zero-Copy Transfer).
                        <br/>
                        Detta har möjliggjort en halvering av buffertstorleken från 4096 till <strong>2048 samples</strong>, vilket ger en latensförbättring på 128ms utan att riskera "klickljud" vid tung grafik.
                    </p>
                </div>

                {/* 2. BUFFER CAP IMPLEMENTATION - UPDATED STATUS */}
                <div>
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-xs">IMPLEMENTERAT (v8.0)</span>
                        Buffert-tak (800 Paket)
                    </h4>
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                        <strong className="text-blue-400 text-xs uppercase block">Problemet: Ketchup-effekten</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Vid nätavbrott fortsätter vi spela in. Om avbrottet varar i 5 minuter, skulle vi vid återanslutning skicka 5 minuter ljud på en sekund. 
                            Detta överbelastar både servern och vår logik.
                        </p>
                        <div className="h-px bg-slate-800 my-2"></div>
                        <strong className="text-green-400 text-xs uppercase block">Lösning (Aktiv i kod): FIFO med Tak</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Systemet har nu en hårdkodad spärr i <code>useGeminiLive.ts</code>.
                            <br/>
                            <code>const MAX_BUFFER_PACKETS = 800;</code>
                            <br/>
                            Om bufferten överstiger detta (ca 100 sekunder), raderas automatiskt det <em>äldsta</em> paketet ("FIFO-shift"). Detta är nu en aktiv skyddsmekanism som förhindrar server-krasch vid långa avbrott.
                        </p>
                    </div>
                </div>

                {/* 3. REMAINING RISKS */}
                <div>
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                        <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-xs">STATUS: LIVE</span>
                        Kvarstående Utmaningar
                    </h4>
                    <div className="bg-red-950/30 border border-red-500/10 p-4 rounded">
                        <strong className="text-red-400 text-xs uppercase block mb-1">Monolog-timeout (20 min)</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Google har en hård gräns. Om ljud streamas i 20 minuter <em>utan en enda tystnad på 500ms</em>, klipper de anslutningen. VAD-systemet (The Squeeze) försöker motverka detta, men teoretiskt kan en extremt snabb talare trigga detta.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default FutureRisksAndPlans;
