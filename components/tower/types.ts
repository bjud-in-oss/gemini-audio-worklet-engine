
export interface DiagnosticData {
    // Audio Layer
    rms: number;           
    framesProcessed: number; 
    audioContextState: string; 
    sampleRate: number; 
    audioContextTime: number; 

    // Logic Layer
    vadProb: number;       
    vadThreshold: number;  
    isSpeaking: boolean;   
    isBuffering: boolean;  
    bufferSize: number;    
    activeMode: string;
    bufferGap: number;
    silenceDuration: number; 
    currentLatency: number; 
    
    // NEW METRICS
    rtt: number;           // Network Round Trip Time (ms)
    rttAge?: number;       // Time since last RTT update
    volMultiplier: number; // Software Input Gain
    silenceThreshold: number; // The CONFIG value
    currentSilenceThreshold: number; // NEW: The DYNAMIC value (The Squeeze)
    busyRemaining: number;
    queueLength: number;
    outQueue: number;      // NEW: Added missing property
    autoSleepCountdown: number;

    // GHOST METRICS
    ghostActive: boolean; // Is "Ghost Pressure" (Momentum) currently active?

    // PUPPETEER METRICS
    puppeteerState: string; // 'IDLE' | 'REPEAT' | 'FILLER' | 'CUT'

    // SHIELD METRICS (The Dam)
    shieldActive: boolean; // Is the shield currently blocking TX?
    shieldSize: number;    // How many packets are held in the dam?

    // COLD START METRICS
    isColdStart: boolean;
    coldStartLimit: number;

    // MODEL INTERNALS (NEW for visualization)
    modelProcessingRate: number;
    modelFixedOverhead: number;
    modelSafetyMargin: number;

    // DEBUGGING DEEP DIVE
    connectingBufferSize: number; 
    inFlightCount: number;        
    timeSinceLastSpeech: number;  
    avgVadProb: number; 

    // Network Layer
    networkEvent: 'idle' | 'normal' | 'flush'; 
    serverRx: boolean;
    wsState: string; 

    // Hardware Diagnostics
    trackReadyState: string;
    trackMuted: boolean;
}

export type HighlightType = 'self' | 'incoming' | 'outgoing' | null;

export interface LayerProps {
    // A callback to trigger the "Knowledge Base" popup in the parent
    onExplain: (key: string) => void;
    // Callback to show module-level help
    onHelp: (moduleKey: string) => void;
    // Callback to close the module
    onClose: () => void;
    
    // VISUAL TRACING
    highlightMap?: Record<string, HighlightType>;
}

// NEW: Knowledge Base Types
export interface Relation {
    id: string;
    desc: string; // Description of HOW it affects/is affected
}

export interface KnowledgeEntry {
    title: string;
    text: string;
    good: string;
    tags?: string[]; // NEW: Tags for Phases (P1, P2, P3, P4) and Logic (Pred)
    affects: Relation[];     // Outgoing (Yellow)
    affectedBy: Relation[];  // Incoming (Blue)
    
    // GRAPH COORDINATES (0-100 grid)
    x?: number;
    y?: number;
}

export interface ModuleDoc {
    title: string;
    description: string;
    params: { abbr: string; full: string; desc: string }[];
}
