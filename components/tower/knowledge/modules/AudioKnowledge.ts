
import { KnowledgeEntry, ModuleDoc } from '../../types';

export const AUDIO_DOC: ModuleDoc = {
    title: 'Ljudmodul (Audio Engine)',
    description: 'Hanterar webbläsarens mikrofon och högtalare. Rådata innan den blir logik.',
    params: [
        { abbr: 'RMS', full: 'Root Mean Square', desc: 'Ljudvolym/Energi. Hårdkodad "noise gate" på 0.002.' },
        { abbr: 'SR', full: 'Sample Rate', desc: 'Ljudkvalitet (Hz).' },
        { abbr: 'CTX', full: 'Audio Context', desc: 'Webbläsarens ljudmotor.' },
        { abbr: 'FRM', full: 'Frame Counter', desc: 'Räknare för bearbetade ljudblock.' }
    ]
};

export const AUDIO_ENTRIES: Record<string, KnowledgeEntry> = {
    'RMS': { 
        title: 'Energi (RMS)', 
        text: 'Rå signalstyrka. Detta är INTE samma sak som VAD. RMS har en hårdkodad gräns på 0.002 i workern. Om RMS < 0.002 körs inte ens VAD-modellen för att spara batteri.', 
        good: '> 0.002',
        tags: ['AUDIO'],
        affects: [
            { id: 'VAD', desc: 'Väcker AI-modellen' },
            { id: 'SIL', desc: 'Förhindrar tystnad om hög' }
        ],
        affectedBy: [
            { id: 'C_VOL', desc: 'Multipliceras av' }
        ],
        x: 25, y: 80
    },
    'SR': { title: 'Sample Rate', text: 'Samplingsfrekvens för ljudmotorn. Måste vara 16000Hz för att Silero VAD ska fungera korrekt.', good: '16000', tags: ['AUDIO'], affects: [{ id: 'CTX', desc: 'Inställning' }], affectedBy: [], x: 5, y: 95 },
    'CTX': { title: 'Audio Context', text: 'Webbläsarens huvudmotor för ljud (Web Audio API). Om denna är "SUSPENDED" (vanligt på iOS) fungerar inget ljud.', good: 'RUN', tags: ['AUDIO'], affects: [{ id: 'FRM', desc: 'Driver loop' }], affectedBy: [], x: 15, y: 95 },
    'FRM': { title: 'Frame Counter', text: 'Visuellt bevis på att ljudloopen snurrar. Om denna siffra stannar har workern kraschat ("Engine Stall").', good: 'Ökar', tags: ['AUDIO'], affects: [], affectedBy: [{id:'CTX', desc:'Körs av'}], x: 25, y: 95 },
    'TIME': { title: 'Context Time', text: 'Intern klocka i AudioContext. Måste öka konstant. Används för att synkronisera uppspelning.', good: 'Ökar', tags: ['AUDIO'], affects: [], affectedBy: [{id:'CTX', desc:'Körs av'}], x: 35, y: 95 },
};
