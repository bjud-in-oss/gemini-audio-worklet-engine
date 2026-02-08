
import { KnowledgeEntry, ModuleDoc } from '../../types';

export const AUDIO_DOC: ModuleDoc = {
    title: 'Ljudmodul (Audio Engine)',
    description: 'Hanterar webbläsarens mikrofon och högtalare. Rådata innan den blir logik.',
    params: [
        { abbr: 'RMS', full: 'Root Mean Square', desc: 'Ljudvolym/Energi. Hårdkodad "noise gate" i Workern.' },
        { abbr: 'SR', full: 'Sample Rate', desc: 'Ljudkvalitet (Hz).' },
        { abbr: 'CTX', full: 'Audio Context', desc: 'Webbläsarens ljudmotor.' },
        { abbr: 'FRM', full: 'Frame Counter', desc: 'Räknare för bearbetade ljudblock.' },
        { abbr: 'WKT', full: 'Worklet Port', desc: 'Kommunikationskanalen till den isolerade ljudtråden.' }
    ]
};

export const AUDIO_ENTRIES: Record<string, KnowledgeEntry> = {
    'RMS': { 
        title: 'Energi (RMS)', 
        text: 'Rå signalstyrka (Volym). För att spara CPU har vi en hårdkodad gräns på **0.01** i Workern.\n\nOm ljudnivån understiger detta (t.ex. fläktbrus), körs inte den tunga VAD-modellen alls. Detta sparar batteri men kan klippa mycket svaga viskningar.', 
        good: '> 0.01',
        tags: ['AUDIO'],
        affects: [
            { id: 'VAD', desc: 'Väcker AI-modellen' },
            { id: 'SIL', desc: 'Förhindrar tystnad om hög' }
        ],
        affectedBy: [
            { id: 'C_VOL', desc: 'Multipliceras av' },
            { id: 'DSP', desc: 'Matar ren signal'}
        ],
        x: 25, y: 80
    },
    'SR': { title: 'Sample Rate', text: 'Samplingsfrekvens för ljudmotorn. Måste vara 16000Hz för att Silero VAD ska fungera korrekt.', good: '16000', tags: ['AUDIO'], affects: [{ id: 'CTX', desc: 'Inställning' }], affectedBy: [], x: 5, y: 95 },
    'CTX': { title: 'Audio Context', text: 'Webbläsarens huvudmotor för ljud (Web Audio API). Om denna är "SUSPENDED" (vanligt på iOS) fungerar inget ljud.', good: 'RUN', tags: ['AUDIO'], affects: [{ id: 'FRM', desc: 'Driver loop' }], affectedBy: [{id: 'PRO', desc: 'Konfigureras av'}], x: 15, y: 95 },
    'FRM': { title: 'Frame Counter', text: 'Visuellt bevis på att ljudloopen snurrar. I den nya arkitekturen kommer dessa rapporter via MessagePort från den isolerade tråden.', good: 'Ökar', tags: ['AUDIO'], affects: [], affectedBy: [{id:'CTX', desc:'Körs av'}], x: 25, y: 95 },
    'TIME': { title: 'Context Time', text: 'Intern klocka i AudioContext. Måste öka konstant. Används för att synkronisera uppspelning.', good: 'Ökar', tags: ['AUDIO'], affects: [], affectedBy: [{id:'CTX', desc:'Körs av'}], x: 35, y: 95 },
    'WKT': {
        title: 'Worklet (MessagePort)',
        text: 'Den nya hjärtat i ljudmotorn. Istället för SharedArrayBuffer (som kraschade utan säkerhetsheaders), använder vi nu MessagePort för att skicka ljuddata.\n\nDetta garanterar att ljudet körs på en egen tråd och aldrig påverkas av Reacts renderingar.',
        good: 'Isolerad',
        tags: ['AUDIO'],
        affects: [{id: 'BUF', desc: 'Matar'}],
        affectedBy: [{id: 'CTX', desc: 'Värd'}],
        x: 45, y: 90
    },
    'DSP': {
        title: 'Tesira DSP (Hårdvara)',
        text: 'Externt ljudkort. Hanterar AEC och Noise Reduction i hårdvara.\n\nMåste konfigureras med "Speakerphone: Disables Computer AEC" för att Windows ska förstå att den hanterar ekot själv.',
        good: 'Raw USB',
        tags: ['AUDIO'],
        affects: [{id: 'RMS', desc: 'Perfekt signal'}],
        affectedBy: [],
        x: 10, y: 70
    },
    'PRO': {
        title: 'Pro Mode (Raw Audio)',
        text: 'Inställning som stänger av webbläsarens mjukvarufilter (EchoCancellation, AutoGain, NoiseSuppression).\n\nNödvändigt när man använder DSP för att undvika "Double Processing" (undervattenseffekt).',
        good: 'ON vid DSP',
        tags: ['AUDIO'],
        affects: [{id: 'CTX', desc: 'Stänger filter'}],
        affectedBy: [{id: 'DSP', desc: 'Kräver'}],
        x: 20, y: 95
    }
};
