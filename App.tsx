
import React, { useState, useEffect, useRef } from 'react';
import { useGeminiLive } from './hooks/useGeminiLive';
import { useWakeLock } from './hooks/useWakeLock';
import { SubtitleOverlay } from './components/SubtitleOverlay';
import HeaderControls from './components/HeaderControls';
import CalibrationModal from './components/CalibrationModal';
import LanguageSelectorModal from './components/LanguageSelectorModal';
import ControlBar from './components/ControlBar';
import Tower from './components/Tower';
import SystemPromptModal from './components/SystemPromptModal'; 
import { AudioGroup } from './types';

const ALL_LANGUAGES = [
  "Afrikaans",
  "Azərbaycan (Azerbajdzjanska)",
  "Bahasa Indonesia",
  "Bahasa Melayu",
  "Basa Jawa (Javanesiska)",
  "Bosanski (Bosniska)",
  "Català (Katalanska)",
  "Čeština (Tjeckiska)",
  "Cymraeg (Walesiska)",
  "Dansk (Danska)",
  "Deutsch (Tyska)",
  "Eesti (Estniska)",
  "English (Engelska)",
  "Español (Spanska)",
  "Esperanto",
  "Euskara (Baskiska)",
  "Filipino (Tagalog)",
  "Français (Franska)",
  "Frysk (Frisiska)",
  "Gaeilge (Irländska)",
  "Gàidhlig (Skotsk gäliska)",
  "Galego (Galiciska)",
  "Hausa",
  "Hrvatski (Kroatiska)",
  "Igbo",
  "Íslenska (Isländska)",
  "Italiano (Italienska)",
  "Kinyarwanda",
  "Kiswahili (Swahili)",
  "Latviešu (Lettiska)",
  "Lietuvių (Litauiska)",
  "Lëtzebuergesch (Luxemburgska)",
  "Magyar (Ungerska)",
  "Malti (Maltesiska)",
  "Māori",
  "Nederlands (Nederländska)",
  "Norsk (Norska)",
  "O‘zbek (Uzbekiska)",
  "Polski (Polska)",
  "Português (Portugisiska)",
  "Română (Rumänska)",
  "Shqip (Albanska)",
  "Slovenčina (Slovakiska)",
  "Slovenščina (Slovenska)",
  "Soomaali (Somaliska)",
  "Suomi (Finska)",
  "Svenska",
  "Tiếng Việt (Vietnamesiska)",
  "Türkçe (Turkiska)",
  "Yorùbá",
  "Zulu",
  "Ελληνικά (Grekiska)",
  "Беларуская (Vitryska)",
  "Български (Bulgariska)",
  "Кыргызча (Kirgiziska)",
  "Македонски (Makedonska)",
  "Монгол (Mongoliska)",
  "Русский (Ryska)",
  "Српски (Serbiska)",
  "Тоҷикӣ (Tadzjikiska)",
  "Українська (Ukrainska)",
  "Қазақ тілі (Kazakiska)",
  "Հայերեն (Armeniska)",
  "עברית (Hebreiska)",
  "ייִדיש (Jiddisch)",
  "اردو (Urdu)",
  "العربية (Arabiska)",
  "فارسی (Persiska)",
  "پښتو (Pashto)",
  "नेपाली (Nepalesiska)",
  "मराठी (Marathi)",
  "हिन्दी (Hindi)",
  "বাংলা (Bengali)",
  "ਪੰਜਾਬੀ (Punjabi)",
  "ગુજરાતી (Gujarati)",
  "தமிழ் (Tamil)",
  "తెలుగు (Telugu)",
  "ಕನ್ನಡ (Kannada)",
  "മലയാളം (Malayalam)",
  "සිංහල (Singalesiska)",
  "ไทย (Thailändska)",
  "ພາສາລາວ (Lao)",
  "ဗမာစာ (Burmesiska)",
  "ខ្មែរ (Khmer)",
  "한국어 (Koreanska)",
  "中文 (Kinesiska)",
  "日本語 (Japanska)",
  "አማርኛ (Amhariska)"
];

const LOCAL_MODE_NAME = "Lokalt i min mobil";

const App: React.FC = () => {
  const { requestLock, releaseLock } = useWakeLock();

  useEffect(() => {
    console.log("App Component Mounted Successfully");
  }, []);

  const { 
    status, 
    transcripts, 
    error,
    setTargetLanguages,
    targetLanguages,
    queueStats,
    currentPlaybackRate,
    currentLatency,
    activeMode,
    setMode,
    currentRoom,
    setCurrentRoom,
    packetEvents,
    minTurnDuration,
    setMinTurnDuration,
    vadThreshold,
    setVadThreshold,
    silenceThreshold,
    setSilenceThreshold,
    // NEW: Elasticity & Min Speech
    elasticityStart,
    setElasticityStart,
    minSpeechDuration,
    setMinSpeechDuration,
    
    // NEW: Ghost Pressure Props
    momentumStart,
    setMomentumStart,
    ghostTolerance,
    setGhostTolerance,

    volMultiplier,
    setVolMultiplier,
    // DEVICES
    inputDeviceId,
    setInputDeviceId,
    outputDeviceId,
    setOutputDeviceId,
    
    // NEW: Configs from useGeminiLive/useLiveConfig
    coldStartSamples,
    setColdStartSamples,
    autoSleepTimeout,
    setAutoSleepTimeout,

    notification,
    effectiveMinDuration,
    debugMode,
    setDebugMode,
    aiSpeakingRate,
    setAiSpeakingRate,
    activePhraseTiming, 
    audioContext,       
    audioDiagnosticsRef,
    triggerTestTone,
    injectTextAsAudio,
    initAudioInput, 
    connect,
    disconnect,
    customSystemInstruction, 
    setCustomSystemInstruction, 
    enableLogs, 
    setEnableLogs,
    simulateNetworkDrop,
    getBufferStatus,
    isJitterEnabled,
    setIsJitterEnabled,
    jitterIntensity,
    setJitterIntensity,
    // ADDED: Pro Mode & Transcription Configs
    enableProMode,
    setEnableProMode,
    isTranscriptionEnabled,
    setIsTranscriptionEnabled
  } = useGeminiLive();

  useEffect(() => {
    if (activeMode !== 'off') {
        requestLock();
    } else {
        releaseLock();
    }
  }, [activeMode, requestLock, releaseLock]);

  const [showLangModal, setShowLangModal] = useState(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false); 
  const [showSubtitles, setShowSubtitles] = useState(true);

  // NEW: Track if we have ever connected to show subtitles button permanently after first use
  const [hasEverConnected, setHasEverConnected] = useState(false);

  useEffect(() => {
      if (status === 'connected') {
          setHasEverConnected(true);
      }
  }, [status]);

  const handleSaveLanguages = (langs: string[]) => setTargetLanguages(langs);

  const handleRoomChange = (room: string) => {
      setCurrentRoom(room);
  };

  const [lastActiveGroupId, setLastActiveGroupId] = useState<number | null>(null);

  useEffect(() => {
      if (activePhraseTiming?.groupId !== undefined) {
          setLastActiveGroupId(activePhraseTiming.groupId);
      }
  }, [activePhraseTiming]);

  const effectiveActiveGroupId = activePhraseTiming?.groupId ?? lastActiveGroupId;

  const activeItem = effectiveActiveGroupId !== null 
      ? transcripts.find(t => t.groupId === effectiveActiveGroupId) 
      : null;
  
  const activeGroup: AudioGroup | null = activeItem ? { 
      id: activeItem.id, 
      text: activeItem.text, 
      duration: activePhraseTiming?.duration 
  } : null;

  const history: AudioGroup[] = transcripts
    .filter(t => !activeItem || t.groupId < activeItem.groupId)
    .sort((a, b) => a.groupId - b.groupId) 
    .map(t => ({ id: t.id, text: t.text }));
  
  const queue: AudioGroup[] = transcripts
    .filter(t => activeItem && t.groupId > activeItem.groupId)
    .sort((a, b) => a.groupId - b.groupId)
    .map(t => ({ id: t.id, text: t.text }));

  // Helper to determine if we have a valid language set
  const hasLanguages = targetLanguages.length > 0 && targetLanguages[0] !== '';

  return (
    <div className="h-screen w-screen bg-[#101010] text-white overflow-hidden font-sans relative flex flex-col items-center justify-center">
      
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#050505] z-0"></div>
      
      {/* HEADER CONTROLS (Handles Hero Animation internally) */}
      <HeaderControls 
          currentRoom={currentRoom}
          onRoomChange={handleRoomChange}
          userLanguage={targetLanguages.length > 1 ? `${targetLanguages.length} Språk` : targetLanguages[0] || 'Välj'}
          targetLanguages={targetLanguages}
          allLanguages={ALL_LANGUAGES}
          onOpenLangModal={() => setShowLangModal(true)}
          onCloseLangModal={() => setShowLangModal(false)}
          isLangModalOpen={showLangModal} // PASSED HERE
          onOpenSettings={() => setDebugMode(true)} 
          status={status}
          isTranscriptionEnabled={isTranscriptionEnabled}
          setIsTranscriptionEnabled={setIsTranscriptionEnabled}
          showSubtitles={showSubtitles}
          onToggleSubtitles={() => setShowSubtitles(!showSubtitles)}
          currentPlaybackRate={currentPlaybackRate}
          inputDeviceId={inputDeviceId}
          setInputDeviceId={setInputDeviceId}
          outputDeviceId={outputDeviceId}
          setOutputDeviceId={setOutputDeviceId}
          onToggleTower={() => setDebugMode(!debugMode)}
          hasEverConnected={hasEverConnected}
      />

      <LanguageSelectorModal 
        isOpen={showLangModal}
        onClose={() => setShowLangModal(false)}
        onSave={handleSaveLanguages}
        currentLanguages={targetLanguages} 
        allLanguages={ALL_LANGUAGES}
        isSingleSelection={false}
      />

      {showCalibrationModal && (
          <CalibrationModal 
            isOpen={showCalibrationModal}
            onClose={() => setShowCalibrationModal(false)}
            transcripts={transcripts}
          />
      )}

      <SystemPromptModal 
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        customSystemInstruction={customSystemInstruction}
        setCustomSystemInstruction={setCustomSystemInstruction}
        targetLanguages={targetLanguages}
        onLanguagesChange={handleSaveLanguages}
        aiSpeakingRate={aiSpeakingRate}
        allLanguages={ALL_LANGUAGES}
      />

      {notification && (
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-neutral-800/80 border border-neutral-700 px-4 py-2 rounded-full backdrop-blur-md z-30 animate-in fade-in slide-in-from-top-4 duration-200">
              <p className="text-neutral-300 text-xs font-mono flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                  {notification}
              </p>
          </div>
      )}

      {error && (
          <div className="absolute top-32 left-4 right-4 bg-red-900/20 border border-red-500/50 rounded-lg p-3 z-30 text-center backdrop-blur-md">
              <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
      )}

      <div 
        className={`flex-1 w-full relative z-10 flex flex-col transition-opacity duration-700 ease-in-out ${showSubtitles ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
          <SubtitleOverlay 
            activeGroup={activeGroup}
            activePhraseTiming={activePhraseTiming}
            history={history}
            queue={queue}
            audioContext={audioContext}
          />
      </div>
      
      {debugMode && (
          <Tower 
              diagnosticsRef={audioDiagnosticsRef} 
              isConnected={status === 'connected'}
              triggerTestTone={triggerTestTone} 
              injectTextAsAudio={injectTextAsAudio}
              initAudioInput={initAudioInput} 
              aiSpeakingRate={aiSpeakingRate}
              setAiSpeakingRate={setAiSpeakingRate}
              minTurnDuration={minTurnDuration}
              setMinTurnDuration={setMinTurnDuration}
              vadThreshold={vadThreshold}
              setVadThreshold={setVadThreshold}
              silenceThreshold={silenceThreshold}
              setSilenceThreshold={setSilenceThreshold}
              elasticityStart={elasticityStart}
              setElasticityStart={setElasticityStart}
              minSpeechDuration={minSpeechDuration}
              setMinSpeechDuration={setMinSpeechDuration}
              volMultiplier={volMultiplier}
              setVolMultiplier={setVolMultiplier}
              inputDeviceId={inputDeviceId}
              setInputDeviceId={setInputDeviceId}
              outputDeviceId={outputDeviceId}
              setOutputDeviceId={setOutputDeviceId}
              coldStartSamples={coldStartSamples}
              setColdStartSamples={setColdStartSamples}
              autoSleepTimeout={autoSleepTimeout}
              setAutoSleepTimeout={setAutoSleepTimeout}
              momentumStart={momentumStart}
              setMomentumStart={setMomentumStart}
              ghostTolerance={ghostTolerance}
              setGhostTolerance={setGhostTolerance}
              debugMode={debugMode}
              setDebugMode={setDebugMode}
              onOpenCalibration={() => setShowCalibrationModal(true)}
              connect={connect}
              disconnect={disconnect}
              setCustomSystemInstruction={setCustomSystemInstruction}
              enableLogs={enableLogs}
              setEnableLogs={setEnableLogs}
              onOpenPromptModal={() => setShowPromptModal(true)}
              simulateNetworkDrop={simulateNetworkDrop}
              getBufferStatus={getBufferStatus}
              isJitterEnabled={isJitterEnabled}
              setIsJitterEnabled={setIsJitterEnabled}
              jitterIntensity={jitterIntensity}
              setJitterIntensity={setJitterIntensity}
              queueStats={queueStats}
              currentPlaybackRate={currentPlaybackRate}
              enableProMode={enableProMode}
              setEnableProMode={setEnableProMode}
          />
      )}

      {/* ControlBar only visible if language selected */}
      {hasLanguages && (
          <ControlBar 
            activeMode={activeMode}
            setMode={setMode}
          />
      )}
    </div>
  );
};

export default App;
