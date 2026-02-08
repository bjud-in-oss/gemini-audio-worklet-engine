
import { KnowledgeEntry, ModuleDoc } from '../../types';
import { NETWORK_DOC, NETWORK_ENTRIES } from './knowledge/modules/NetworkKnowledge';
import { LOGIC_DOC, LOGIC_ENTRIES } from './knowledge/modules/LogicKnowledge';
import { AUDIO_DOC, AUDIO_ENTRIES } from './knowledge/modules/AudioKnowledge';
import { CONFIG_DOC, CONFIG_ENTRIES } from './knowledge/modules/ConfigKnowledge';

// --- AGGREGATED DOCUMENTATION (For Module Help) ---
export const MODULE_DOCS: Record<string, ModuleDoc> = {
    'MODULE_NETWORK': NETWORK_DOC,
    'MODULE_LOGIC': LOGIC_DOC,
    'MODULE_AUDIO': AUDIO_DOC,
    'MODULE_CONFIG': CONFIG_DOC,
    'MODULE_VAD_DYNAMICS': {
        title: 'VAD Dynamics (Modul 14)',
        description: 'Avancerad logik för hur C_ELA, Q_LOG och C_SIL samverkar för att lösa "Paus-paradoxen".',
        params: []
    },
    'MODULE_PUPPETEER': {
        title: 'Puppeteer Protocol (Modul 37)',
        description: 'Regissören som osynligt styr AI:n med textkommandon för att hantera tystnad och undvika hallucinationer.',
        params: [
            { abbr: 'PUP', full: 'Puppeteer State', desc: 'IDLE, REPEAT, FILLER eller CUT.' },
            { abbr: 'CMD', full: 'Command Injection', desc: 'Osynliga text-instruktioner till modellen.' }
        ]
    }
};

// --- NEW ENTRIES FOR TRI-VELOCITY & PROTOCOLS ---
const PROTOCOL_ENTRIES: Record<string, KnowledgeEntry> = {
    'TAPE': {
        title: 'The Tape Recorder Protocol',
        text: 'Den nya kärnfilosofin. Vi hanterar AI:n som en linjär bandspelare istället för en konversationspartner. Inga upprepningar, ingen "smart" kontextåterhämtning. Bara flöde.',
        good: 'LINEAR',
        tags: ['AI', 'LOGIC'],
        affects: [{ id: 'FLOW', desc: 'Säkrar' }],
        affectedBy: [{ id: 'PRMPT', desc: 'Definieras av' }],
        x: 55, y: 70
    },
    'PRMPT': {
        title: 'Simultaneous Prompt',
        text: 'Den avskalade systeminstruktionen. "NEVER BACKTRACK", "IGNORE GRAMMAR". Tar bort behovet av komplexa text-injektioner.',
        good: 'SIMPLE',
        tags: ['CONFIG', 'AI'],
        affects: [{ id: 'TAPE', desc: 'Styr' }],
        affectedBy: [],
        x: 45, y: 75
    },
    'VEL_PER': {
        title: 'Velocity 1: Persona (Server)',
        text: 'Styr AI:ns attityd. Vid högt tryck (Dam > 5s) byter vi från "Samtal" till "Reporter".\n\n• Reporter-läge: Minskar pauser mellan ord. Högre informationsdensitet. Inte pitch-shift, utan stilbyte.',
        good: 'Dynamic',
        tags: ['AI', 'LOGIC'],
        affects: [{id: 'RX', desc: 'Ökar densitet'}],
        affectedBy: [{id: 'DAM', desc: 'Triggas av'}],
        x: 65, y: 85
    },
    'VEL_WSO': {
        title: 'Velocity 2: WSOLA (Macro)',
        text: 'Den tunga motorn. Tidssträckning (Time-Stretch) utan att ändra tonhöjd.\n\n• 0-2s: 1.0x (Passiv)\n• 2-10s: 1.2x (Aggressiv)\n• >10s: 1.3x (Max)',
        good: 'Buffer < 2s',
        tags: ['AUDIO'],
        affects: [{id: 'SPK', desc: 'Uppspelning'}],
        affectedBy: [{id: 'GAP', desc: 'Styrs av'}],
        x: 75, y: 85
    },
    'VEL_LRP': {
        title: 'Velocity 3: Lerp (Micro)',
        text: 'Finjustering med Pitch-shift. Aktiveras ENDAST i nödläge (>10s buffert).\n\nAtt lägga på 1.01x (1%) pitch gör rösten marginellt "krispigare" och tydligare när den spelas upp snabbt via WSOLA.',
        good: 'OFF (<10s)',
        tags: ['AUDIO'],
        affects: [{id: 'SPK', desc: 'Klarhet'}],
        affectedBy: [{id: 'GAP', desc: 'Triggas >10s'}],
        x: 85, y: 85
    },
    'BUG1': {
        title: 'Shield Puncture (Bugg 40)',
        text: 'Kritiskt logikfel där VAD ignorerade skölden vid tystnad. Fixad genom att köa "TurnComplete"-signalen om SHLD är aktiv.',
        good: 'FIXED',
        tags: ['LOGIC', 'NET'],
        affects: [{id: 'SHLD', desc: 'Respekterar'}],
        affectedBy: [{id: 'VAD', desc: 'Triggas av'}],
        x: 75, y: 25
    },
    'BUG2': {
        title: 'Visual Deception (Bugg 41)',
        text: 'TX-indikatorn visade när vi buffrade, inte när vi sände. Fixad genom att flytta mätpunkten till faktiskt nätverksanrop.',
        good: 'TRUE',
        tags: ['NET'],
        affects: [{id: 'TX', desc: 'Visualiserar'}],
        affectedBy: [],
        x: 85, y: 70
    },
    'BLIND': {
        title: 'The Blind Spot (Modul 46)',
        text: 'Servern är döv i 200-400ms efter TurnComplete. Detta svalde starten på buffrade meningar ("Verse 1"). Fixad med 450ms "Deep Breath" delay.',
        good: '450ms',
        tags: ['NET', 'LOGIC'],
        affects: [{id: 'SHLD', desc: 'Fördröjer öppning'}],
        affectedBy: [{id: 'RX', desc: 'Upptäckt vid'}],
        x: 65, y: 50
    },
    'WAKE': {
        title: 'Wake Up Protocol (Modul 47)',
        text: 'Kallstart av sessionen kan leda till paketförlust. Manuell "väckning" (Handshake) innan långa stycken säkrar anslutningen.',
        good: 'Warm',
        tags: ['AI', 'NET'],
        affects: [{id: 'RTT', desc: 'Kalibrerar'}],
        affectedBy: [],
        x: 95, y: 25
    },
    'DPI': {
        title: 'Dynamic Persona (Modul 48)',
        text: 'Server-side hastighetskontroll. Injicerar "Speak Faster" om Dammen är full. Ersätter aggressiv klient-pitchning.',
        good: 'Rocket',
        tags: ['AI', 'LOGIC'],
        affects: [{id: 'RX', desc: 'Ökar takt'}],
        affectedBy: [{id: 'DAM', desc: 'Mäter'}],
        x: 75, y: 40
    },
    'ECO': {
        title: 'Eco Mode (Modul 49)',
        text: 'Batterisparläge. Om ljudmotorn är tyst i mer än 3 sekunder, försätts AudioContext i suspend-läge för att spara CPU. Väcks omedelbart vid anrop.',
        good: 'SLEEP',
        tags: ['AUDIO'],
        affects: [{id: 'CTX', desc: 'Stänger av'}],
        affectedBy: [{id: 'RMS', desc: 'Mäter tystnad'}],
        x: 5, y: 85
    },
    'VEL': {
        title: 'Hybrid Velocity (Modul 50)',
        text: 'Ljudmotorns hastighetskontroll. Använder WSOLA för att sträcka ut ljud utan pitch-fel vid höga hastigheter (1.2x+).',
        good: '1.30x',
        tags: ['AUDIO'],
        affects: [{id: 'SPK', desc: 'Driver'}],
        affectedBy: [{id: 'GAP', desc: 'Styrd av'}],
        x: 95, y: 90
    }
};

// --- AGGREGATED KNOWLEDGE BASE (For Doctor & Map) ---
export const KNOWLEDGE_BASE: Record<string, KnowledgeEntry> = {
    ...NETWORK_ENTRIES,
    ...LOGIC_ENTRIES,
    ...AUDIO_ENTRIES,
    ...CONFIG_ENTRIES,
    ...PROTOCOL_ENTRIES
};
