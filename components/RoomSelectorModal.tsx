
import React, { useRef, useState, useEffect } from 'react';
import { MAP_POINTS, LOCAL_NAME, ListOption } from '../utils/roomData';
import RoomList from './RoomList';
import RoomMap, { RoomMapRef } from './RoomMap';

interface RoomSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoom: string;
  onSelectRoom: (room: string) => void;
  inputDeviceId?: string;
  setInputDeviceId?: (id: string) => void;
  outputDeviceId?: string;
  setOutputDeviceId?: (id: string) => void;
  onToggleTower?: () => void;
}

const RoomSelectorModal: React.FC<RoomSelectorModalProps> = ({
  isOpen,
  onClose,
  currentRoom,
  onSelectRoom,
  inputDeviceId,
  setInputDeviceId,
  outputDeviceId,
  setOutputDeviceId,
  onToggleTower
}) => {
  const [tempSelection, setTempSelection] = useState(currentRoom);
  const [mapImgUrl, setMapImgUrl] = useState<string | null>(null);
  const [mobileFocus, setMobileFocus] = useState<'list' | 'map' | 'neutral'>('neutral');
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const mapRef = useRef<RoomMapRef>(null);

  useEffect(() => {
      if (isOpen) {
          const loadDevices = async () => {
              try {
                  const devices = await navigator.mediaDevices.enumerateDevices();
                  setInputDevices(devices.filter(d => d.kind === 'audioinput'));
                  setOutputDevices(devices.filter(d => d.kind === 'audiooutput'));
              } catch (e) { console.error(e); }
          };
          loadDevices();
      }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
        if (mapImgUrl) { URL.revokeObjectURL(mapImgUrl); setMapImgUrl(null); }
        return;
    }
    const loadMapImage = async () => {
        try {
            const response = await fetch('/kapellet.png');
            if (!response.ok) throw new Error("Failed");
            const blob = await response.blob();
            setMapImgUrl(URL.createObjectURL(blob));
        } catch (error) {}
    };
    if (!mapImgUrl) loadMapImage();
  }, [isOpen]); 

  useEffect(() => {
    if (isOpen) { setTempSelection(currentRoom); setMobileFocus('neutral'); }
  }, [isOpen, currentRoom]);

  const handleListClick = (roomName: string) => {
      setTempSelection(roomName);
      const point = MAP_POINTS.find(p => p.name === roomName);
      if (point) {
          if (mapRef.current) mapRef.current.panToPoint(point.x, point.y);
          if (window.innerWidth < 768) setMobileFocus('map');
      } else { setMobileFocus('neutral'); }
  };

  const confirmSelection = () => { onSelectRoom(tempSelection); onClose(); };

  const getMobileHeightClass = (section: 'list' | 'map') => {
      if (mobileFocus === 'neutral') return 'h-[50%]';
      if (section === 'list') return mobileFocus === 'list' ? 'h-[60%]' : 'h-[40%]';
      return mobileFocus === 'map' ? 'h-[60%]' : 'h-[40%]';
  };

  const sortedOptions = (() => {
      const localOpt: ListOption = { type: 'local', name: LOCAL_NAME };
      const mapOpts: ListOption[] = MAP_POINTS.map(p => ({ type: 'room', name: p.name, id: p.id, x: p.x, y: p.y }));
      return [localOpt, ...mapOpts].sort((a, b) => (a.name === tempSelection ? -1 : b.name === tempSelection ? 1 : 0));
  })();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
        {/* GLOBAL CLOSE BUTTON (Top Right of SCREEN) */}
        <button onClick={onClose} className="fixed top-6 right-6 z-[120] pointer-events-auto p-3 bg-black/40 hover:bg-red-500/20 rounded-full transition-colors group">
            <svg className="w-6 h-6 text-slate-400 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

      {/* BACKDROP (Opaque #101010) */}
      <div className="absolute inset-0 bg-[#101010] pointer-events-auto" style={{ top: '140px' }} onClick={onClose}></div>

      {/* CONTAINER - Moved down to 140px to clear header icons */}
      <div 
        className="relative bg-[#101010] w-full max-w-6xl h-[calc(100vh-140px)] flex flex-col md:flex-row overflow-hidden pointer-events-auto z-[110]"
        style={{ marginTop: '140px' }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* --- LEFT PANEL (LIST + CONTROLS) --- */}
        <div className={`w-full md:w-80 shrink-0 bg-[#101010] border-b md:border-b-0 md:border-r border-slate-800 flex flex-col transition-all duration-300 ${getMobileHeightClass('list')} md:h-full`}>
          
          {/* HEADER SECTION - Redesigned */}
          <div className="p-4 border-b border-slate-800 shrink-0 flex flex-col gap-4">
             
             {/* ROW 1: TITLE & SETTINGS (No inner location icon) */}
             <div className="flex items-center justify-between">
                 <h2 className="text-lg font-bold text-white tracking-wide pl-1">Plats & Ljud</h2>
                 {onToggleTower && (
                     <button onClick={onToggleTower} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors" title="Avancerade Inställningar">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                     </button>
                 )}
             </div>

             {/* ROW 2: DEVICE SELECTORS (Moved down) */}
             <div className="flex gap-2">
                 <div className="relative flex-1">
                     <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><svg className="h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></div>
                     <select value={inputDeviceId} onChange={(e) => setInputDeviceId && setInputDeviceId(e.target.value)} className="w-full bg-[#1a1a1a] text-slate-300 text-[10px] rounded px-2 py-2 pl-7 border border-slate-700 focus:border-indigo-500 outline-none appearance-none truncate">
                        <option value="default">Mikrofon</option>
                        {inputDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Mic ' + d.deviceId.slice(0,4)}</option>)}
                     </select>
                 </div>
                 <div className="relative flex-1">
                     <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><svg className="h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg></div>
                     <select value={outputDeviceId} onChange={(e) => setOutputDeviceId && setOutputDeviceId(e.target.value)} className="w-full bg-[#1a1a1a] text-slate-300 text-[10px] rounded px-2 py-2 pl-7 border border-slate-700 focus:border-indigo-500 outline-none appearance-none truncate">
                        <option value="default">Högtalare</option>
                        {outputDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Speaker ' + d.deviceId.slice(0,4)}</option>)}
                     </select>
                 </div>
             </div>
          </div>

          <RoomList 
            options={sortedOptions}
            tempSelection={tempSelection}
            currentRoom={currentRoom}
            onSelect={handleListClick}
            onConfirm={confirmSelection}
            setMobileFocus={setMobileFocus}
          />
        </div>

        {/* --- RIGHT PANEL (MAP) --- */}
        <div className={`w-full md:flex-1 relative bg-[#0f172a] overflow-hidden transition-all duration-300 ${getMobileHeightClass('map')} md:h-full`}>
           <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full text-xs text-white border border-white/10 pointer-events-none flex items-center gap-2">
             <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
             Pinch & Zoom
           </div>
           <RoomMap 
              ref={mapRef}
              imgUrl={mapImgUrl}
              tempSelection={tempSelection}
              currentRoom={currentRoom}
              onSelect={(name) => { setTempSelection(name); setMobileFocus('map'); }}
              onConfirm={confirmSelection}
              setMobileFocus={setMobileFocus}
           />
        </div>
      </div>
    </div>
  );
};

export default RoomSelectorModal;
