
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
        { abbr: 'C_MSD', full: 'Config Min Speech', desc: 'Kortaste ljudet att reagera på.' },
        { abbr: 'C_MOM', full: 'Momentum Start', desc: 'Tid för att aktivera Ghost Pressure.' },
        { abbr: 'C_MTR', full: 'Momentum Tolerance', desc: 'Tolerans i ms vid aktivt Momentum.' }
    ]
};

export const CONFIG_ENTRIES: Record<string, KnowledgeEntry> = {
    'C_THR': {
        title: 'C_THR: Bruskänslighet',
        text: 'Bestämmer hur säker (0.0-1.0) den neurala VAD-modellen måste vara för att öppna mikrofonen.\n\n• Högt värde (0.8): Filtrerar bort fläktar och sorl, men kan klippa svaga röster.\n• Lågt värde (0.3): Fångar viskningar, men riskerar att sända bakgrundsbrus.',
        good: '0.5 - 0.7',
        tags: ['AI'], 
        affects: [{id: 'THR', desc: 'Styr'}],
        affectedBy: [],
        x: 10, y: 10
    },
    'C_SIL': {
        title: 'C_SIL: Paus-tolerans (Taket)',
        text: 'Detta är INTE längre en statisk gräns. C_SIL anger nu **Maximal Tolerans** (Taket) som används i "Trull-läget" (vid långa monologer eller högt tryck i Dammen).\n\nI snabb dialog ("Tripp") ignorerar vi ofta detta värde och kör hårt på 275ms för maximal responsivitet.',
        good: '500ms',
        tags: ['LOGIC'],
        affects: [{id: 'SIL', desc: 'Maxgräns'}],
        affectedBy: [],
        x: 10, y: 30
    },
    'C_ELA': {
        title: 'C_ELA: Monolog-gräns',
        text: 'Tidsgränsen (sekunder) för när vi byter från "Dialog" till "Monolog".\n\nEfter denna tid börjar systemet sänka toleransen mjukt. Vid 20s tar dock "The Aggressive Squeeze" över oavsett vad detta värde är satt till.',
        good: '5.0s',
        tags: ['LOGIC'],
        affects: [{id: 'SQZ', desc: 'Startar'}],
        affectedBy: [],
        x: 10, y: 40
    },
    'C_LAT': {
        title: 'C_LAT: Start-buffert',
        text: 'Minsta mängd ljud (ms) som måste samlas in innan vi skickar det första paketet. Fungerar som ett skydd mot att skicka "Eh..." eller klickljud.',
        good: '600ms',
        tags: ['LOGIC'],
        affects: [{id: 'BUF', desc: 'Håller data'}],
        affectedBy: [],
        x: 10, y: 60
    },
    'C_CSL': {
        title: 'C_CSL: Cold Start Limit',
        text: 'Antal turer i början av ett samtal där vi kör "SAFE MODE".\n\nI Safe Mode gissar vi konservativt (lång väntetid) på hur länge AI:n tänker. När gränsen är nådd byter vi till "ADAPTIVE MODE" och baserar väntetiden på verklig uppmätt RTT.',
        good: '5 turer',
        tags: ['AI'],
        affects: [{id: 'CS_M', desc: 'Styr läge'}],
        affectedBy: [],
        x: 65, y: 55
    },
    'C_VOL': {
        title: 'C_VOL: Input Gain',
        text: 'Digital volymökning. Multiplicerar mikrofonens signalstyrka INNAN den når VAD. Användbart om talaren står långt bort.',
        good: '1.0x',
        tags: ['AUDIO'],
        affects: [{id: 'RMS', desc: 'Boostar'}],
        affectedBy: [],
        x: 10, y: 80
    },
    'C_MSD': {
        title: 'C_MSD: Min Speech',
        text: 'Filter för korta ljud. Om ett ljud är kortare än detta (t.ex. en hostning) kastas det bort helt och VAD triggas aldrig.',
        good: '150ms',
        tags: ['AI'],
        affects: [{id: 'SPK', desc: 'Veto'}],
        affectedBy: [],
        x: 10, y: 20
    },
    'C_MOM': {
        title: 'C_MOM: Momentum Start',
        text: 'Tidsgränsen (sek) där vi anser att användaren "fått upp farten" (Momentum). Efter denna tid aktiveras "Ghost Pressure" vilket tillåter längre pauser.',
        good: '3.0s',
        tags: ['LOGIC'],
        affects: [{id: 'GHOST', desc: 'Aktiverar'}],
        affectedBy: [],
        x: 25, y: 45
    },
    'C_MTR': {
        title: 'C_MTR: Momentum Tolerance',
        text: 'Toleransvärdet (ms) för tystnad när Momentum är aktivt. Detta är den "Gyllene Medelvägen" (1200ms) som tillåter andningspauser men fortfarande klipper lagom snabbt.',
        good: '1200ms',
        tags: ['LOGIC'],
        affects: [{id: 'SIL', desc: 'Målvärde'}],
        affectedBy: [],
        x: 45, y: 45
    }
};
