
import { useState, useEffect, useRef } from 'react';

interface TabState {
    id: string;
    targetLanguage: string;
    currentRoom: string;
    lastSeen: number;
}

export function useTabCoordination(
    currentRoom: string,
    targetLanguages: string[]
) {
    const [otherTabs, setOtherTabs] = useState<TabState[]>([]);
    const channelRef = useRef<BroadcastChannel | null>(null);
    const myIdRef = useRef<string>(Math.random().toString(36).substring(7));

    // Initialize Channel
    useEffect(() => {
        const bc = new BroadcastChannel('lingua_flow_tabs');
        channelRef.current = bc;

        bc.onmessage = (event) => {
            const { type, payload } = event.data;
            if (type === 'HEARTBEAT') {
                setOtherTabs(prev => {
                    const others = prev.filter(t => t.id !== payload.id); // Remove old entry
                    return [...others, { ...payload, lastSeen: Date.now() }];
                });
            }
        };

        return () => {
            bc.close();
        };
    }, []);

    // Send Heartbeat Loop
    useEffect(() => {
        const interval = setInterval(() => {
            if (channelRef.current) {
                // We broadcast the first selected language as the "Main" language of this tab
                const mainLang = targetLanguages[0] || 'Okänt';
                
                channelRef.current.postMessage({
                    type: 'HEARTBEAT',
                    payload: {
                        id: myIdRef.current,
                        targetLanguage: mainLang,
                        currentRoom: currentRoom,
                        timestamp: Date.now()
                    }
                });
            }
            
            // Cleanup dead tabs (older than 5s)
            setOtherTabs(prev => prev.filter(t => Date.now() - t.lastSeen < 5000));

        }, 1000);

        return () => clearInterval(interval);
    }, [currentRoom, targetLanguages]);

    return {
        otherTabs
    };
}
