
import { KnowledgeEntry, ModuleDoc } from '../../types';

export const CONFIG_DOC: ModuleDoc = {
    title: 'Konfiguration (Reglage)',
    description: 'De parametrar du kan justera i realtid. Dessa styr hur systemet beter sig.',
    params: [
        { abbr: 'C_THR', full: 'Config Threshold', desc: 'Bruskänslighet för mikrofonen.' },
        { abbr: 'C_SIL', full: 'Config Silence', desc: 'Maximal paustolerans (Taket).' },
        { abbr: 'C_ELA', full: 'Config Elasticity', desc: 'När "Monolog-läget" aktiveras.' },
        { abbr: 'C_LAT', full: 'Config Latency', desc: 'Minsta taltid (Buffertstorlek).' },
        { abbr: 'C_CSL', full: 'Config Cold Start', desc: 'Antal turer i "Safe Mode".' },
        { abbr: 'C_VOL', full: 'Config Volume', desc: 'Digital förstärkning (Gain).' },
        { abbr: 'C_MSD', full: 'Config Min Speech', desc: 'Kortaste ljud som räknas som tal.' },
        { abbr: 'C_TXT', full: 'Transcription State', desc: 'Styr om vi beställer text från servern.' }
    ]
};

export const CONFIG_ENTRIES: Record<string, KnowledgeEntry> = {
    'C_THR': { 
        title: 'VAD Threshold (Känslighet)', 
        text: 'Bestämmer hur högt "ljudtryck" (RMS+Prob) som krävs för att mikrofonen ska öppnas.\n\n• Lågt värde (0.2): Fångar viskningar, men riskerar att fånga fläktbrus.\n• Högt värde (0.8): Kräver tydlig röst, men kan klippa början på meningar.', 
        good: '0.5-0.6', 
        tags:['CONFIG', 'AI'], 
        affects: [{ id: 'THR', desc: 'Sätter nivå' }], 
        affectedBy: [], 
        x: 15, y: 15 
    },
    'C_SIL': { 
        title: 'Max Silence (Taket)', 
        text: 'Det maximala värdet för hur länge vi väntar på tystnad innan vi skickar.\n\nDetta är INTE den aktiva toleransen, utan det tak som "Trull"-läget får gå upp till vid monolog. Vid dialog används alltid BASE_SIL (275ms).', 
        good: '500-1200ms', 
        tags:['CONFIG', 'LOGIC'], 
        affects: [{ id: 'SIL', desc: 'Sätter gräns' }], 
        affectedBy: [], 
        x: 35, y: 55 
    },
    'C_ELA': { 
        title: 'Elasticity Start', 
        text: 'Tidsgränsen (sekunder) för när "Ghost Pressure" aktiveras.\n\nOm du pratar längre än detta värde, anser systemet att du håller en monolog och ökar tystnadstoleransen för att inte avbryta dig vid andningspauser.', 
        good: '3.0s', 
        tags:['CONFIG', 'LOGIC'], 
        affects: [{ id: 'GHOST', desc: 'Triggar' }], 
        affectedBy: [], 
        x: 25, y: 45 
    },
    'C_LAT': { 
        title: 'Min Latency (Turn Duration)', 
        text: 'Minsta mängd ljud (ms) vi måste samla in innan vi ens FÅR skicka det till servern.\n\nEtt högre värde ger stabilare VAD men ökar fördröjningen. Ett lägre värde ger snabbare svar men kan hacka upp meningar.', 
        good: '600ms', 
        tags:['CONFIG', 'NET'], 
        affects: [{ id: 'BUF', desc: 'Gränsvärde' }], 
        affectedBy: [], 
        x: 70, y: 70 
    },
    'C_CSL': { 
        title: 'Cold Start Limit', 
        text: 'Antal turer i början av ett samtal där vi kör "SAFE MODE".\n\nI början har vi ingen data om hur snabb nätverkskopplingen är (RTT). Därför använder vi extra stora säkerhetsmarginaler för Skölden de första 5 turerna.', 
        good: '5 turer', 
        tags:['CONFIG', 'AI'], 
        affects: [{ id: 'CS_M', desc: 'Styr' }], 
        affectedBy: [], 
        x: 80, y: 35 
    },
    'C_VOL': { 
        title: 'Digital Gain (Volume)', 
        text: 'Mjukvaruförstärkning av mikrofonen INNAN den når VAD-analysen.\n\nAnvänds om den fysiska mikrofonen är för svag. OBS: Förstärker även bakgrundsbrus.', 
        good: '1.0x', 
        tags:['CONFIG', 'AUDIO'], 
        affects: [{ id: 'RMS', desc: 'Ökar signal' }], 
        affectedBy: [], 
        x: 10, y: 80 
    },
    'C_MSD': {
        title: 'Min Speech Duration',
        text: 'Kortaste ljudimpuls som räknas som tal.\n\nFiltrerar bort korta klickljud eller enstaka hostningar. Om VAD är aktiv kortare än detta (t.ex. 150ms) kastas ljudet bort.',
        good: '150ms',
        tags: ['CONFIG', 'AI'],
        affects: [{ id: 'SPK', desc: 'Filter' }],
        affectedBy: [],
        x: 25, y: 25
    },
    'C_TXT': {
        title: 'Transcription Toggle',
        text: 'Bestämmer om vi skickar "outputAudioTranscription" i sessions-konfigurationen.\n\n• PÅ: Vi får både ljud och text. Bandbreddskrävande.\n• AV: Vi får enbart ljud. Sparar data och sänker latens marginellt.\n\nÄndring slår igenom vid nästa anslutning.',
        good: 'Valfritt',
        tags: ['CONFIG', 'NET'],
        affects: [{ id: 'RX', desc: 'Datatyp' }],
        affectedBy: [],
        x: 90, y: 10
    }
};
