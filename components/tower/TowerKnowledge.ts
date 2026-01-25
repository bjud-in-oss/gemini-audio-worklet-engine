
import { KnowledgeEntry, ModuleDoc } from './types';
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
    }
};

// --- AGGREGATED KNOWLEDGE BASE (For Doctor & Map) ---
export const KNOWLEDGE_BASE: Record<string, KnowledgeEntry> = {
    ...NETWORK_ENTRIES,
    ...LOGIC_ENTRIES,
    ...AUDIO_ENTRIES,
    ...CONFIG_ENTRIES
};
