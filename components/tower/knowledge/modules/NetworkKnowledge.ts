
import { KnowledgeEntry, ModuleDoc } from '../../types';

export const NETWORK_DOC: ModuleDoc = {
    title: 'Nätverksmodul (Connection)',
    description: 'Hanterar den fysiska kopplingen mot Googles servrar. Här ser du om "sladden sitter i" och om data flödar.',
    params: [
        { abbr: 'WS', full: 'WebSocket', desc: 'Den öppna tunneln mot Google (Gemini Realtime API).' },
        { abbr: 'KEY', full: 'API Key', desc: 'Autentisering. Måste vara en giltig Google Cloud API-nyckel.' },
        { abbr: 'TX', full: 'Transmit', desc: 'Utgående data (Ljud). Blockeras fysiskt om SHLD är aktiv.' },
        { abbr: 'RX', full: 'Receive', desc: 'Inkommande data (Ljud & Text). Nollställer BSY-timern.' }
    ]
};

export const NETWORK_ENTRIES: Record<string, KnowledgeEntry> = {
    'WS': { 
        title: 'WebSocket State', 
        text: 'Status för TCP-anslutningen.\n\n• CONNECTING: Handskakning pågår.\n• OPEN: Redo för trafik.\n• CLOSED: Ingen koppling (eller "Standby").\n\nOm denna blinkar gult/rött ofta har du ett instabilt nätverk.', 
        good: 'OPEN', 
        tags:['NET'], 
        affects: [{ id: 'TX', desc: 'Möjliggör' }], 
        affectedBy: [{id: 'KEY', desc: 'Kräver'}], 
        x: 75, y: 10 
    },
    'KEY': { 
        title: 'API Key Authorization', 
        text: 'Din nyckel till molnet. Utan denna (eller om den är ogiltig/slut på kvota) kopplas WS ner omedelbart med felkod 403.', 
        good: 'OK', 
        tags:['NET'], 
        affects: [{ id: 'WS', desc: 'Öppnar' }], 
        affectedBy: [], 
        x: 65, y: 5 
    },
    
    'TX': { 
        title: 'Transmit (Sändare)', 
        text: 'Applikationens "Mun". Skickar PCM-ljud till molnet.\n\nVIKTIGT: Sändaren styrs av "The Shield" (SHLD). Om skölden är uppe (Röd), skickas INGET ljud härifrån, utan det styrs om till DAM (Dammen). När skölden faller, skickas allt i DAM som en "Burst" via TX.', 
        good: 'Blink', 
        tags:['NET'], 
        affects: [{id: 'INF', desc: 'Ökar kön'}, {id: 'WS', desc: 'Trafik'}], 
        affectedBy: [{ id: 'DAM', desc: 'Matar data' }, { id: 'SHLD', desc: 'Blockerar' }], 
        x: 75, y: 60 
    },
    
    'RX': { 
        title: 'Receive (Mottagare)', 
        text: 'Applikationens "Öra". Tar emot data från molnet.\n\nFUNKTIONER:\n1. Audio: Matar GAP (Jitter Buffer).\n2. Text: Visas direkt på skärmen.\n3. TurnComplete: Signalen "Jag är klar". Detta dödar omedelbart BSY-timern och fäller ner SHLD, vilket tillåter oss att sända igen.', 
        good: 'Blink', 
        tags:['NET'], 
        affects: [{ id: 'GAP', desc: 'Fyller buffert' }, {id: 'BSY', desc: 'Dödar timer'}], 
        affectedBy: [{ id: 'WS', desc: 'Kanal' }, {id: 'RTT', desc: 'Mäts via'}], 
        x: 85, y: 60 
    },
    
    'INF': { 
        title: 'In Flight (Köstockning)', 
        text: 'Antal ljud-turer som vi skickat (TX) men som servern ännu inte kvitterat/besvarat.\n\nDIAGNOS:\n• 0: Tomgång.\n• 1-2: Normal dialog.\n• >5: Varning! Nätverket hinner inte med eller servern har hängt sig. Triggar "Watchdog" som startar om kön.', 
        good: '0-2', 
        tags:['NET'], 
        affects: [{id: 'BSY', desc: 'Förlänger'}], 
        affectedBy: [{id: 'TX', desc: '+1'}, {id: 'RX', desc: '-1'}], 
        x: 80, y: 30 
    },
    'RTT': { 
        title: 'Round Trip Time (Respons)', 
        text: 'Tiden (ms) från att vi slutar prata tills vi hör det FÖRSTA ljudet från AI:n.\n\nDetta värde används för att träna den adaptiva modellen. Om RTT är högt, ökar systemet automatiskt sin BSY-timer för att ge AI:n mer tid i framtiden.', 
        good: '<500ms', 
        tags:['NET'], 
        affects: [{id: 'BSY', desc: 'Tränar modell'}], 
        affectedBy: [{id: 'WS', desc: 'Latens'}],
        x: 85, y: 40 
    },
    'BURST': {
        title: 'Silence Burst (Pacifier)',
        text: 'En specialsignal (800ms av nollor) som skickas precis innan vi signalerar "End Turn".\n\nSyftet är att rensa serverns inre buffertar och tvinga ner dess VAD-nivå. Utan denna kan servern tro att bruset från din mikrofon är fortsättningen på din mening.',
        good: 'Auto',
        tags: ['NET'],
        affects: [{id: 'TX', desc: 'Sänds via'}],
        affectedBy: [{id: 'SPK', desc: 'Triggas av'}],
        x: 55, y: 70
    }
};
