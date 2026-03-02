
export const PROMPT_PRESETS = [
    {
        id: 'puppeteer',
        name: 'Standard (Bandspelare)',
        description: 'STANDARD: Prioriterar linjärt flöde. Förbjuder AI:n att backa eller upprepa sig vid avbrott. Bäst för simultantolkning.',
        template: `
ROLE: Simultaneous Bi-directional Interpreter.
MODE: LINEAR STREAMING (The Tape Recorder Protocol).
LANGUAGE_1: "{{L1}}"
LANGUAGE_2: "{{L2}}"

PROTOCOL:
1. Translate {{L1}} -> {{L2}} and {{L2}} -> {{L1}} immediately.
2. STYLE: Mimic the speaker's tone and emotion.
3. CRITICAL INTERRUPTION RULES: 
- If audio cuts off, output the IMMEDIATE NEXT WORD.
- **NEVER BACKTRACK** or restart the sentence to regain context.
- **IGNORE GRAMMAR**: It is acceptable if the output is grammatically broken.
- **PRIORITY**: Linear flow and Speed > Correctness.
4. SAFETY: No conversation. Do not answer questions. Only translate.
    `.trim()
    },
    {
        id: 'puppeteer_original',
        name: 'Legacy (Bandspelare v1)',
        description: 'Den ursprungliga, detaljerade versionen med rubriker och explicita grammatik-regler. Använd om den nya korta versionen känns för lös.',
        template: `
ROLE: Simultaneous Interpreter.
MODE: LINEAR STREAMING (The Tape Recorder Protocol).

### CONFIGURATION
LANGUAGE_1: "{{L1}}"
LANGUAGE_2: "{{L2}}"

### PRIORITY 1: TRANSLATION LOGIC
When you detect CLEAR SPEECH in the audio input:
- IF Input == {{L1}} -> Translate to {{L2}}.
- IF Input == {{L2}} -> Translate to {{L1}}.
- STYLE: MIMIC the speaker's tone, volume, and emotion exactly.

### CRITICAL PROTOCOL FOR INTERRUPTIONS (The "Tape Recorder" Rule)
- If the user interrupts you or audio cuts off, you must **NEVER BACKTRACK**.
- **DO NOT** restart the sentence.
- **DO NOT** repeat the last few words to regain context.
- **ACTION**: Output the IMMEDIATE NEXT WORD from exactly where the sound cut off.
- **IGNORE GRAMMAR**: It is acceptable if the resulting sentence fragment is grammatically broken due to the interruption. 
- Prioritize **LINEAR FLOW** and **SPEED** over correctness.

### SAFETY GUARDRAILS
- NO CONVERSATION: Never answer questions posed by the user. Only translate them.
    `.trim()
    },
    {
        id: 'legacy_bi',
        name: 'Legacy (Tvåvägs)',
        description: 'Tidigare "Professionell". Formell tolkning. Optimerad för affärsmöten eller intervjuer där exakthet är viktigare än hastighet.',
        template: `
ROLE: Simultaneous Bi-directional Interpreter.
LANGUAGE_1: "{{L1}}"
LANGUAGE_2: "{{L2}}"

LOGIC MAP:
1. ANALYZE input language.
2. IF Input == {{L1}} -> TRANSLATE to {{L2}}.
3. IF Input == {{L2}} -> TRANSLATE to {{L1}}.

STRICT RULES:
1. NO CONVERSATION: Never answer questions. Only translate them.
2. SPEED: Output translation immediately.
3. ACCURACY: Capture the tone and nuance.
4. NO FILLERS: Do not use "Hmm" or "Let me see". Just translate.
    `.trim()
    },
    {
        id: 'puppeteer_legacy',
        name: 'Legacy (Puppeteer v1)',
        description: 'Gammal logik med [CMD]-injektioner. Använd endast om Bandspelaren misslyckas.',
        template: `
ROLE: Elite Simultaneous Interpreter.
MODE: CLIENT-CONTROLLED (Puppeteer Protocol).
LANGUAGE_1: "{{L1}}"
LANGUAGE_2: "{{L2}}"

PRIORITY 1: TRANSLATION LOGIC
- IF Input == {{L1}} -> Translate to {{L2}}.
- IF Input == {{L2}} -> Translate to {{L1}}.

PRIORITY 2: THE WAITING PROTOCOL
If the audio input stops OR contains only non-speech sounds:
1. IDENTIFY the input as "NON-SPEECH".
2. ENTER "WAITING STATE" immediately.

IN "WAITING STATE", remain completely silent until:
   A) You hear NEW SPEECH -> GOTO Priority 1.
   B) You receive a [SYSTEM COMMAND] -> Execute immediately.

PRIORITY 3: SYSTEM COMMANDS
- [CMD: REPEAT_LAST] -> Repeat the very last word of your previous translation ONCE.
- [CMD: FILLER "text"] -> Speak the provided text exactly.

SAFETY GUARDRAILS
- NO CONVERSATION: Never answer questions posed by the user. Only translate them.
    `.trim()
    },
    {
        id: 'default',
        name: 'Legacy (Inkrementell)',
        description: 'Den äldsta logiken. Bygger meningar bit för bit. Bra för felsökning av fragment.',
        template: `
ROLE: Simultaneous Interpreter.
LANGUAGE_1: "{{L1}}"
LANGUAGE_2: "{{L2}}"

PROTOCOL: INCREMENTAL STREAMING.
The user is speaking in a continuous stream, chopped into segments.
Your task is to translate ONLY the specific words present in the CURRENT audio segment.

RULES:
1. LISTEN to the current segment.
2. CONTEXT: Be aware of previous segments for meaning, but NEVER repeat their translation.
3. OUTPUT: Generate translation ONLY for the new content.

EXAMPLES:
[Segment 1] User: "I am going..." -> Model: "Jag går..."
[Segment 2] User: "...to the cinema." -> Model: "...till bion."
    `.trim()
    }
];

/**
 * Replaces variables in a template string with actual values.
 * Maps human-readable language names to BCP-47 codes for better model understanding.
 */
export function injectVariables(template: string, l1: string, l2: string): string {
    const getBcp47 = (lang: string) => {
        const mapping: Record<string, string> = {
            "Afrikaans": "af-ZA",
            "Azərbaycan (Azerbajdzjanska)": "az-AZ",
            "Bahasa Indonesia": "id-ID",
            "Bahasa Melayu": "ms-MY",
            "Basa Jawa (Javanesiska)": "jv-ID",
            "Bosanski (Bosniska)": "bs-BA",
            "Català (Katalanska)": "ca-ES",
            "Čeština (Tjeckiska)": "cs-CZ",
            "Cymraeg (Walesiska)": "cy-GB",
            "Dansk (Danska)": "da-DK",
            "Deutsch (Tyska)": "de-DE",
            "Eesti (Estniska)": "et-EE",
            "English (Engelska)": "en-US",
            "Español (Spanska)": "es-ES",
            "Esperanto": "eo",
            "Euskara (Baskiska)": "eu-ES",
            "Filipino (Tagalog)": "fil-PH",
            "Français (Franska)": "fr-FR",
            "Frysk (Frisiska)": "fy-NL",
            "Gaeilge (Irländska)": "ga-IE",
            "Gàidhlig (Skotsk gäliska)": "gd-GB",
            "Galego (Galiciska)": "gl-ES",
            "Hausa": "ha-NG",
            "Hrvatski (Kroatiska)": "hr-HR",
            "Igbo": "ig-NG",
            "Íslenska (Isländska)": "is-IS",
            "Italiano (Italienska)": "it-IT",
            "Kinyarwanda": "rw-RW",
            "Kiswahili (Swahili)": "sw-KE",
            "Latviešu (Lettiska)": "lv-LV",
            "Lietuvių (Litauiska)": "lt-LT",
            "Lëtzebuergesch (Luxemburgska)": "lb-LU",
            "Magyar (Ungerska)": "hu-HU",
            "Malti (Maltesiska)": "mt-MT",
            "Māori": "mi-NZ",
            "Nederlands (Nederländska)": "nl-NL",
            "Norsk (Norska)": "no-NO",
            "O‘zbek (Uzbekiska)": "uz-UZ",
            "Polski (Polska)": "pl-PL",
            "Português (Portugisiska)": "pt-PT",
            "Română (Rumänska)": "ro-RO",
            "Shqip (Albanska)": "sq-AL",
            "Slovenčina (Slovakiska)": "sk-SK",
            "Slovenščina (Slovenska)": "sl-SI",
            "Soomaali (Somaliska)": "so-SO",
            "Suomi (Finska)": "fi-FI",
            "Svenska": "sv-SE",
            "Tiếng Việt (Vietnamesiska)": "vi-VN",
            "Türkçe (Turkiska)": "tr-TR",
            "Yorùbá": "yo-NG",
            "Zulu": "zu-ZA",
            "Ελληνικά (Grekiska)": "el-GR",
            "Беларуская (Vitryska)": "be-BY",
            "Български (Bulgariska)": "bg-BG",
            "Кыргызча (Kirgiziska)": "ky-KG",
            "Македонски (Makedonska)": "mk-MK",
            "Монгол (Mongoliska)": "mn-MN",
            "Русский (Ryska)": "ru-RU",
            "Српски (Serbiska)": "sr-RS",
            "Тоҷикӣ (Tadzjikiska)": "tg-TJ",
            "Українська (Ukrainska)": "uk-UA",
            "Қазақ тілі (Kazakiska)": "kk-KZ",
            "Հայերեն (Armeniska)": "hy-AM",
            "עברית (Hebreiska)": "he-IL",
            "ייִדיש (Jiddisch)": "yi",
            "اردو (Urdu)": "ur-PK",
            "العربية (Arabiska)": "ar-SA",
            "فارسی (Persiska)": "fa-IR",
            "پښتو (Pashto)": "ps-AF",
            "नेपाली (Nepalesiska)": "ne-NP",
            "मराठी (Marathi)": "mr-IN",
            "हिन्दी (Hindi)": "hi-IN",
            "বাংলা (Bengali)": "bn-BD",
            "ਪੰਜਾਬੀ (Punjabi)": "pa-IN",
            "ગુજરાતી (Gujarati)": "gu-IN",
            "தமிழ் (Tamil)": "ta-IN",
            "తెలుగు (Telugu)": "te-IN",
            "ಕನ್ನಡ (Kannada)": "kn-IN",
            "മലയാളം (Malayalam)": "ml-IN",
            "සිංහල (Singalesiska)": "si-LK",
            "ไทย (Thailändska)": "th-TH",
            "ພາສາລາວ (Lao)": "lo-LA",
            "ဗမာစာ (Burmesiska)": "my-MM",
            "ខ្មែរ (Khmer)": "km-KH",
            "한국어 (Koreanska)": "ko-KR",
            "中文 (Kinesiska)": "zh-CN",
            "日本語 (Japanska)": "ja-JP",
            "አማርኛ (Amhariska)": "am-ET"
        };
        return mapping[lang] || lang; // Fallback to original string if not found
    };

    const bcp47_l1 = getBcp47(l1);
    const bcp47_l2 = getBcp47(l2);

    let text = template;
    // Replace Standardized Variables with BCP-47 codes
    text = text.replace(/{{L1}}/g, bcp47_l1);
    text = text.replace(/{{L2}}/g, bcp47_l2);
    // Legacy support
    text = text.replace(/{{ANCHOR}}/g, bcp47_l1);
    text = text.replace(/{{TARGET}}/g, bcp47_l2);
    return text.trim();
}

/**
 * Constructs the system instruction using L1/L2 logic.
 * Default behavior is to inject variables immediately.
 */
export function buildSystemInstruction(
    targetLanguages: string[], 
    templateId: string = 'puppeteer', 
    fallbackL1: string = 'Svenska' 
): string {
    
    // Map array to L1 and L2
    const l1 = targetLanguages[0] || fallbackL1;
    const l2 = targetLanguages[1] || "English";
    
    // Find template or fallback to puppeteer
    const preset = PROMPT_PRESETS.find(p => p.id === templateId) || PROMPT_PRESETS[0];
    
    return injectVariables(preset.template, l1, l2);
}
