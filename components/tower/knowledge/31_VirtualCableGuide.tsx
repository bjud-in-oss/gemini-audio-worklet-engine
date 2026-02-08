
import React from 'react';

const VirtualCableGuide: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-3 border-b border-white/20 pb-1 flex items-center gap-2">
                <span className="bg-white text-black px-2 rounded text-xs">MODUL 31</span>
                Guide: Kablage & Native Bridge Strategy
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-white/10 text-slate-300 text-sm space-y-8">
                
                {/* 1. CONCEPT */}
                <div className="space-y-4">
                    <h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest border-l-4 border-amber-500 pl-3">Webbens Begränsning: "The Split"</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Webbläsare är isolerade (Sandboxed). De kan inte "höra" vad som kommer ur dina högtalare. 
                        Därför måste vi använda <strong>Virtuella Kablar</strong> för att lura webbläsaren att tro att datorljudet är en mikrofon.
                    </p>
                    <div className="bg-amber-900/20 p-3 rounded border border-amber-500/30 text-center">
                        <strong className="text-amber-300 text-xs block mb-1">NACKDELEN</strong>
                        <span className="text-[10px] text-slate-400">När du skickar ljudet till Kabeln, tystnar dina högtalare. Du måste manuellt aktivera "Medhörning" i Windows/Mac, vilket är krångligt.</span>
                    </div>
                </div>

                {/* 2. THE ASIO PROBLEM */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-red-500 pl-3">Problemet med ASIO</h4>
                    
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3">
                        <strong className="text-red-300 text-xs block">"Varför ser inte webben mitt ASIO-ljud?"</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Många proffsljudkort (och Dante/Zoom Rooms) använder ASIO-drivrutiner för låg latens. 
                            <strong>Chrome/Edge stöder INTE ASIO.</strong> De ser bara standard Windows Audio (WASAPI).
                        </p>
                        <ul className="list-disc list-inside text-[10px] text-slate-500 ml-2">
                            <li>Om Zoom skickar ljud via ASIO → Webben är döv.</li>
                            <li>Om du använder VB-Cable (WDM) → Du tappar ASIO-prestandan i Zoom.</li>
                        </ul>
                    </div>
                </div>

                {/* 3. THE NATIVE APP SOLUTION */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-green-500 pl-3">Framtiden: C++ Native App</h4>
                    
                    <div className="bg-green-900/10 p-4 rounded border border-green-500/20 space-y-3">
                        <p className="text-xs text-slate-300">
                            En installerad app (C++/Rust/Electron) löser både "Speakerphone"-problemet och ASIO-problemet genom tekniken <strong>Loopback Capture</strong>.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="bg-slate-900 p-2 rounded border border-slate-700">
                                <strong className="text-red-400 text-[10px] block mb-1">Webb (Nu)</strong>
                                <p className="text-[9px] text-slate-500">
                                    Zoom → Kabel → App.<br/>
                                    Du hör inget (utan krångel).
                                </p>
                            </div>
                            <div className="bg-slate-900 p-2 rounded border border-green-500/50">
                                <strong className="text-green-400 text-[10px] block mb-1">Native App (Framtid)</strong>
                                <p className="text-[9px] text-slate-500">
                                    Zoom → Högtalare (Du hör).<br/>
                                    Appen → "Tjuvlyssnar" på högtalaren (WASAPI Loopback).
                                </p>
                            </div>
                        </div>
                        
                        <p className="text-[10px] text-green-300 italic mt-2 border-t border-green-500/20 pt-2">
                            <strong>Slutsats:</strong> För slutanvändare hemma är en Native App överlägsen eftersom den inte kräver någon konfiguration. "Det bara funkar".
                        </p>
                    </div>
                </div>

                {/* 4. CURRENT WORKAROUNDS */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center">
                        <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-purple-500 pl-3">Setup: Mac (BlackHole)</h4>
                        <span className="text-[9px] bg-purple-900/30 text-purple-200 px-2 py-0.5 rounded">Nuvarande Lösning</span>
                    </div>
                    
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                        <ol className="list-decimal list-inside text-xs text-slate-400 space-y-2">
                            <li>Installera <strong>BlackHole 2ch</strong>.</li>
                            <li>Öppna "Audio MIDI Setup". Skapa <strong>Multi-Output Device</strong>.</li>
                            <li>Kryssa i BÅDE dina hörlurar och BlackHole.</li>
                            <li>Välj Multi-Output som högtalare i Zoom.</li>
                            <li>Välj BlackHole som mikrofon i denna Web-app.</li>
                        </ol>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center">
                        <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-blue-500 pl-3">Setup: PC (VB-Cable)</h4>
                        <span className="text-[9px] bg-blue-900/30 text-blue-200 px-2 py-0.5 rounded">Nuvarande Lösning</span>
                    </div>
                    
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                        <ol className="list-decimal list-inside text-xs text-slate-400 space-y-2">
                            <li>Installera <strong>VB-Cable</strong>.</li>
                            <li>I Zoom: Välj "CABLE Input" som högtalare. (Ljudet tystnar för dig).</li>
                            <li>I Windows Ljudinställningar → Inspelning → CABLE Output → Egenskaper → Lyssna.</li>
                            <li>Kryssa i <strong>"Lyssna på den här enheten"</strong> och välj dina riktiga högtalare.</li>
                            <li>I Appen: Välj "CABLE Output" som input.</li>
                        </ol>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default VirtualCableGuide;
