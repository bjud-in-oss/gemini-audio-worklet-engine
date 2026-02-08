
import { create } from 'zustand';
import { NetworkService } from '../services/NetworkService';
import { AudioService } from '../services/AudioService';
import { 
  RoomState, 
  Peer, 
  PeerRole, 
  TranslationEvent, 
  EventType, 
  ControlSignal, 
  LanguageConfig,
  TranscriptionPayload,
  AudioChunkPayload,
  ControlPayload
} from '../types/schema';

export const networkService = new NetworkService(); 
export const audioService = new AudioService();

function float32ToBase64(buffer: Float32Array): string {
  const bytes = new Uint8Array(buffer.buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Float32Array(bytes.buffer);
}

interface AppState {
  myId: string;
  isInitialized: boolean;
  isMicActive: boolean;
  volumeLevel: number; 
  roomState: RoomState;
  transcripts: Array<TranscriptionPayload & { senderId: string; timestamp: number }>;
  availableDevices: MediaDeviceInfo[];
  selectedInputDeviceId: string;
  selectedOutputDeviceId: string;
  isProMode: boolean;
  initialize: (roomId: string, userName: string) => Promise<void>;
  toggleMic: () => void;
  setLanguageConfig: (config: LanguageConfig) => void;
  refreshDevices: () => Promise<void>;
  setInputDevice: (deviceId: string) => void;
  setOutputDevice: (deviceId: string) => void;
  setProMode: (enabled: boolean) => void;
  requestTalkingStick: () => void;
  releaseTalkingStick: () => void;
  handleIncomingEvent: (event: TranslationEvent, senderId: string) => void;
  onAudioChunkReceived: ((data: Float32Array, senderId: string) => void) | null;
  setAudioChunkListener: (cb: (data: Float32Array, senderId: string) => void) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  myId: networkService.getMyId(),
  isInitialized: false,
  isMicActive: false,
  volumeLevel: 0,
  transcripts: [],
  roomState: {
    roomId: '',
    hostId: '', 
    speakerId: null,
    isActive: true,
    peers: {},
    languageConfig: {
      sourceLanguage: 'en-US',
      targetLanguage: 'es-ES'
    }
  },
  availableDevices: [],
  selectedInputDeviceId: '',
  selectedOutputDeviceId: '',
  isProMode: false, 
  onAudioChunkReceived: null,

  initialize: async (roomId: string, userName: string) => {
    networkService.onHostChanged((hostId) => {
      set((state) => ({
        roomState: { ...state.roomState, hostId }
      }));
    });

    networkService.onPeerJoin((peerId) => {
      set((state) => {
        const newPeers = { ...state.roomState.peers };
        if (!newPeers[peerId]) {
          newPeers[peerId] = {
            id: peerId,
            name: `User ${peerId.slice(0,4)}`, 
            role: PeerRole.GUEST,
            isOnline: true,
            joinedAt: Date.now()
          };
        }
        return { roomState: { ...state.roomState, peers: newPeers } };
      });
    });

    networkService.onPeerLeave((peerId) => {
      set((state) => {
        const newPeers = { ...state.roomState.peers };
        delete newPeers[peerId];
        const speakerId = state.roomState.speakerId === peerId ? null : state.roomState.speakerId;
        return { roomState: { ...state.roomState, peers: newPeers, speakerId } };
      });
    });

    networkService.onMessage((event, senderId) => {
      get().handleIncomingEvent(event, senderId);
    });

    audioService.onVoiceActivity((isActive) => {});
    
    // CPU OPTIMIZATION: Only update UI-bound volume state if document is visible
    setInterval(() => {
      if (get().isMicActive && !document.hidden) {
        set({ volumeLevel: audioService.getVolumeLevel() });
      }
    }, 100);

    await networkService.joinRoom(roomId);
    get().refreshDevices();

    const myId = networkService.getMyId();
    set((state) => ({
      myId,
      isInitialized: true,
      roomState: {
        ...state.roomState,
        roomId,
        peers: {
          ...state.roomState.peers,
          [myId]: {
            id: myId,
            name: userName,
            role: PeerRole.GUEST, 
            isOnline: true,
            joinedAt: Date.now()
          }
        }
      }
    }));
  },

  refreshDevices: async () => {
    const devices = await audioService.getDevices();
    set({ availableDevices: devices });
  },

  setInputDevice: (deviceId: string) => {
    set({ selectedInputDeviceId: deviceId });
    if (get().isMicActive) {
      get().toggleMic(); 
      setTimeout(() => get().toggleMic(), 100);
    }
  },

  setOutputDevice: async (deviceId: string) => {
    set({ selectedOutputDeviceId: deviceId });
    await audioService.setOutputDevice(deviceId);
  },

  setProMode: (enabled: boolean) => {
    set({ isProMode: enabled });
    // Restart mic to apply new constraints (Raw vs Processed)
    if (get().isMicActive) {
      get().toggleMic(); 
      setTimeout(() => get().toggleMic(), 100);
    }
  },

  toggleMic: async () => {
    const { isMicActive, requestTalkingStick, releaseTalkingStick, selectedInputDeviceId, isProMode } = get();
    
    if (!isMicActive) {
      try {
        await audioService.startCapture((data) => {
          const { roomState, myId, onAudioChunkReceived } = get();
          
          if (roomState.speakerId === myId) {
            if (onAudioChunkReceived) {
              onAudioChunkReceived(data, myId);
            }
            const serialized = float32ToBase64(data);
            networkService.broadcast({
              id: crypto.randomUUID(),
              type: EventType.AUDIO_CHUNK,
              senderId: myId,
              timestamp: Date.now(),
              payload: {
                data: serialized,
                sampleRate: 16000,
                sequenceId: Date.now()
              } as AudioChunkPayload
            });
          }
        }, selectedInputDeviceId, isProMode); // Pass Pro Mode flag
        
        set({ isMicActive: true });
        requestTalkingStick(); 

      } catch (e) {
        console.error("Failed to start mic", e);
      }
    } else {
      audioService.stopCapture();
      set({ isMicActive: false, volumeLevel: 0 });
      releaseTalkingStick();
    }
  },

  setLanguageConfig: (config) => {
    set((state) => ({ 
      roomState: { ...state.roomState, languageConfig: config } 
    }));
  },

  setAudioChunkListener: (cb) => {
    set({ onAudioChunkReceived: cb });
  },

  requestTalkingStick: () => {
    const { myId, roomState } = get();
    const isHost = myId === roomState.hostId;

    if (isHost) {
      const newRoomState = { ...roomState, speakerId: myId };
      set({ roomState: newRoomState });

      networkService.broadcast({
        id: crypto.randomUUID(),
        type: EventType.CONTROL_SIGNAL,
        senderId: myId,
        timestamp: Date.now(),
        payload: {
          signal: ControlSignal.GRANT_TOKEN,
          targetPeerId: myId
        } as ControlPayload
      });

    } else {
      networkService.sendToPeer(roomState.hostId, {
        id: crypto.randomUUID(),
        type: EventType.CONTROL_SIGNAL,
        senderId: myId,
        timestamp: Date.now(),
        payload: {
          signal: ControlSignal.REQUEST_TOKEN,
          targetPeerId: myId
        } as ControlPayload
      });
    }
  },

  releaseTalkingStick: () => {
    const { myId, roomState } = get();
    
    if (roomState.speakerId === myId) {
      set({ roomState: { ...roomState, speakerId: null } });

      networkService.broadcast({
        id: crypto.randomUUID(),
        type: EventType.CONTROL_SIGNAL,
        senderId: myId,
        timestamp: Date.now(),
        payload: {
          signal: ControlSignal.RELEASE_TOKEN
        } as ControlPayload
      });
    }
  },

  handleIncomingEvent: (event, senderId) => {
    const { myId, roomState, onAudioChunkReceived } = get();

    switch (event.type) {
      case EventType.AUDIO_CHUNK:
        if (senderId !== myId) {
          const payload = event.payload as AudioChunkPayload;
          let floatArray: Float32Array;
          if (payload.data.includes(',')) {
            floatArray = new Float32Array(payload.data.split(',').map(Number));
          } else {
            floatArray = base64ToFloat32(payload.data);
          }
          
          if (senderId === 'TRANSLATOR_BOT') {
            audioService.playAudioQueue(floatArray, payload.sampleRate || 24000);
          } else {
            audioService.playAudioQueue(floatArray, payload.sampleRate || 16000);
            if (onAudioChunkReceived) {
              onAudioChunkReceived(floatArray, senderId);
            }
          }
        }
        break;

      case EventType.CONTROL_SIGNAL:
        const payload = event.payload as ControlPayload;
        
        if (payload.signal === ControlSignal.REQUEST_TOKEN) {
          if (myId === roomState.hostId) {
             const granteeId = payload.targetPeerId || senderId;
             const grantEvent: TranslationEvent = {
               id: crypto.randomUUID(),
               type: EventType.CONTROL_SIGNAL,
               senderId: myId,
               timestamp: Date.now(),
               payload: {
                 signal: ControlSignal.GRANT_TOKEN,
                 targetPeerId: granteeId
               } as ControlPayload
             };
             networkService.broadcast(grantEvent);
             set({ roomState: { ...roomState, speakerId: granteeId } });
          }
        }

        if (payload.signal === ControlSignal.GRANT_TOKEN) {
          const newSpeakerId = payload.targetPeerId;
          set({ roomState: { ...roomState, speakerId: newSpeakerId || null } });
        }

        if (payload.signal === ControlSignal.RELEASE_TOKEN) {
          set({ roomState: { ...roomState, speakerId: null } });
        }
        break;

      case EventType.TRANSCRIPTION:
        const transPayload = event.payload as TranscriptionPayload;
        set((state) => ({
          transcripts: [
            ...state.transcripts,
            { ...transPayload, senderId, timestamp: event.timestamp }
          ]
        }));
        break;
    }
  }
}));
