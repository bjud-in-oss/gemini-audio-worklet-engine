
import React, { useEffect, useRef, useState } from 'react';

interface BufferVisualizerProps {
    getBufferStatus: () => { samples: number; ms: number };
}

const BufferVisualizer: React.FC<BufferVisualizerProps> = ({ getBufferStatus }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stats, setStats] = useState({ ms: 0, samples: 0 });

    useEffect(() => {
        let animationFrameId: number;

        const render = () => {
            const status = getBufferStatus();
            setStats(status);

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

                    // Threshold Lines
                    const drawLine = (ms: number, color: string) => {
                        const x = (ms / 500) * width; // 500ms max scale
                        ctx.beginPath();
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, height);
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    };

                    drawLine(50, '#ef4444'); // Red zone limit (50ms)
                    drawLine(250, '#eab308'); // Yellow zone limit (250ms)

                    // The Bar
                    const barWidth = Math.min(width, (status.ms / 500) * width);
                    
                    let color = '#22c55e'; // Green
                    if (status.ms < 50) color = '#ef4444'; // Red (Starvation)
                    else if (status.ms > 250) color = '#eab308'; // Yellow (Catch-up)

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
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <span>Ring Buffer (Worklet)</span>
                <span className={stats.ms < 50 ? 'text-red-400 animate-pulse' : 'text-green-400'}>
                    {stats.ms.toFixed(1)}ms / {stats.samples} spl
                </span>
            </div>
            <div className="relative h-8 w-full rounded overflow-hidden border border-slate-800">
                <canvas ref={canvasRef} width={300} height={32} className="w-full h-full" />
                
                {/* Labels overlay */}
                <div className="absolute top-0 left-[10%] h-full border-l border-red-500/20 text-[8px] text-red-500 pl-1 pt-0.5">50ms</div>
                <div className="absolute top-0 left-[50%] h-full border-l border-yellow-500/20 text-[8px] text-yellow-500 pl-1 pt-0.5">250ms</div>
            </div>
            <p className="text-[9px] text-slate-500 italic">
                Visar fysisk fyllnadsgrad i SharedArrayBuffer. <br/>
                <span className="text-yellow-500">Gul:</span> Elasticity (Speed Up). <span className="text-red-500">Röd:</span> Anti-Click (Ramp Down).
            </p>
        </div>
    );
};

export default BufferVisualizer;
