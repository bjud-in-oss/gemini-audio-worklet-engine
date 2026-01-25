
import React from 'react';

const TheBlinkAnalysis: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-400">
            <h3 className="text-orange-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-orange-500/30 pb-1 flex items-center gap-2">
                19. Diagnos: "The Stutter" (Varför det hackade)
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-orange-500/20 text-slate-300 text-sm space-y-6">
                
                <p className="text-sm text-slate-400 leading-relaxed">
                    Tidigare upplevde vi att texten "hackade till" eller startade om sin animation varje gång AI:n skickade ett nytt ord. Här är varför.
                </p>

                {/* THE RE-MOUNT ISSUE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-950/30 p-4 rounded border border-red-500/20">
                        <strong className="text-red-400 text-xs uppercase block mb-1">Förr: Omstart vid varje bokstav</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            När texten uppdaterades (t.ex. från "Hej" till "Hej på"), trodde React att det var en helt ny mening. 
                            Den raderade "Hej" och skrev ut "Hej på" från noll. Animationen startade om från 0 sekunder, vilket syntes som ett "blixtrande" eller hack.
                        </p>
                    </div>

                    <div className="bg-green-950/30 p-4 rounded border border-green-500/20">
                        <strong className="text-green-400 text-xs uppercase block mb-1">Nu: "Ratchet"-mekanism</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Vi använder nu en "spärrhake" (Ratchet) i koden.
                            Vi minns vilket ord vi senast tände. Även om meningen blir längre, får animationen <strong>aldrig gå bakåt</strong>. 
                            Vi uppdaterar bara de <em>nya</em> orden i slutet av meningen. De gamla orden förblir tända (Active).
                        </p>
                    </div>
                </div>

                <div className="bg-slate-950/50 p-3 rounded border border-orange-500/30 mt-2">
                    <strong className="text-orange-300 text-xs block mb-1">Teknisk lösning:</strong>
                    <p className="text-xs text-slate-400">
                        Genom att separera <code>text</code>-datat från <code>animation</code>-logiken (se Modul 20) kan vi uppdatera texten tusentals gånger utan att störa den visuella tidslinjen.
                    </p>
                </div>

                {/* DEV SPECS */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <strong className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">Technical Implementation Specs</strong>
                    <div className="bg-black/30 p-2 rounded text-[10px] font-mono text-slate-400 space-y-1">
                        <p>• <strong>Variable:</strong> <code>maxReachedIndexRef</code> (useRef).</p>
                        <p>• <strong>Logic:</strong> <code>if (newIndex &gt; maxReachedIndexRef.current) maxReachedIndexRef.current = newIndex;</code></p>
                        <p>• <strong>Reset:</strong> Nollställs <strong>endast</strong> när <code>timing.groupId</code> ändras (ny mening).</p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default TheBlinkAnalysis;
