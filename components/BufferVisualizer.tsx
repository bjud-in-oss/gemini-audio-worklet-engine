
import React, { useEffect, useRef, useState } from 'react';

interface BufferVisualizerProps {
    getBufferStatus: () => { samples: number; ms: number; speed?: number; active?: boolean };
}

const BufferVisualizer: React.FC<BufferVisualizerProps> = ({ getBufferStatus }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stats, setStats] = useState({ ms: 0, samples: 0, speed: 1.0, active: true });

    useEffect(() => {
        let animationFrameId: number;

        const render = () => {
            const status = getBufferStatus();
            setStats({ 
                ...status, 
                speed: status.speed || 1.0,
                active: status.active !== false // Default true if undefined
            });

            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const width = canvas.width;
                    const height = canvas.height;
                    
                    // Clear
                    ctx.clearRect(0, 0, width, height);
                    
                    // Background
                    ctx.fillStyle = '#0f172a'; // slate-950
                    ctx.fillRect(0, 0, width, height);

                    // SCALE: 0 to 30 Seconds (30000ms)
                    const MAX_SCALE_MS = 30000;

                    // Threshold Lines
                    const drawLine = (ms: number, color: string, alpha: number = 1.0) => {
                        const x = (ms / MAX_SCALE_MS) * width;
                        ctx.beginPath();
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, height);
                        ctx.strokeStyle = color;
                        ctx.globalAlpha = alpha;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                        ctx.globalAlpha = 1.0;
                    };

                    // Markers for 14s and 16s (Transition Zone)
                    drawLine(14000, '#3b82f6', 0.5); // Blue (Start Ramp)
                    drawLine(16000, '#eab308', 0.5); // Yellow (Active Catch-up)
                    drawLine(20000, '#ef4444', 0.8); // Red (The Squeeze / Panic)

                    // The Bar
                    const barWidth = Math.min(width, (status.ms / MAX_SCALE_MS) * width);
                    
                    let color = '#22c55e'; // Green (Healthy < 14s)
                    if (status.ms > 20000) color = '#ef4444'; // Red (> 20s)
                    else if (status.ms > 14000) color = '#eab308'; // Yellow (14s-20s)

                    ctx.fillStyle = color;
                    ctx.fillRect(0, height / 4, barWidth, height / 2);
                    
                    // Glow
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = color;
                    ctx.fillRect(0, height / 4, barWidth, height / 2);
                    ctx.shadowBlur = 0;
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, [getBufferStatus]);

    return (
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 space-y-3">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                    <span>Engine Intelligence (30s Window)</span>
                    {/* ECO MODE INDICATOR */}
                    <div className={`w-1.5 h-1.5 rounded-full ${stats.active ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]' : 'bg-slate-600 border border-slate-500'}`} title={stats.active ? 'Active' : 'Sleeping (Eco Mode)'}></div>
                </div>
                <span className={stats.speed > 1.01 ? 'text-orange-400' : 'text-green-400'}>
                    V: {stats.speed.toFixed(3)}x
                </span>
            </div>

            {/* Hastighetsmätare (Gaspedalen) */}
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-orange-500 transition-all duration-100"
                    style={{ width: `${((stats.speed - 1.0) / 0.30) * 100}%` }}
                ></div>
            </div>

            {/* Buffert-Canvas */}
            <div className={`relative h-8 w-full rounded overflow-hidden border transition-colors duration-500 ${stats.active ? 'border-slate-800' : 'border-slate-800 opacity-50 grayscale'}`}>
                <canvas ref={canvasRef} width={300} height={32} className="w-full h-full" />
                
                {/* Labels overlay */}
                <div className="absolute top-0 left-[46%] h-full border-l border-blue-500/30 text-[8px] text-blue-400 pl-1 pt-0.5">14s</div>
                <div className="absolute top-0 left-[66%] h-full border-l border-red-500/30 text-[8px] text-red-500 pl-1 pt-0.5">20s</div>
                
                {!stats.active && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-[9px] text-slate-400 font-mono tracking-widest">
                        SLEEPING
                    </div>
                )}
            </div>
            
            <div className="flex justify-between text-[9px] text-slate-500 italic">
                <span>{(stats.ms / 1000).toFixed(1)}s Latens</span>
                <span>{stats.speed > 1.02 ? 'WSOLA + LERP' : (stats.speed > 1.0 ? 'Soft LERP' : 'Bit-Perfect')}</span>
            </div>
        </div>
    );
};

export default BufferVisualizer;
