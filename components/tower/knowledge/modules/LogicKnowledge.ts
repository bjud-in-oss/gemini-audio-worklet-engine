
import { KnowledgeEntry, ModuleDoc } from '../../types';

export const LOGIC_DOC: ModuleDoc = {
    title: 'Logikmodul (The Brain)',
    description: 'Beslutsfattaren. Hanterar VAD, tystnad och "Skölden" som skyddar mot avbrott.',
    params: [
        { abbr: 'VAD', full: 'Voice Probability', desc: 'Sannolikhet (0-100%) att ljudet är tal.' },
        { abbr: 'THR', full: 'Active Threshold', desc: 'Gränsen för när VAD anser att det är tal.' },
        { abbr: 'SPK', full: 'Speaking State', desc: 'JA/NEJ. Är användaren aktiv?' },
        { abbr: 'SIL', full: 'Active Silence Limit', desc: 'Den dynamiska gränsen för tystnad (påverkas av TTT).' },
        { abbr: 'GHOST', full: 'Ghost Pressure', desc: 'Är användaren i "Monolog-läge" (Momentum)?' },
        { abbr: 'SQZ', full: 'The Squeeze', desc: 'Tidsbaserad nöd-sänkning av SIL.' },
        { abbr: 'SHLD', full: 'The Shield', desc: 'Blockerar sändning när AI tänker/talar.' },
        { abbr: 'DAM', full: 'Dam Pressure', desc: 'Mängd ljud i utgående kö (påverkar TTT).' },
        { abbr: 'JIT', full: 'Jitter Pressure', desc: 'Mängd ljud i inkommande kö (påverkar TTT).' },
        { abbr: 'BSY', full: 'Busy Timer', desc: 'Nedräkning för skölden.' },
        { abbr: 'BASE', full: 'Base Silence', desc: 'Grundvärdet (275ms) för snabb dialog.' },
        { abbr: 'Q_LN', full: 'Logic Queue', desc: 'Antal logiska turer i kö.' },
        { abbr: 'CS_M', full: 'Cold Start Mode', desc: 'SAFE eller ADAPTIVE läge.' }
    ]
};

export const LOGIC_ENTRIES: Record<string, KnowledgeEntry> = {
    'SHLD': {
        title: 'The Shield (Barge-in Skydd)',
        text: 'Systemets viktigaste försvarsmekanism. När skölden är LÅST (Röd) är sändaren (TX) fysiskt bortkopplad från nätverket.\n\nLOGIK:\n• Aktiveras vid: Användaren slutar prata ("Turn Complete").\n• Faller vid: AI skickar "Turn Complete" ELLER Busy-timern löper ut.',
        good: 'ÖPPEN',
        tags: ['LOGIC'],
        affects: [{id: 'DAM', desc: 'Stänger porten'}, {id: 'TX', desc: 'Blockerar'}],
        affectedBy: [{id: 'BSY', desc: 'Styrs av'}, {id: 'RX', desc: 'Förlänger'}],
        x: 65, y: 30
    },
    'DAM': {
        title: 'The Dam (Nätverksbuffert)',
        text: 'Kön för **färdiga paket** (Base64) som väntar på att skickas. Detta är INTE samma sak som BUF.\n\nOm Skölden är uppe, samlas dina ord här ("Däms upp"). Så fort Skölden faller, spolas hela Dammen iväg till Google som en "Burst".',
        good: '0',
        tags: ['NET'],
        affects: [{id: 'SIL', desc: 'Ökar (Double)'}, {id: 'SQZ', desc: 'Startar'}],
        affectedBy: [{id: 'SHLD', desc: 'Fylls om låst'}],
        x: 75, y: 30
    },
    'JIT': { // Mappas till GAP i visualiseringen
        title: 'Jitter Pressure (Inkommande Tryck)',
        text: 'Mängden ljud som AI:n har skickat men som vi inte spelat upp än.\n\nROLL I TTT: Om DAM är tom men JIT > 0, betyder det att användaren är tyst men lyssnar på AI:n. Detta triggar en HALVERING av tystnadstoleransen ("Mjuklandning") istället för en total återställning.',
        good: '>0 vid tal',
        tags: ['NET'],
        affects: [{id: 'SIL', desc: 'Minskar (Halve)'}],
        affectedBy: [{id: 'RX', desc: 'Fyller'}],
        x: 85, y: 80
    },
    'BSY': { 
        title: 'Busy Prediction (Timer)', 
        text: 'En nedräkning som styr Skölden.\n\nTVÅ FASER:\n1. Prediktion: Innan AI svarat, gissar vi hur lång tid den behöver (Olinjär).\n2. Rolling Window: När AI börjar svara (RX), håller skölden uppe 2 sekunder framåt för varje nytt paket.', 
        good: '0ms', 
        tags:['AI'], 
        affects: [{ id: 'SHLD', desc: 'Aktiverar' }], 
        affectedBy: [{ id: 'RTT', desc: 'Träningsdata' }, { id: 'RX', desc: 'Förlänger' }], 
        x: 55, y: 40 
    },
    'SQZ': {
        title: 'The Squeeze (Tvingande Avslut)',
        text: 'Aktiv mellan 20s och 30s taltid.\n\nFungerar som en "tratt". Vi börjar med den tolerans som sattes av TTT. Efter 20s minskar vi den linjärt ner till 100ms vid 25s. Detta ger 5 sekunders "Andrum" (Gap) där toleransen är minimal för att garantera ett avbrott.',
        good: '>200ms',
        tags: ['LOGIC'],
        affects: [{id: 'SPK', desc: 'Avbryter'}],
        affectedBy: [{id: 'DAM', desc: 'Startnivå'}, {id: 'SIL', desc: 'Jämförs mot'}],
        x: 45, y: 35
    },
    'VAD': { 
        title: 'Neural VAD (Silero)', 
        text: 'Sannolikheten att nuvarande ljudbuffert innehåller tal. 0.0 = Tystnad, 1.0 = Tydligt tal. Jämförs mot THR.', 
        good: '> THR', 
        tags: ['AI'],
        affects: [{ id: 'SPK', desc: 'Trigger' }],
        affectedBy: [{ id: 'RMS', desc: 'Energi' }],
        x: 35, y: 10
    },
    'THR': { 
        title: 'Active Threshold', 
        text: 'Gränsen för VAD. Ligger normalt på C_THR, men kan sänkas dynamiskt (Hysteres) för att "hålla kvar" en påbörjad mening.', 
        good: 'Dynamisk', 
        tags: ['AI'],
        affects: [{ id: 'SPK', desc: 'Beslut' }],
        affectedBy: [{ id: 'C_THR', desc: 'Grundvärde' }],
        x: 25, y: 15
    },
    'SPK': { 
        title: 'Speaking State', 
        text: 'Systemets slutsats: Pratar någon just nu? Styr om vi ska spela in eller vänta.', 
        good: 'JA/NEJ', 
        tags: ['LOGIC'],
        affects: [{ id: 'SIL', desc: 'Nollställer' }, { id: 'BUF', desc: 'Fyller' }],
        affectedBy: [{ id: 'VAD', desc: 'Input' }, { id: 'SQZ', desc: 'Tvingar NEJ' }],
        x: 45, y: 20
    },
    'SIL': { 
        title: 'Silence Timer', 
        text: 'Tid i tystnad. Om denna överstiger den aktiva toleransen (som styrs av TTT + Squeeze), anser vi att turen är klar och aktiverar Skölden.', 
        good: 'Låg', 
        tags: ['LOGIC'],
        affects: [{ id: 'BSY', desc: 'Startar' }],
        affectedBy: [{ id: 'SPK', desc: 'Reset' }],
        x: 45, y: 50
    },
    'GAP': { 
        title: 'Jitter Buffer Gap', 
        text: 'Buffert för inkommande ljud. Används som indikator för "JITTER_PRESSURE" i TTT-logiken.', 
        good: '~0.25s', 
        tags: ['NET'],
        affects: [{ id: 'JIT', desc: 'Indikerar' }],
        affectedBy: [{ id: 'RX', desc: 'Fyller' }],
        x: 85, y: 80
    },
    'BUF': { 
        title: 'Fysisk Ljudbuffert (PCM)', 
        text: 'Kön för **rådata** (Samples). Här samlas millisekunder av ljud *innan* det ens blivit ett paket. När BUF blir full (enligt C_MSD), paketeras det och flyttas till DAM (eller sänds direkt).', 
        good: '0', 
        tags: ['NET'],
        affects: [{ id: 'TX', desc: 'Ger data' }],
        affectedBy: [{ id: 'SPK', desc: 'Skapar' }],
        x: 60, y: 60
    },
    'Q_LN': { 
        title: 'Logical Queue', 
        text: 'Antal "turer" som systemet anser pågår. (Mindre kritisk i hydraulisk modell men bra för diagnos).', 
        good: '<3', 
        tags:['LOGIC'], 
        affects: [], 
        affectedBy: [], 
        x: 55, y: 20 
    },
    'ASLP': { 
        title: 'Auto Sleep', 
        text: 'Tid kvar till strömsparläge. Nollställs när någon pratar.', 
        good: '>0', 
        tags:['NET'], 
        affects: [{ id: 'WS', desc: 'Stänger' }], 
        affectedBy: [{ id: 'SIL', desc: 'Matar' }], 
        x: 55, y: 10 
    },
    'BASE': { 
        title: 'BASE_SIL (275ms)', 
        text: 'Systemets mest aggressiva läge (Tripp). Aktiveras när både DAM och JITTER är noll. Ger extremt snabb respons ("Walkie Talkie"-känsla) för korta dialoger.', 
        good: '275ms', 
        tags:['LOGIC'], 
        affects: [{ id: 'SIL', desc: 'Golv' }], 
        affectedBy: [], 
        x: 10, y: 90 
    },
    'CS_M': { 
        title: 'Cold Start Mode', 
        text: 'SAFE vs ADAPTIVE. Avgör vilken prediktionsmodell som används för BSY-timern.', 
        good: 'ADAPT', 
        tags:['AI'], 
        affects: [{id: 'BSY', desc: 'Väljer algoritm'}], 
        affectedBy: [{id: 'C_CSL', desc: 'Sätter gräns'}], 
        x: 70, y: 40 
    },
    'GHOST': {
        title: 'Ghost Pressure (Momentum)',
        text: 'Indikerar om användaren har uppnått "Momentum" (taltid > C_MOM).\n\nOm denna lyser (Lila), vet systemet att du håller en monolog. Då appliceras C_MTR (1200ms) som tystnadstolerans istället för standard 275ms. Detta tillåter dig att andas utan att bli avbruten.',
        good: 'ON vid monolog',
        tags: ['LOGIC'],
        affects: [{id: 'SIL', desc: 'Ökar tolerans'}],
        affectedBy: [{id: 'SPK', desc: 'Tid'}],
        x: 35, y: 45
    }
};
