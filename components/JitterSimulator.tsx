
import React from 'react';

interface JitterSimulatorProps {
    isEnabled: boolean;
    setIsEnabled: (enabled: boolean) => void;
    jitterIntensity?: number;
    setJitterIntensity?: (val: number) => void;
}

const JitterSimulator: React.FC<JitterSimulatorProps> = ({ 
    isEnabled, 
    setIsEnabled,
    jitterIntensity = 200,
    setJitterIntensity
}) => {
    return (
        <div className={`p-3 rounded-xl border transition-all duration-300 ${isEnabled ? 'bg-orange-900/20 border-orange-500/50' : 'bg-slate-900/50 border-slate-800'}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-orange-500 animate-pulse' : 'bg-slate-600'}`}></div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${isEnabled ? 'text-orange-400' : 'text-slate-500'}`}>
                        Jitter Simulator
                    </h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={isEnabled}
                        onChange={(e) => setIsEnabled(e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
            </div>
            
            {isEnabled && setJitterIntensity && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-300 mb-2">
                    <div className="flex justify-between text-[9px] text-slate-400">
                        <span>MAX JITTER</span>
                        <span>{jitterIntensity}ms</span>
                    </div>
                    <input 
                        type="range" min="50" max="1000" step="50"
                        value={jitterIntensity}
                        onChange={(e) => setJitterIntensity(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-orange-900/50 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                </div>
            )}
            
            <p className="text-[10px] text-slate-400 leading-relaxed">
                Stressa motorn med 0-{jitterIntensity}ms slumpmässig fördröjning per paket.
            </p>
        </div>
    );
};

export default JitterSimulator;
